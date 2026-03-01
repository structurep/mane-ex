"use server";

import { createClient } from "@/lib/supabase/server";
import { leaderboardQuerySchema } from "@/lib/validators/scoring";
import type {
  SellerScore,
  LeaderboardEntry,
  LeaderboardCategory,
  ScoreSuggestion,
} from "@/types/scoring";

export type ScoreActionState = {
  error?: string;
  score?: SellerScore;
};

/**
 * Calculate (or recalculate) a seller's Mane Score.
 * Calls the PostgreSQL `calculate_seller_mane_score()` function which
 * computes all 3 components and upserts the seller_scores row.
 * Then evaluates badges.
 */
export async function calculateSellerScore(
  sellerId: string
): Promise<ScoreActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // Only the seller themselves or an admin can trigger recalculation
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (user.id !== sellerId && profile?.role !== "admin") {
    return { error: "You can only recalculate your own score." };
  }

  // Calculate score via PostgreSQL function (SECURITY DEFINER)
  const { error: rpcError } = await supabase.rpc(
    "calculate_seller_mane_score",
    { p_seller_id: sellerId }
  );

  if (rpcError) {
    return { error: `Score calculation failed: ${rpcError.message}` };
  }

  // Evaluate badges
  await supabase.rpc("evaluate_seller_badges", {
    p_seller_id: sellerId,
  });

  // Fetch the updated score
  const { data: score, error: fetchError } = await supabase
    .from("seller_scores")
    .select("*")
    .eq("seller_id", sellerId)
    .single();

  if (fetchError) {
    return { error: fetchError.message };
  }

  return { score: score as SellerScore };
}

/**
 * Get a seller's current Mane Score with full breakdown.
 */
export async function getSellerScore(
  sellerId: string
): Promise<{ score: SellerScore | null; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("seller_scores")
    .select("*")
    .eq("seller_id", sellerId)
    .single();

  if (error) {
    // No score yet — not an error, just means score hasn't been calculated
    if (error.code === "PGRST116") {
      return { score: null };
    }
    return { score: null, error: error.message };
  }

  return { score: data as SellerScore };
}

/**
 * Get the currently authenticated seller's Mane Score.
 * If no score exists yet, triggers initial calculation.
 */
export async function getMyScore(): Promise<{
  score: SellerScore | null;
  suggestions: ScoreSuggestion[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { score: null, suggestions: [], error: "You must be logged in." };
  }

  // Try to fetch existing score
  let { data: score } = await supabase
    .from("seller_scores")
    .select("*")
    .eq("seller_id", user.id)
    .single();

  // If no score exists, calculate it
  if (!score) {
    const { error: rpcError } = await supabase.rpc(
      "calculate_seller_mane_score",
      { p_seller_id: user.id }
    );

    if (!rpcError) {
      await supabase.rpc("evaluate_seller_badges", {
        p_seller_id: user.id,
      });

      const { data: newScore } = await supabase
        .from("seller_scores")
        .select("*")
        .eq("seller_id", user.id)
        .single();

      score = newScore;
    }
  }

  // Generate improvement suggestions based on current score data
  const suggestions = await generateSuggestions(supabase, user.id, score);

  return { score: score as SellerScore | null, suggestions };
}

/**
 * Fetch the leaderboard for a given category.
 */
export async function getLeaderboard(
  category: LeaderboardCategory = "most_complete",
  limit: number = 10,
  offset: number = 0
): Promise<{ entries: LeaderboardEntry[]; error?: string }> {
  const parsed = leaderboardQuerySchema.safeParse({ category, limit, offset });
  if (!parsed.success) {
    return { entries: [], error: "Invalid leaderboard parameters." };
  }

  const supabase = await createClient();

  // Determine sort column based on category
  const sortColumn =
    category === "most_complete"
      ? "completeness_component"
      : category === "most_active"
        ? "engagement_component"
        : "credibility_component";

  const { data, error } = await supabase
    .from("seller_scores")
    .select("seller_id, mane_score, grade, completeness_component, engagement_component, credibility_component, badges")
    .gt("mane_score", 0)
    .order(sortColumn, { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return { entries: [], error: error.message };
  }

  if (!data || data.length === 0) {
    return { entries: [] };
  }

  // Fetch profile info for leaderboard display
  const sellerIds = data.map((s) => s.seller_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", sellerIds);

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, p])
  );

  // Build leaderboard entries
  const entries: LeaderboardEntry[] = data.map((row, index) => {
    const profile = profileMap.get(row.seller_id);
    const categoryValue =
      category === "most_complete"
        ? row.completeness_component
        : category === "most_active"
          ? row.engagement_component
          : row.credibility_component;

    return {
      rank: offset + index + 1,
      seller_id: row.seller_id,
      display_name: profile?.display_name || null,
      avatar_url: profile?.avatar_url || null,
      mane_score: row.mane_score,
      grade: row.grade,
      badge_count: (row.badges as string[])?.length || 0,
      category_value: categoryValue,
    };
  });

  return { entries };
}

/**
 * Admin: Recalculate scores for all sellers with active listings.
 */
export async function recalculateAllScores(): Promise<{
  count: number;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { count: 0, error: "You must be logged in." };
  }

  // Admin check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { count: 0, error: "Admin access required." };
  }

  // Get all sellers with active listings
  const { data: sellers } = await supabase
    .from("horse_listings")
    .select("seller_id")
    .in("status", ["active", "under_offer", "sold"]);

  if (!sellers || sellers.length === 0) {
    return { count: 0 };
  }

  const uniqueSellerIds = [...new Set(sellers.map((s) => s.seller_id))];

  // Recalculate each seller's score
  let count = 0;
  for (const sellerId of uniqueSellerIds) {
    const { error: rpcError } = await supabase.rpc(
      "calculate_seller_mane_score",
      { p_seller_id: sellerId }
    );
    if (!rpcError) {
      await supabase.rpc("evaluate_seller_badges", {
        p_seller_id: sellerId,
      });
      count++;
    }
  }

  return { count };
}

// ── Internal helpers ──

/**
 * Generate improvement suggestions based on what the seller is missing.
 */
async function generateSuggestions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sellerId: string,
  score: SellerScore | Record<string, unknown> | null
): Promise<ScoreSuggestion[]> {
  const suggestions: ScoreSuggestion[] = [];

  // Fetch seller's listings to check what's missing
  const { data: listings } = await supabase
    .from("horse_listings")
    .select(
      "id, completeness_score, show_record, show_experience, vet_name, coggins_date, training_history, reason_for_sale"
    )
    .eq("seller_id", sellerId)
    .in("status", ["active", "draft", "under_offer"]);

  if (!listings || listings.length === 0) {
    suggestions.push({
      action: "Create your first listing to start building your Mane Score",
      points: "+100-200 pts",
      link: "/dashboard/listings/new",
      priority: "high",
    });
    return suggestions;
  }

  // Check for common missing fields across listings
  const hasIncompleteListings = listings.some(
    (l) => l.completeness_score < 500
  );
  const missingShowRecords = listings.some(
    (l) => !l.show_record && !l.show_experience
  );
  const missingVetInfo = listings.some(
    (l) => !l.vet_name && !l.coggins_date
  );
  const missingHistory = listings.some(
    (l) => !l.training_history && !l.reason_for_sale
  );

  if (hasIncompleteListings) {
    suggestions.push({
      action: "Complete your listing details for a higher completeness score",
      points: "+50-150 pts",
      link: "/dashboard",
      priority: "high",
    });
  }

  if (missingShowRecords) {
    suggestions.push({
      action: "Add show records and competition experience",
      points: "+55 pts",
      link: "/dashboard",
      priority: "medium",
    });
  }

  if (missingVetInfo) {
    suggestions.push({
      action: "Upload Coggins test and add vet information",
      points: "+60 pts",
      link: "/dashboard",
      priority: "medium",
    });
  }

  if (missingHistory) {
    suggestions.push({
      action: "Add training history and reason for sale",
      points: "+40 pts",
      link: "/dashboard",
      priority: "low",
    });
  }

  // Check for farm page
  const { data: farm } = await supabase
    .from("farms")
    .select("id")
    .eq("owner_id", sellerId)
    .single();

  if (!farm) {
    suggestions.push({
      action: "Create your barn page to build credibility",
      points: "+25 pts",
      link: "/dashboard/farm",
      priority: "medium",
    });
  }

  // Engagement suggestion if completeness is high but engagement is low
  const completeness = score && "completeness_component" in score ? Number(score.completeness_component) : 0;
  const engagement = score && "engagement_component" in score ? Number(score.engagement_component) : 0;
  if (completeness >= 300 && engagement < 100) {
    suggestions.push({
      action: "Share your listings to boost engagement",
      points: "+50-100 pts",
      link: "/dashboard",
      priority: "medium",
    });
  }

  // Cap at 4 suggestions to keep the UI clean
  return suggestions.slice(0, 4);
}
