import { createClient } from "@/lib/supabase/server";

export type DemandLevel = "Low Demand" | "Moderate Demand" | "High Demand";

export type DemandScore = {
  score: number;
  label: DemandLevel;
};

export type DemandStats = DemandScore & {
  favorites7d: number;
  passes7d: number;
  views7d: number;
  favoriteRate: number;
  pricePosition?: "Below Market" | "Fair Market" | "Above Market" | null;
  pricePercentile?: number | null;
};

// ── In-memory cache (10-minute TTL) ──────────
let cache: { stats: Map<string, DemandStats>; timestamp: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000;

function classify(score: number): DemandLevel {
  if (score >= 70) return "High Demand";
  if (score >= 40) return "Moderate Demand";
  return "Low Demand";
}

/**
 * Get demand stats for all active listings based on 7-day swipe engagement.
 * Score formula: (favorites × 4) − (passes × 1), normalized 0–100.
 * Cached for 10 minutes.
 */
export async function loadDemandStatsMap(): Promise<Map<string, DemandStats>> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.stats;
  }

  const supabase = await createClient();
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch swipe events and view counts in parallel
  const [swipeResult, viewResult] = await Promise.all([
    supabase
      .from("swipe_events")
      .select("listing_id, direction")
      .gte("created_at", cutoff),
    supabase
      .from("horse_listings")
      .select("id, view_count")
      .eq("status", "active"),
  ]);

  const swipeData = swipeResult.data;
  if (swipeResult.error || !swipeData?.length) {
    cache = { stats: new Map(), timestamp: Date.now() };
    return cache.stats;
  }

  // Build view count lookup
  const viewMap = new Map<string, number>();
  for (const row of viewResult.data ?? []) {
    viewMap.set(row.id, row.view_count ?? 0);
  }

  // Aggregate per listing
  const raw = new Map<string, { favorites: number; passes: number }>();
  for (const row of swipeData) {
    let e = raw.get(row.listing_id);
    if (!e) { e = { favorites: 0, passes: 0 }; raw.set(row.listing_id, e); }
    if (row.direction === "favorite") e.favorites++;
    else e.passes++;
  }

  // Calculate raw scores and find max for normalization
  const rawScores: { id: string; raw: number; favorites: number; passes: number }[] = [];
  let maxRaw = 0;
  for (const [id, counts] of raw) {
    const total = counts.favorites + counts.passes;
    if (total < 3) continue;
    const rawScore = counts.favorites * 4 - counts.passes;
    rawScores.push({ id, raw: rawScore, favorites: counts.favorites, passes: counts.passes });
    if (rawScore > maxRaw) maxRaw = rawScore;
  }

  // Normalize to 0–100 and build full stats
  const stats = new Map<string, DemandStats>();
  for (const { id, raw: rawScore, favorites, passes } of rawScores) {
    const normalized = maxRaw > 0
      ? Math.max(0, Math.min(100, Math.round((rawScore / maxRaw) * 100)))
      : 0;
    const views = viewMap.get(id) ?? 0;
    const total = favorites + passes;
    stats.set(id, {
      score: normalized,
      label: classify(normalized),
      favorites7d: favorites,
      passes7d: passes,
      views7d: views,
      favoriteRate: total > 0 ? Math.round((favorites / total) * 100) : 0,
    });
  }

  cache = { stats, timestamp: Date.now() };
  return stats;
}

/**
 * Get demand scores for all active listings (lightweight — DemandScore only).
 * Backwards-compatible with existing consumers.
 */
export async function getDemandScores(): Promise<Map<string, DemandScore>> {
  const stats = await loadDemandStatsMap();
  // Return a view that only exposes score + label
  const scores = new Map<string, DemandScore>();
  for (const [id, s] of stats) {
    scores.set(id, { score: s.score, label: s.label });
  }
  return scores;
}

/**
 * Get demand score for a single listing.
 */
export async function getListingDemand(listingId: string): Promise<DemandScore | null> {
  const scores = await getDemandScores();
  return scores.get(listingId) ?? null;
}

/**
 * Get full demand stats for a single listing (seller dashboard).
 */
export async function getListingDemandStats(listingId: string): Promise<DemandStats | null> {
  const stats = await loadDemandStatsMap();
  return stats.get(listingId) ?? null;
}
