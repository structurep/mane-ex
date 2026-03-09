"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

/**
 * Track a listing page view. Inserts into listing_events which triggers
 * view_count increment via the update_listing_counters() trigger.
 * Deduplicates: max 1 view per user per listing per hour.
 */
export async function trackListingView(listingId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get referrer for source tracking
  const headersList = await headers();
  const referer = headersList.get("referer") || null;

  // Deduplicate: skip if same user viewed this listing in the last hour
  if (user) {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count } = await supabase
      .from("listing_events")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", listingId)
      .eq("user_id", user.id)
      .eq("event_type", "view")
      .gte("created_at", oneHourAgo);

    if ((count ?? 0) > 0) return;
  }

  await supabase.from("listing_events").insert({
    listing_id: listingId,
    user_id: user?.id ?? null,
    event_type: "view",
    metadata: referer ? { referer } : {},
  });
}

/**
 * Get view data for a seller's listings, aggregated by day for the last 7 days.
 */
export async function getViewsByDay(sellerId: string): Promise<{ label: string; value: number }[]> {
  const supabase = await createClient();

  const days: { label: string; value: number }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString();

    const { count } = await supabase
      .from("listing_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "view")
      .gte("created_at", dayStart)
      .lt("created_at", dayEnd)
      .in(
        "listing_id",
        (await supabase.from("horse_listings").select("id").eq("seller_id", sellerId)).data?.map(l => l.id) ?? []
      );

    days.push({
      label: dayNames[date.getDay()],
      value: count ?? 0,
    });
  }

  return days;
}

/**
 * Get traffic source breakdown for a seller's listings.
 */
export async function getTrafficSources(sellerId: string): Promise<{ source: string; count: number }[]> {
  const supabase = await createClient();

  // Get seller's listing IDs
  const { data: listings } = await supabase
    .from("horse_listings")
    .select("id")
    .eq("seller_id", sellerId);

  const listingIds = listings?.map(l => l.id) ?? [];
  if (listingIds.length === 0) return [];

  // Fetch recent view events with referer metadata
  const { data: events } = await supabase
    .from("listing_events")
    .select("metadata")
    .eq("event_type", "view")
    .in("listing_id", listingIds)
    .order("created_at", { ascending: false })
    .limit(500);

  // Categorize by source
  const sourceCounts: Record<string, number> = { Direct: 0, Search: 0, "External Links": 0, Browse: 0 };

  (events ?? []).forEach((e) => {
    const referer = (e.metadata as Record<string, string>)?.referer || "";
    if (!referer) {
      sourceCounts["Direct"]++;
    } else if (referer.includes("/browse")) {
      sourceCounts["Browse"]++;
    } else if (referer.includes("google") || referer.includes("bing") || referer.includes("duckduckgo")) {
      sourceCounts["Search"]++;
    } else {
      sourceCounts["External Links"]++;
    }
  });

  return Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get per-listing performance for a seller.
 */
export async function getListingPerformance(sellerId: string) {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("horse_listings")
    .select("id, name, slug, view_count, favorite_count, inquiry_count, completeness_score")
    .eq("seller_id", sellerId)
    .in("status", ["active", "under_offer", "sold"])
    .order("view_count", { ascending: false })
    .limit(10);

  if (!listings) return [];

  // Get offer counts per listing
  const listingIds = listings.map(l => l.id);
  const { data: offers } = await supabase
    .from("offers")
    .select("listing_id")
    .in("listing_id", listingIds);

  const offerCounts = (offers ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.listing_id] = (acc[o.listing_id] || 0) + 1;
    return acc;
  }, {});

  return listings.map(l => ({
    name: l.name,
    slug: l.slug,
    views: l.view_count || 0,
    saves: l.favorite_count || 0,
    inquiries: l.inquiry_count || 0,
    offers: offerCounts[l.id] || 0,
    score: l.completeness_score || 0,
  }));
}
