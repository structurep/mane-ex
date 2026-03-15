import { createClient } from "@/lib/supabase/server";

export type PricePosition = "Below Market" | "Fair Market" | "Above Market";

export type PricePositioning = {
  position: PricePosition;
  percentile: number;
};

type ComparableSet = {
  prices: number[]; // sorted ascending
  p25: number;
  p75: number;
};

// ── In-memory cache (10-minute TTL) ──────────
let cache: { data: ListingComps; timestamp: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000;

type ListingRow = {
  id: string;
  price: number | null;
  discipline_ids: string[] | null;
  age_years: number | null;
  height_hands: number | null;
};

type ListingComps = Map<string, ListingRow[]>;

function ageBand(age: number | null): string {
  if (age == null) return "unknown";
  if (age <= 5) return "young";
  if (age <= 12) return "prime";
  return "senior";
}

function heightBand(hh: number | null): string {
  if (hh == null) return "unknown";
  if (hh < 14.2) return "small";
  if (hh < 16) return "medium";
  return "tall";
}

function compKey(discipline: string | null, age: number | null, height: number | null): string {
  return `${discipline ?? "any"}|${ageBand(age)}|${heightBand(height)}`;
}

function percentile(sortedPrices: number[], p: number): number {
  if (sortedPrices.length === 0) return 0;
  const idx = (p / 100) * (sortedPrices.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sortedPrices[lower];
  return sortedPrices[lower] + (sortedPrices[upper] - sortedPrices[lower]) * (idx - lower);
}

function computePercentileRank(sortedPrices: number[], price: number): number {
  let below = 0;
  for (const p of sortedPrices) {
    if (p < price) below++;
    else break;
  }
  return sortedPrices.length > 0 ? Math.round((below / sortedPrices.length) * 100) : 50;
}

async function loadComps(): Promise<ListingComps> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("horse_listings")
    .select("id, price, discipline_ids, age_years, height_hands")
    .eq("status", "active")
    .not("price", "is", null);

  if (error || !data?.length) {
    cache = { data: new Map(), timestamp: Date.now() };
    return cache.data;
  }

  // Group listings by comp key
  const groups = new Map<string, ListingRow[]>();
  for (const row of data as ListingRow[]) {
    if (!row.price) continue;
    const primaryDisc = row.discipline_ids?.[0] ?? null;
    const key = compKey(primaryDisc, row.age_years, row.height_hands);
    let group = groups.get(key);
    if (!group) { group = []; groups.set(key, group); }
    group.push(row);
  }

  cache = { data: groups, timestamp: Date.now() };
  return groups;
}

/**
 * Get price positioning for a listing against comparable active listings.
 * Comparables: same primary discipline + age band + height band.
 * Falls back to broader bands if comp set is too small (<5).
 */
export async function getPricePositioning(listing: {
  id: string;
  price: number | null;
  discipline_ids?: string[] | null;
  age_years?: number | null;
  height_hands?: number | null;
}): Promise<PricePositioning | null> {
  if (!listing.price) return null;

  const groups = await loadComps();
  const primaryDisc = listing.discipline_ids?.[0] ?? null;

  // Try exact match first, then progressively broader
  const keys = [
    compKey(primaryDisc, listing.age_years ?? null, listing.height_hands ?? null),
    compKey(primaryDisc, listing.age_years ?? null, null),
    compKey(primaryDisc, null, null),
    compKey(null, null, null),
  ];

  let prices: number[] = [];
  for (const key of keys) {
    const group = groups.get(key);
    if (group && group.length >= 5) {
      prices = group
        .filter((r) => r.id !== listing.id)
        .map((r) => r.price!)
        .sort((a, b) => a - b);
      if (prices.length >= 3) break;
    }
  }

  // If still no comps, gather all active prices
  if (prices.length < 3) {
    const all: number[] = [];
    for (const group of groups.values()) {
      for (const r of group) {
        if (r.id !== listing.id && r.price) all.push(r.price);
      }
    }
    prices = all.sort((a, b) => a - b);
  }

  if (prices.length < 3) return null;

  const p25 = percentile(prices, 25);
  const p75 = percentile(prices, 75);
  const pctRank = computePercentileRank(prices, listing.price);

  let position: PricePosition;
  if (listing.price < p25) position = "Below Market";
  else if (listing.price > p75) position = "Above Market";
  else position = "Fair Market";

  return { position, percentile: pctRank };
}

/**
 * Batch price positioning for multiple listings.
 * Single cache load, multiple position calculations.
 */
export async function getBatchPricePositioning(
  listings: Array<{ id: string; price: number | null; discipline_ids?: string[] | null; age_years?: number | null; height_hands?: number | null }>
): Promise<Map<string, PricePositioning>> {
  // Prime the cache with a single load
  await loadComps();

  const results = new Map<string, PricePositioning>();
  for (const listing of listings) {
    const pos = await getPricePositioning(listing);
    if (pos) results.set(listing.id, pos);
  }
  return results;
}
