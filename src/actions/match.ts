"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserPreferenceProfile, type PreferenceProfile } from "@/lib/match/getUserPreferenceProfile";

export type MatchListing = {
  id: string;
  name: string;
  slug: string;
  breed: string | null;
  gender: string | null;
  color: string | null;
  age_years: number | null;
  height_hands: number | null;
  price: number | null;
  location_city: string | null;
  location_state: string | null;
  completeness_score: number | null;
  favorite_count: number | null;
  discipline_ids: string[] | null;
  verification_tier?: string | null;
  seller_id?: string;
  media: { url: string; is_primary: boolean }[];
  created_at?: string;
};

export type ScoredMatchListing = MatchListing & {
  _score?: number;
  _matchPercent?: number;
  _debug?: {
    recency: number;
    completeness: number;
    discipline: number;
    price: number;
    location: number;
    height: number;
    verification: number;
    sellerPenalty: number;
    finalScore: number;
    rankPosition: number;
    exploration: boolean;
  };
};

type MatchFilters = {
  q?: string;
  discipline?: string;
  minPrice?: string;
  maxPrice?: string;
  state?: string;
  gender?: string;
  breed?: string;
  minHeight?: string;
  maxHeight?: string;
  minAge?: string;
  maxAge?: string;
  henneke?: string;
  soundness?: string;
  region?: string;
};

const REGION_STATES: Record<string, string[]> = {
  southeast: ["FL", "GA", "SC", "NC", "VA", "KY", "TN", "AL", "MS", "LA"],
  northeast: ["NY", "NJ", "PA", "CT", "MA", "MD", "NH", "VT", "ME", "RI"],
  midwest: ["OH", "IL", "MI", "IN", "WI", "MN", "MO", "IA", "KS", "NE"],
  west: ["CA", "OR", "WA", "CO", "MT", "ID", "WY", "UT", "NV"],
  southwest: ["TX", "AZ", "NM", "OK", "AR"],
};

const FETCH_MULTIPLIER = 3;
const SELLER_PENALTY = 0.85;

/**
 * Score a listing against user preferences.
 * Returns 0–100 composite score with match percentage.
 *
 * Components (total 100):
 *   discipline: 25, price: 20, height: 10, location: 10,
 *   recency: 15, completeness: 10, verification: 10
 */
function scoreListing(
  listing: MatchListing & { created_at?: string },
  profile: PreferenceProfile | null
): { total: number; matchPercent: number; recency: number; completeness: number; discipline: number; price: number; location: number; height: number; verification: number } {
  let recency = 0;
  if (listing.created_at) {
    const ageMs = Date.now() - new Date(listing.created_at).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    recency = Math.max(0, 15 * (1 - ageDays / 30));
  }

  const completeness = Math.min(10, ((listing.completeness_score ?? 0) / 1000) * 10);

  // Verification tier boost
  const verificationBoosts: Record<string, number> = { gold: 10, silver: 7, bronze: 4, none: 0 };
  const verification = verificationBoosts[listing.verification_tier ?? "none"] ?? 0;

  if (!profile) {
    const total = recency + completeness + verification;
    return { total, matchPercent: 0, recency, completeness, discipline: 0, price: 0, location: 0, height: 0, verification };
  }

  let discipline = 0;
  if (profile.topDisciplines.length > 0 && listing.discipline_ids?.length) {
    for (const d of listing.discipline_ids) {
      const rank = profile.topDisciplines.indexOf(d);
      if (rank !== -1) {
        discipline = Math.max(discipline, 25 - rank * 5);
      }
    }
  }

  let price = 0;
  if (profile.preferredPriceRange && listing.price != null) {
    const { min, max } = profile.preferredPriceRange;
    const range = max - min || 1;
    if (listing.price >= min && listing.price <= max) {
      price = 20;
    } else {
      const distance = listing.price < min ? min - listing.price : listing.price - max;
      price = Math.max(0, 20 * (1 - distance / range));
    }
  }

  let location = 0;
  if (profile.preferredLocations.length > 0 && listing.location_state) {
    const rank = profile.preferredLocations.indexOf(listing.location_state);
    if (rank !== -1) {
      location = Math.max(0, 10 - rank * 2);
    }
  }

  let height = 0;
  if (profile.preferredHeightRange && listing.height_hands != null) {
    const { min, max } = profile.preferredHeightRange;
    const range = max - min || 1;
    if (listing.height_hands >= min && listing.height_hands <= max) {
      height = 10;
    } else {
      const distance = listing.height_hands < min ? min - listing.height_hands : listing.height_hands - max;
      height = Math.max(0, 10 * (1 - distance / range));
    }
  }

  const total = recency + completeness + discipline + price + location + height + verification;

  // Match percent: preference-based components only (exclude recency/completeness/verification)
  // Max preference score = discipline(25) + price(20) + height(10) + location(10) = 65
  const preferenceScore = discipline + price + height + location;
  const matchPercent = Math.round((preferenceScore / 65) * 100);

  return { total, matchPercent, recency, completeness, discipline, price, location, height, verification };
}

/**
 * Seeded PRNG (mulberry32). Deterministic shuffle for stable ranking within a session.
 */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = seededRandom(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/**
 * Fetch a batch of listings for Match Mode.
 * Scores listings against user preferences, applies seller fairness,
 * adaptive exploration split, and seeded shuffle for stability.
 */
export async function getMatchBatch(
  excludeIds: string[] = [],
  limit = 20,
  filters: MatchFilters = {},
  debug = false,
  sessionSeed?: number
): Promise<{ listings: ScoredMatchListing[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const serverExcludeIds = new Set(excludeIds);

  const profilePromise = getUserPreferenceProfile();

  if (user) {
    const [{ data: passes }, { data: favs }] = await Promise.all([
      supabase.from("listing_passes").select("listing_id").eq("user_id", user.id),
      supabase.from("listing_favorites").select("listing_id").eq("user_id", user.id),
    ]);
    passes?.forEach((p) => serverExcludeIds.add(p.listing_id));
    favs?.forEach((f) => serverExcludeIds.add(f.listing_id));
  }

  const profile = await profilePromise;

  const fetchLimit = limit * FETCH_MULTIPLIER;

  let query = supabase
    .from("horse_listings")
    .select(
      `id, name, slug, breed, gender, color, age_years, height_hands,
       price, location_city, location_state, completeness_score, favorite_count,
       discipline_ids, verification_tier, seller_id, created_at, media:listing_media(url, is_primary)`
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(fetchLimit);

  // Apply browse-compatible filters
  if (filters.q) {
    const q = filters.q.trim();
    if (q.length <= 2) {
      query = query.or(`name.ilike.%${q}%,breed.ilike.%${q}%`);
    } else {
      query = query.textSearch("search_vector", q, { type: "websearch" });
    }
  }
  if (filters.state) query = query.eq("location_state", filters.state);
  if (filters.gender) query = query.eq("gender", filters.gender);
  if (filters.minPrice) query = query.gte("price", parseInt(filters.minPrice) * 100);
  if (filters.maxPrice) query = query.lte("price", parseInt(filters.maxPrice) * 100);
  if (filters.minHeight) query = query.gte("height_hands", parseFloat(filters.minHeight));
  if (filters.maxHeight) query = query.lte("height_hands", parseFloat(filters.maxHeight));
  if (filters.breed) query = query.eq("breed", filters.breed);
  if (filters.minAge) query = query.gte("age_years", parseInt(filters.minAge));
  if (filters.maxAge) query = query.lte("age_years", parseInt(filters.maxAge));
  if (filters.henneke) query = query.eq("henneke_score", parseInt(filters.henneke));
  if (filters.soundness) query = query.eq("soundness_level", filters.soundness);
  if (filters.discipline) query = query.contains("discipline_ids", [filters.discipline]);
  if (filters.region) {
    const states = REGION_STATES[filters.region];
    if (states) query = query.in("location_state", states);
  }

  // Exclude seen IDs — cap at 500 to avoid query size issues
  const excludeArray = Array.from(serverExcludeIds).slice(-500);
  if (excludeArray.length > 0) {
    query = query.not("id", "in", `(${excludeArray.join(",")})`);
  }

  const { data, error } = await query;

  if (error) {
    return { listings: [], error: error.message };
  }

  const pool = (data ?? []) as unknown as (MatchListing & { created_at: string; seller_id: string })[];

  if (pool.length === 0) {
    return { listings: [] };
  }

  // Score all listings
  const scored: (ScoredMatchListing & { _rawScore: number; _sellerPenalty: number })[] = pool.map((listing) => {
    const scores = scoreListing(listing, profile);
    return {
      ...listing,
      _score: scores.total,
      _matchPercent: scores.matchPercent,
      _rawScore: scores.total,
      _sellerPenalty: 1,
      _debug: debug ? {
        recency: Math.round(scores.recency * 10) / 10,
        completeness: Math.round(scores.completeness * 10) / 10,
        discipline: Math.round(scores.discipline * 10) / 10,
        price: Math.round(scores.price * 10) / 10,
        location: Math.round(scores.location * 10) / 10,
        height: Math.round(scores.height * 10) / 10,
        verification: Math.round(scores.verification * 10) / 10,
        sellerPenalty: 1,
        finalScore: scores.total,
        rankPosition: 0,
        exploration: false,
      } : undefined,
    };
  });

  // Sort by raw score desc
  scored.sort((a, b) => (b._rawScore) - (a._rawScore));

  // Apply seller fairness penalty — if a seller already appears in the top results, penalize subsequent listings
  const sellerCounts = new Map<string, number>();
  for (const listing of scored) {
    const sid = listing.seller_id;
    if (!sid) continue;
    const count = sellerCounts.get(sid) ?? 0;
    if (count > 0) {
      // Each additional listing from same seller gets compounding penalty
      const penalty = Math.pow(SELLER_PENALTY, count);
      listing._score = listing._rawScore * penalty;
      listing._sellerPenalty = penalty;
      if (listing._debug) {
        listing._debug.sellerPenalty = Math.round(penalty * 100) / 100;
        listing._debug.finalScore = Math.round(listing._score * 10) / 10;
      }
    } else if (listing._debug) {
      listing._debug.finalScore = Math.round(listing._rawScore * 10) / 10;
    }
    sellerCounts.set(sid, count + 1);
  }

  // Re-sort after seller penalty
  scored.sort((a, b) => (b._score ?? 0) - (a._score ?? 0));

  // Assign rank positions for debug
  if (debug) {
    scored.forEach((l, i) => {
      if (l._debug) l._debug.rankPosition = i + 1;
    });
  }

  // Adaptive exploration split — only when pool is large enough
  const useExploration = pool.length >= limit * 2;
  const rankedCount = useExploration ? Math.ceil(limit * 0.7) : limit;
  const explorationCount = useExploration ? limit - rankedCount : 0;

  const ranked = scored.slice(0, rankedCount);
  let exploration: typeof scored = [];

  if (explorationCount > 0) {
    const remaining = scored.slice(rankedCount);
    const seed = sessionSeed ?? Date.now();
    seededShuffle(remaining, seed);
    exploration = remaining.slice(0, explorationCount);
    if (debug) {
      exploration.forEach((l) => {
        if (l._debug) l._debug.exploration = true;
      });
    }
  }

  const final = [...ranked, ...exploration];

  // Clean output
  const listings: ScoredMatchListing[] = final.map((l) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created_at: _ca, _rawScore: _rs, _sellerPenalty: _sp, ...rest } = l;
    if (!debug) {
      delete rest._score;
      delete rest._debug;
    }
    return rest;
  });

  return { listings };
}

/**
 * Record a pass (swipe left) for the current user.
 */
export async function passListing(
  listingId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: true };
  }

  const { error } = await supabase
    .from("listing_passes")
    .upsert(
      { listing_id: listingId, user_id: user.id },
      { onConflict: "listing_id,user_id" }
    );

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
