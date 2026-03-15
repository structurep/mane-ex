"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserPreferenceProfile, type PreferenceProfile } from "@/lib/match/getUserPreferenceProfile";

export type RecommendedListing = {
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
  completeness_grade: string | null;
  favorite_count: number | null;
  published_at: string | null;
  verification_tier: string | null;
  discipline_ids: string[] | null;
  media: { url: string; is_primary: boolean }[];
  matchPercent: number;
};

// In-memory cache per user (5 min)
const recCache = new Map<string, { listings: RecommendedListing[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

const VERIFICATION_BOOSTS: Record<string, number> = { gold: 10, silver: 7, bronze: 4, none: 0 };

/**
 * Score a listing against buyer profile for match percentage.
 * Returns 0–100 match percent based on preference alignment.
 */
function computeMatchPercent(
  listing: {
    discipline_ids: string[] | null;
    price: number | null;
    height_hands: number | null;
    location_state: string | null;
    verification_tier: string | null;
    completeness_score: number | null;
    published_at: string | null;
  },
  profile: PreferenceProfile
): { matchPercent: number; totalScore: number } {
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

  let location = 0;
  if (profile.preferredLocations.length > 0 && listing.location_state) {
    const rank = profile.preferredLocations.indexOf(listing.location_state);
    if (rank !== -1) {
      location = Math.max(0, 10 - rank * 2);
    }
  }

  const verification = VERIFICATION_BOOSTS[listing.verification_tier ?? "none"] ?? 0;
  const completeness = Math.min(10, ((listing.completeness_score ?? 0) / 1000) * 10);

  let recency = 0;
  if (listing.published_at) {
    const ageDays = (Date.now() - new Date(listing.published_at).getTime()) / 86400000;
    recency = Math.max(0, 15 * (1 - ageDays / 30));
  }

  const preferenceScore = discipline + price + height + location;
  const matchPercent = Math.round((preferenceScore / 65) * 100);
  const totalScore = preferenceScore + verification + completeness + recency;

  return { matchPercent, totalScore };
}

/**
 * Get recommended horses for the current user.
 * Uses preference profile to score and rank active listings.
 * Excludes passed and favorited listings.
 * Cached per user for 5 minutes.
 */
export async function getRecommendedHorses(): Promise<{
  listings: RecommendedListing[];
  confidence: number;
} | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Check cache
  const cached = recCache.get(user.id);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    // Still need profile for confidence
    const profile = await getUserPreferenceProfile();
    return { listings: cached.listings, confidence: profile?.confidence ?? 0 };
  }

  const profile = await getUserPreferenceProfile();
  if (!profile || profile.confidence < 0.3) {
    return null; // Not enough signal
  }

  // Get exclusion sets in parallel
  const [{ data: passes }, { data: favs }] = await Promise.all([
    supabase.from("listing_passes").select("listing_id").eq("user_id", user.id),
    supabase.from("listing_favorites").select("listing_id").eq("user_id", user.id),
  ]);

  const excludeIds = new Set<string>();
  passes?.forEach((p) => excludeIds.add(p.listing_id));
  favs?.forEach((f) => excludeIds.add(f.listing_id));

  // Fetch candidate listings (active only, limit to 100 for scoring)
  let query = supabase
    .from("horse_listings")
    .select(
      `id, name, slug, breed, gender, color, age_years, height_hands,
       price, location_city, location_state, completeness_score, completeness_grade,
       favorite_count, published_at, verification_tier, discipline_ids,
       media:listing_media!inner(url, is_primary)`
    )
    .eq("status", "active")
    .order("published_at", { ascending: false })
    .limit(100);

  const excludeArray = Array.from(excludeIds).slice(-500);
  if (excludeArray.length > 0) {
    query = query.not("id", "in", `(${excludeArray.join(",")})`);
  }

  const { data: candidates } = await query;
  if (!candidates || candidates.length === 0) return null;

  // Score all candidates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scored = (candidates as any[]).map((l) => {
    const { matchPercent, totalScore } = computeMatchPercent(l, profile);
    return { ...l, matchPercent, _totalScore: totalScore };
  });

  // Sort by total score descending
  scored.sort((a, b) => b._totalScore - a._totalScore);

  // Take top 20 with matchPercent > 0
  const top = scored
    .filter((l) => l.matchPercent > 0)
    .slice(0, 20)
    .map(({ _totalScore: _, ...rest }) => rest as RecommendedListing);

  recCache.set(user.id, { listings: top, ts: Date.now() });

  return { listings: top, confidence: profile.confidence };
}
