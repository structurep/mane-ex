"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Get personalized feed listings for the discovery page.
 * Returns sections: new_this_week, trending, just_sold, for_you.
 */
export async function getDiscoveryFeed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // New this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: newListings } = await supabase
    .from("horse_listings")
    .select(
      "id, name, slug, breed, price, height_hands, location_state, primary_image_url, seller_id, created_at, view_count, favorite_count"
    )
    .eq("status", "active")
    .gte("created_at", weekAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(12);

  // Trending (from materialized view, fallback to regular query)
  const { data: trending } = await supabase
    .from("horse_listings")
    .select(
      "id, name, slug, breed, price, height_hands, location_state, primary_image_url, seller_id, created_at, view_count, favorite_count"
    )
    .eq("status", "active")
    .order("favorite_count", { ascending: false })
    .limit(12);

  // Just sold
  const { data: justSold } = await supabase
    .from("horse_listings")
    .select(
      "id, name, slug, breed, price, height_hands, location_state, primary_image_url, seller_id, created_at, view_count, favorite_count"
    )
    .eq("status", "sold")
    .order("updated_at", { ascending: false })
    .limit(12);

  // For you (based on user preferences if logged in)
  let forYou = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("disciplines, min_budget, max_budget, state")
      .eq("id", user.id)
      .single();

    if (profile) {
      let forYouQuery = supabase
        .from("horse_listings")
        .select(
          "id, name, slug, breed, price, height_hands, location_state, primary_image_url, seller_id, created_at, view_count, favorite_count"
        )
        .eq("status", "active");

      if (profile.min_budget) {
        forYouQuery = forYouQuery.gte("price", profile.min_budget);
      }
      if (profile.max_budget) {
        forYouQuery = forYouQuery.lte("price", profile.max_budget);
      }
      if (typeof profile.state === "string") {
        forYouQuery = forYouQuery.eq("location_state", profile.state);
      }

      const { data } = await forYouQuery
        .order("created_at", { ascending: false })
        .limit(12);

      forYou = data;
    }
  }

  return {
    sections: [
      ...(forYou && forYou.length > 0
        ? [{ type: "for_you" as const, title: "For You", listings: forYou }]
        : []),
      { type: "new_this_week" as const, title: "New This Week", listings: newListings ?? [] },
      { type: "trending" as const, title: "Trending", listings: trending ?? [] },
      { type: "just_sold" as const, title: "Just Sold", listings: justSold ?? [] },
    ],
  };
}

/**
 * Get listings for Stories format (recent active listings).
 */
export async function getStoriesListings(cursor?: string, limit = 10) {
  const supabase = await createClient();

  let query = supabase
    .from("horse_listings")
    .select(
      "id, name, slug, breed, price, height_hands, location_state, location_city, primary_image_url, seller_id, created_at, description"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message, hasMore: false };
  }

  return {
    data,
    error: null,
    hasMore: (data?.length ?? 0) === limit,
    nextCursor: data?.[data.length - 1]?.created_at ?? null,
  };
}
