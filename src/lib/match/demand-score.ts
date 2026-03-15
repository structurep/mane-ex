import { createClient } from "@/lib/supabase/server";

export type DemandLevel = "Low Demand" | "Moderate Demand" | "High Demand";

export type DemandScore = {
  score: number;
  label: DemandLevel;
};

// ── In-memory cache (10-minute TTL) ──────────
let cache: { scores: Map<string, DemandScore>; timestamp: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000;

function classify(score: number): DemandLevel {
  if (score >= 70) return "High Demand";
  if (score >= 40) return "Moderate Demand";
  return "Low Demand";
}

/**
 * Get demand scores for all active listings based on 7-day swipe engagement.
 * Score formula: (favorites × 4) + (opens × 2) − (passes × 1)
 * Normalized to 0–100 scale.
 * Cached for 10 minutes.
 */
export async function getDemandScores(): Promise<Map<string, DemandScore>> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.scores;
  }

  const supabase = await createClient();
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: swipeData, error } = await supabase
    .from("swipe_events")
    .select("listing_id, direction")
    .gte("created_at", cutoff);

  if (error || !swipeData?.length) {
    cache = { scores: new Map(), timestamp: Date.now() };
    return cache.scores;
  }

  // Aggregate per listing
  const raw = new Map<string, { favorites: number; passes: number }>();
  for (const row of swipeData) {
    let e = raw.get(row.listing_id);
    if (!e) { e = { favorites: 0, passes: 0 }; raw.set(row.listing_id, e); }
    if (row.direction === "favorite") e.favorites++;
    else e.passes++;
  }

  // Calculate raw scores
  const rawScores: { id: string; raw: number }[] = [];
  let maxRaw = 0;
  for (const [id, counts] of raw) {
    const total = counts.favorites + counts.passes;
    if (total < 3) continue; // Need minimum interactions
    const rawScore = counts.favorites * 4 - counts.passes;
    rawScores.push({ id, raw: rawScore });
    if (rawScore > maxRaw) maxRaw = rawScore;
  }

  // Normalize to 0–100
  const scores = new Map<string, DemandScore>();
  for (const { id, raw: rawScore } of rawScores) {
    const normalized = maxRaw > 0
      ? Math.max(0, Math.min(100, Math.round((rawScore / maxRaw) * 100)))
      : 0;
    scores.set(id, { score: normalized, label: classify(normalized) });
  }

  cache = { scores, timestamp: Date.now() };
  return scores;
}

/**
 * Get demand score for a single listing.
 * Uses the shared cached map.
 */
export async function getListingDemand(listingId: string): Promise<DemandScore | null> {
  const scores = await getDemandScores();
  return scores.get(listingId) ?? null;
}
