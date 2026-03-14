"use server";

import { createClient } from "@/lib/supabase/server";

export type PreferenceProfile = {
  topDisciplines: string[];
  preferredPriceRange: { min: number; max: number } | null;
  preferredLocations: string[];
  favoriteRate: number;
  totalInteractions: number;
};

const COLD_START_THRESHOLD = 10;

/**
 * Analyze listing_interactions for the current user.
 * Returns null for unauthenticated users or cold-start users (<10 interactions).
 * Weights: favorite=3, open=2, view=1, pass=-1
 */
export async function getUserPreferenceProfile(): Promise<PreferenceProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rows } = await supabase
    .from("listing_interactions")
    .select("interaction_type, price, discipline, location")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (!rows || rows.length < COLD_START_THRESHOLD) return null;

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
  const passPrices: number[] = [];
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
      if (row.interaction_type === "pass") passPrices.push(Number(row.price));
    }

    if (row.location) {
      locationScores.set(
        row.location,
        (locationScores.get(row.location) ?? 0) + w
      );
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

  // Top locations (positive score)
  const preferredLocations = [...locationScores.entries()]
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([l]) => l);

  const total = favorites + passes;
  const favoriteRate = total > 0 ? favorites / total : 0;

  return {
    topDisciplines,
    preferredPriceRange,
    preferredLocations,
    favoriteRate,
    totalInteractions: rows.length,
  };
}
