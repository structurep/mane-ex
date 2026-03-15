"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getUserPreferenceProfile,
  type PreferenceProfile,
} from "@/lib/match/getUserPreferenceProfile";

const VERIFICATION_BOOSTS: Record<string, number> = {
  gold: 10,
  silver: 7,
  bronze: 4,
  none: 0,
};

/**
 * Score a listing against a buyer preference profile.
 * Returns matchPercent (0–100) based on preference alignment only.
 */
function computeMatchPercent(
  listing: {
    discipline_ids: string[] | null;
    price: number | null;
    height_hands: number | null;
    location_state: string | null;
  },
  profile: PreferenceProfile
): number {
  let discipline = 0;
  if (profile.topDisciplines.length > 0 && listing.discipline_ids?.length) {
    for (const d of listing.discipline_ids) {
      const rank = profile.topDisciplines.indexOf(d);
      if (rank !== -1) {
        discipline = Math.max(discipline, 25 - rank * 5);
      }
    }
  }

  let price = 0;
  if (profile.preferredPriceRange && listing.price != null) {
    const { min, max } = profile.preferredPriceRange;
    const range = max - min || 1;
    if (listing.price >= min && listing.price <= max) {
      price = 20;
    } else {
      const distance =
        listing.price < min ? min - listing.price : listing.price - max;
      price = Math.max(0, 20 * (1 - distance / range));
    }
  }

  let height = 0;
  if (profile.preferredHeightRange && listing.height_hands != null) {
    const { min, max } = profile.preferredHeightRange;
    const range = max - min || 1;
    if (listing.height_hands >= min && listing.height_hands <= max) {
      height = 10;
    } else {
      const distance =
        listing.height_hands < min
          ? min - listing.height_hands
          : listing.height_hands - max;
      height = Math.max(0, 10 * (1 - distance / range));
    }
  }

  let location = 0;
  if (profile.preferredLocations.length > 0 && listing.location_state) {
    const rank = profile.preferredLocations.indexOf(listing.location_state);
    if (rank !== -1) {
      location = Math.max(0, 10 - rank * 2);
    }
  }

  const preferenceScore = discipline + price + height + location;
  return Math.round((preferenceScore / 65) * 100);
}

export type MatchAlert = {
  id: string;
  listing_id: string;
  match_percent: number;
  read_at: string | null;
  created_at: string;
  listing: {
    id: string;
    name: string;
    slug: string;
    breed: string | null;
    price: number | null;
    location_state: string | null;
    verification_tier: string | null;
    media: { url: string; is_primary: boolean }[];
  };
};

/**
 * Check for new high-match listings for the current user.
 * Finds active listings published in the last 3 days that score >= 70% match
 * and haven't already been alerted. Inserts new match_alerts rows.
 * Returns the count of new alerts created.
 */
export async function checkForNewMatches(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const profile = await getUserPreferenceProfile();
  if (!profile || profile.confidence < 0.3) return 0;

  // Get listings published in the last 3 days
  const threeDaysAgo = new Date(
    Date.now() - 3 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Get existing alerts to exclude
  const { data: existingAlerts } = await supabase
    .from("match_alerts")
    .select("listing_id")
    .eq("user_id", user.id);

  const existingIds = new Set(
    existingAlerts?.map((a) => a.listing_id) ?? []
  );

  // Fetch recent active listings
  const { data: candidates } = await supabase
    .from("horse_listings")
    .select(
      `id, discipline_ids, price, height_hands, location_state`
    )
    .eq("status", "active")
    .gte("published_at", threeDaysAgo)
    .order("published_at", { ascending: false })
    .limit(50);

  if (!candidates || candidates.length === 0) return 0;

  // Score and filter for high matches (>= 70%)
  const newAlerts: { user_id: string; listing_id: string; match_percent: number }[] = [];

  for (const listing of candidates) {
    if (existingIds.has(listing.id)) continue;

    const matchPercent = computeMatchPercent(listing, profile);
    if (matchPercent >= 70) {
      newAlerts.push({
        user_id: user.id,
        listing_id: listing.id,
        match_percent: matchPercent,
      });
    }
  }

  if (newAlerts.length === 0) return 0;

  // Insert alerts (ignore conflicts for race safety)
  const { data: inserted } = await supabase
    .from("match_alerts")
    .upsert(newAlerts, { onConflict: "user_id,listing_id", ignoreDuplicates: true })
    .select("id");

  return inserted?.length ?? 0;
}

/**
 * Get match alerts for the current user (most recent first).
 * Joins listing data for display.
 */
export async function getMatchAlerts(
  limit = 20,
  offset = 0
): Promise<{ alerts: MatchAlert[]; unreadCount: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { alerts: [], unreadCount: 0 };

  const [{ data: alerts }, { count }] = await Promise.all([
    supabase
      .from("match_alerts")
      .select(
        `id, listing_id, match_percent, read_at, created_at,
         listing:horse_listings!listing_id(id, name, slug, breed, price, location_state, verification_tier,
           media:listing_media(url, is_primary))`
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1),
    supabase
      .from("match_alerts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapped = (alerts ?? []).map((a: any) => ({
    id: a.id,
    listing_id: a.listing_id,
    match_percent: a.match_percent,
    read_at: a.read_at,
    created_at: a.created_at,
    listing: a.listing,
  })) as MatchAlert[];

  return { alerts: mapped, unreadCount: count ?? 0 };
}

/**
 * Get unread match alert count for the current user.
 */
export async function getUnreadMatchAlertCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("match_alerts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return count ?? 0;
}

/**
 * Mark a match alert as read.
 */
export async function markMatchAlertRead(alertId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("match_alerts")
    .update({ read_at: new Date().toISOString() })
    .eq("id", alertId)
    .eq("user_id", user.id);
}

/**
 * Mark all match alerts as read.
 */
export async function markAllMatchAlertsRead(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("match_alerts")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
}

/**
 * Get match percent for a specific listing for the current user.
 * Used on listing detail page to show "Excellent match" banner.
 * Computes live — does NOT require an existing alert.
 */
export async function getListingMatchPercent(
  listingId: string
): Promise<number | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getUserPreferenceProfile();
  if (!profile || profile.confidence < 0.3) return null;

  const { data: listing } = await supabase
    .from("horse_listings")
    .select("discipline_ids, price, height_hands, location_state")
    .eq("id", listingId)
    .single();

  if (!listing) return null;

  return computeMatchPercent(listing, profile);
}
