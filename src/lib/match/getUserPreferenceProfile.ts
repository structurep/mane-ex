"use server";

import { createClient } from "@/lib/supabase/server";

export type PreferenceProfile = {
  topDisciplines: string[];
  preferredPriceRange: { min: number; max: number } | null;
  preferredHeightRange: { min: number; max: number } | null;
  preferredLocations: string[];
  favoriteRate: number;
  totalInteractions: number;
  /** 0–1 confidence score: higher means more signal to work with */
  confidence: number;
};

const COLD_START_THRESHOLD = 10;

// In-memory per-user cache (15 min TTL)
const profileCache = new Map<string, { profile: PreferenceProfile | null; ts: number }>();
const CACHE_TTL = 15 * 60 * 1000;

/**
 * Analyze listing_interactions + favorites for the current user.
 * Returns null for unauthenticated users or cold-start users (<10 interactions).
 * Weights: favorite=3, open=2, view=1, pass=-1
 * Cached per user for 15 minutes.
 */
export async function getUserPreferenceProfile(): Promise<PreferenceProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Check cache
  const cached = profileCache.get(user.id);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.profile;
  }

  // Fetch interactions and favorites in parallel
  const [{ data: rows }, { data: favListings }] = await Promise.all([
    supabase
      .from("listing_interactions")
      .select("interaction_type, price, discipline, location")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("listing_favorites")
      .select("listing:horse_listings!listing_id(height_hands, price, discipline_ids, location_state)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (!rows || rows.length < COLD_START_THRESHOLD) {
    profileCache.set(user.id, { profile: null, ts: Date.now() });
    return null;
  }

  const weights: Record<string, number> = {
    favorite: 3,
    open: 2,
    view: 1,
    pass: -1,
  };

  // Discipline scoring
  const disciplineScores = new Map<string, number>();
  // Price buckets
  const favoritePrices: number[] = [];
  // Height buckets from favorites
  const favoriteHeights: number[] = [];
  // Location scoring
  const locationScores = new Map<string, number>();

  let favorites = 0;
  let passes = 0;

  for (const row of rows) {
    const w = weights[row.interaction_type] ?? 0;

    if (row.interaction_type === "favorite") favorites++;
    if (row.interaction_type === "pass") passes++;

    if (row.discipline) {
      disciplineScores.set(
        row.discipline,
        (disciplineScores.get(row.discipline) ?? 0) + w
      );
    }

    if (row.price != null) {
      if (row.interaction_type === "favorite") favoritePrices.push(Number(row.price));
    }

    if (row.location) {
      locationScores.set(
        row.location,
        (locationScores.get(row.location) ?? 0) + w
      );
    }
  }

  // Extract height from favorited listings
  if (favListings) {
    for (const fav of favListings) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listing = (fav as any).listing;
      if (listing && typeof listing === "object" && !Array.isArray(listing)) {
        if (listing.height_hands != null) {
          favoriteHeights.push(Number(listing.height_hands));
        }
      }
    }
  }

  // Top disciplines (positive score, sorted desc)
  const topDisciplines = [...disciplineScores.entries()]
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([d]) => d);

  // Price range from favorites (p10–p90)
  let preferredPriceRange: { min: number; max: number } | null = null;
  if (favoritePrices.length >= 3) {
    favoritePrices.sort((a, b) => a - b);
    const p10 = favoritePrices[Math.floor(favoritePrices.length * 0.1)]!;
    const p90 = favoritePrices[Math.floor(favoritePrices.length * 0.9)]!;
    preferredPriceRange = { min: p10, max: p90 };
  }

  // Height range from favorites (p10–p90)
  let preferredHeightRange: { min: number; max: number } | null = null;
  if (favoriteHeights.length >= 3) {
    favoriteHeights.sort((a, b) => a - b);
    const p10 = favoriteHeights[Math.floor(favoriteHeights.length * 0.1)]!;
    const p90 = favoriteHeights[Math.floor(favoriteHeights.length * 0.9)]!;
    preferredHeightRange = { min: p10, max: p90 };
  }

  // Top locations (positive score)
  const preferredLocations = [...locationScores.entries()]
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([l]) => l);

  const total = favorites + passes;
  const favoriteRate = total > 0 ? favorites / total : 0;

  // Confidence score: 0–1
  // Based on: interaction count, favorite count, signal diversity
  const interactionFactor = Math.min(1, rows.length / 50); // saturates at 50
  const favoriteFactor = Math.min(1, favorites / 10); // saturates at 10
  const diversityFactor = Math.min(1, (topDisciplines.length + preferredLocations.length) / 6);
  const confidence = Math.round((interactionFactor * 0.4 + favoriteFactor * 0.4 + diversityFactor * 0.2) * 100) / 100;

  const profile: PreferenceProfile = {
    topDisciplines,
    preferredPriceRange,
    preferredHeightRange,
    preferredLocations,
    favoriteRate,
    totalInteractions: rows.length,
    confidence,
  };

  profileCache.set(user.id, { profile, ts: Date.now() });
  return profile;
}
