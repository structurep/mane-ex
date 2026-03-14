"use server";

import { createClient } from "@/lib/supabase/server";

export type TrendingListing = {
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
  media: { url: string; is_primary: boolean }[];
  trending_score: number;
};

// ── In-memory cache (5-minute TTL) ──────────
let cache: { listings: TrendingListing[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Get top trending listings based on swipe engagement in the last 72 hours.
 * Scoring: favorites × 3 + opens × 1 − passes × 1
 * Minimum 5 interactions to qualify.
 * Results cached in memory for 5 minutes.
 */
export async function getTrendingListings(limit = 20): Promise<{
  listings: TrendingListing[];
  error?: string;
}> {
  // Return cached if fresh
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return { listings: cache.listings.slice(0, limit) };
  }

  const supabase = await createClient();

  // Get engagement counts from swipe_events + listing_interactions in last 72h
  const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

  // Aggregate swipe events
  const { data: swipeData, error: swipeError } = await supabase
    .from("swipe_events")
    .select("listing_id, direction")
    .gte("created_at", cutoff);

  if (swipeError) return { listings: [], error: swipeError.message };

  // Also pull from listing_interactions for opens
  const { data: interactionData } = await supabase
    .from("listing_interactions")
    .select("listing_id, type")
    .gte("created_at", cutoff)
    .in("type", ["favorite", "pass", "open"]);

  // Score each listing
  const scores = new Map<string, { favorites: number; passes: number; opens: number }>();

  function getOrCreate(id: string) {
    let entry = scores.get(id);
    if (!entry) {
      entry = { favorites: 0, passes: 0, opens: 0 };
      scores.set(id, entry);
    }
    return entry;
  }

  for (const row of swipeData ?? []) {
    const entry = getOrCreate(row.listing_id);
    if (row.direction === "favorite") entry.favorites++;
    else entry.passes++;
  }

  for (const row of interactionData ?? []) {
    const entry = getOrCreate(row.listing_id);
    if (row.type === "open") entry.opens++;
    else if (row.type === "favorite") entry.favorites++;
    else if (row.type === "pass") entry.passes++;
  }

  // Calculate scores and filter
  const scored: { id: string; score: number }[] = [];
  for (const [id, counts] of scores) {
    const total = counts.favorites + counts.passes + counts.opens;
    if (total < 5) continue; // Minimum interaction threshold
    const score = counts.favorites * 3 + counts.opens * 1 - counts.passes * 1;
    if (score > 0) scored.push({ id, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const topIds = scored.slice(0, 30).map((s) => s.id);

  if (topIds.length === 0) {
    cache = { listings: [], timestamp: Date.now() };
    return { listings: [] };
  }

  // Fetch listing details
  const { data: listings, error: listingError } = await supabase
    .from("horse_listings")
    .select("id, name, slug, breed, gender, color, age_years, height_hands, price, location_city, location_state, completeness_score, completeness_grade, favorite_count, published_at, media:listing_media(url, is_primary)")
    .in("id", topIds)
    .eq("status", "active");

  if (listingError) return { listings: [], error: listingError.message };

  // Merge scores and sort
  const scoreMap = new Map(scored.map((s) => [s.id, s.score]));
  const result: TrendingListing[] = (listings ?? [])
    .map((l) => ({
      ...(l as unknown as Omit<TrendingListing, "trending_score" | "media">),
      media: (l.media ?? []) as unknown as { url: string; is_primary: boolean }[],
      trending_score: scoreMap.get(l.id) ?? 0,
    }))
    .sort((a, b) => b.trending_score - a.trending_score);

  cache = { listings: result, timestamp: Date.now() };
  return { listings: result.slice(0, limit) };
}

/**
 * Get IDs of top 10 trending listings (for badge display).
 * Uses same cache as getTrendingListings.
 */
export async function getTrendingIds(): Promise<Set<string>> {
  const { listings } = await getTrendingListings(10);
  return new Set(listings.map((l) => l.id));
}
