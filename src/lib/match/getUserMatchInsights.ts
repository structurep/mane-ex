"use server";

import { createClient } from "@/lib/supabase/server";

export type MatchInsights = {
  favoriteDisciplines: string[];
  medianFavoritePrice: number | null;
  passRate: number;
  totalSwipes: number;
};

/**
 * Compute user-facing match insights from interaction history.
 * Powers "Recommended for you" and "Trending" features.
 */
export async function getUserMatchInsights(): Promise<MatchInsights | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rows } = await supabase
    .from("listing_interactions")
    .select("interaction_type, price, discipline")
    .eq("user_id", user.id)
    .in("interaction_type", ["favorite", "pass"])
    .order("created_at", { ascending: false })
    .limit(500);

  if (!rows || rows.length === 0) return null;

  let favorites = 0;
  let passes = 0;
  const disciplineCounts = new Map<string, number>();
  const favPrices: number[] = [];

  for (const row of rows) {
    if (row.interaction_type === "favorite") {
      favorites++;
      if (row.discipline) {
        disciplineCounts.set(row.discipline, (disciplineCounts.get(row.discipline) ?? 0) + 1);
      }
      if (row.price != null) favPrices.push(Number(row.price));
    } else {
      passes++;
    }
  }

  const favoriteDisciplines = [...disciplineCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([d]) => d);

  let medianFavoritePrice: number | null = null;
  if (favPrices.length > 0) {
    favPrices.sort((a, b) => a - b);
    const mid = Math.floor(favPrices.length / 2);
    medianFavoritePrice = favPrices.length % 2 === 0
      ? (favPrices[mid - 1]! + favPrices[mid]!) / 2
      : favPrices[mid]!;
  }

  const total = favorites + passes;

  return {
    favoriteDisciplines,
    medianFavoritePrice,
    passRate: total > 0 ? passes / total : 0,
    totalSwipes: total,
  };
}
