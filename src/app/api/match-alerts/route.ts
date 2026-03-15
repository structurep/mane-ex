import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/match-alerts
 * Vercel Cron sends GET requests. Also accepts POST for manual triggers.
 * Batch scan: find active users, score recent listings, insert match alerts.
 * Protected by CRON_SECRET (Authorization: Bearer <secret>).
 */
export const maxDuration = 60; // Allow up to 60s for batch processing

async function handleMatchAlertScan(request: NextRequest) {
  const start = Date.now();

  // ─── Auth ───
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ─── Supabase service client ───
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Missing Supabase config" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // ─── Find active users (interacted in last 3 days) ───
  const threeDaysAgo = new Date(
    Date.now() - 3 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: activeUsers } = await supabase
    .from("listing_interactions")
    .select("user_id")
    .gte("created_at", threeDaysAgo)
    .limit(500);

  if (!activeUsers || activeUsers.length === 0) {
    return NextResponse.json({
      processed: 0,
      alerts: 0,
      duration_ms: Date.now() - start,
    });
  }

  const userIds = [...new Set(activeUsers.map((u) => u.user_id))];

  // ─── Get recent listings to score ───
  const { data: recentListings } = await supabase
    .from("horse_listings")
    .select("id, discipline_ids, price, height_hands, location_state")
    .eq("status", "active")
    .gte("published_at", threeDaysAgo)
    .order("published_at", { ascending: false })
    .limit(50);

  if (!recentListings || recentListings.length === 0) {
    return NextResponse.json({
      processed: userIds.length,
      alerts: 0,
      duration_ms: Date.now() - start,
    });
  }

  let totalAlerts = 0;
  const cap = Math.min(userIds.length, 100);

  // ─── Process each user ───
  for (const userId of userIds.slice(0, cap)) {
    const [
      { data: interactions },
      { data: favListings },
      { data: existingAlerts },
    ] = await Promise.all([
      supabase
        .from("listing_interactions")
        .select("interaction_type, price, discipline, location")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("listing_favorites")
        .select(
          "listing:horse_listings!listing_id(height_hands, price, discipline_ids, location_state)"
        )
        .eq("user_id", userId)
        .limit(50),
      supabase
        .from("match_alerts")
        .select("listing_id")
        .eq("user_id", userId),
    ]);

    if (!interactions || interactions.length < 10) continue;

    // Build preference profile
    const weights: Record<string, number> = {
      favorite: 3,
      open: 2,
      view: 1,
      pass: -1,
    };
    const disciplineScores = new Map<string, number>();
    const favoritePrices: number[] = [];
    const favoriteHeights: number[] = [];
    const locationScores = new Map<string, number>();
    let favorites = 0;

    for (const row of interactions) {
      const w = weights[row.interaction_type] ?? 0;
      if (row.interaction_type === "favorite") favorites++;
      if (row.discipline)
        disciplineScores.set(
          row.discipline,
          (disciplineScores.get(row.discipline) ?? 0) + w
        );
      if (row.price != null && row.interaction_type === "favorite")
        favoritePrices.push(Number(row.price));
      if (row.location)
        locationScores.set(
          row.location,
          (locationScores.get(row.location) ?? 0) + w
        );
    }

    if (favListings) {
      for (const fav of favListings) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const listing = (fav as any).listing;
        if (listing?.height_hands != null)
          favoriteHeights.push(Number(listing.height_hands));
      }
    }

    const topDisciplines = [...disciplineScores.entries()]
      .filter(([, s]) => s > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([d]) => d);

    let preferredPriceRange: { min: number; max: number } | null = null;
    if (favoritePrices.length >= 3) {
      favoritePrices.sort((a, b) => a - b);
      preferredPriceRange = {
        min: favoritePrices[Math.floor(favoritePrices.length * 0.1)]!,
        max: favoritePrices[Math.floor(favoritePrices.length * 0.9)]!,
      };
    }

    let preferredHeightRange: { min: number; max: number } | null = null;
    if (favoriteHeights.length >= 3) {
      favoriteHeights.sort((a, b) => a - b);
      preferredHeightRange = {
        min: favoriteHeights[Math.floor(favoriteHeights.length * 0.1)]!,
        max: favoriteHeights[Math.floor(favoriteHeights.length * 0.9)]!,
      };
    }

    const preferredLocations = [...locationScores.entries()]
      .filter(([, s]) => s > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([l]) => l);

    // Confidence gate
    const interactionFactor = Math.min(1, interactions.length / 50);
    const favoriteFactor = Math.min(1, favorites / 10);
    const diversityFactor = Math.min(
      1,
      (topDisciplines.length + preferredLocations.length) / 6
    );
    const confidence =
      interactionFactor * 0.4 + favoriteFactor * 0.4 + diversityFactor * 0.2;
    if (confidence < 0.3) continue;

    const profile = {
      topDisciplines,
      preferredPriceRange,
      preferredHeightRange,
      preferredLocations,
    };

    const existingIds = new Set(
      existingAlerts?.map((a) => a.listing_id) ?? []
    );

    const newAlerts: {
      user_id: string;
      listing_id: string;
      match_percent: number;
    }[] = [];

    for (const listing of recentListings) {
      if (existingIds.has(listing.id)) continue;

      let discipline = 0;
      if (
        profile.topDisciplines.length > 0 &&
        listing.discipline_ids?.length
      ) {
        for (const d of listing.discipline_ids) {
          const rank = profile.topDisciplines.indexOf(d);
          if (rank !== -1) discipline = Math.max(discipline, 25 - rank * 5);
        }
      }

      let price = 0;
      if (profile.preferredPriceRange && listing.price != null) {
        const { min, max } = profile.preferredPriceRange;
        const range = max - min || 1;
        if (listing.price >= min && listing.price <= max) price = 20;
        else {
          const dist =
            listing.price < min ? min - listing.price : listing.price - max;
          price = Math.max(0, 20 * (1 - dist / range));
        }
      }

      let height = 0;
      if (profile.preferredHeightRange && listing.height_hands != null) {
        const { min, max } = profile.preferredHeightRange;
        const range = max - min || 1;
        if (listing.height_hands >= min && listing.height_hands <= max)
          height = 10;
        else {
          const dist =
            listing.height_hands < min
              ? min - listing.height_hands
              : listing.height_hands - max;
          height = Math.max(0, 10 * (1 - dist / range));
        }
      }

      let location = 0;
      if (profile.preferredLocations.length > 0 && listing.location_state) {
        const rank = profile.preferredLocations.indexOf(
          listing.location_state
        );
        if (rank !== -1) location = Math.max(0, 10 - rank * 2);
      }

      const matchPercent = Math.round(
        ((discipline + price + height + location) / 65) * 100
      );
      if (matchPercent >= 70) {
        newAlerts.push({
          user_id: userId,
          listing_id: listing.id,
          match_percent: matchPercent,
        });
      }
    }

    if (newAlerts.length > 0) {
      const { data: inserted } = await supabase
        .from("match_alerts")
        .upsert(newAlerts, {
          onConflict: "user_id,listing_id",
          ignoreDuplicates: true,
        })
        .select("id");
      totalAlerts += inserted?.length ?? 0;
    }
  }

  return NextResponse.json({
    processed: cap,
    alerts: totalAlerts,
    duration_ms: Date.now() - start,
  });
}

// Vercel Cron sends GET requests
export async function GET(request: NextRequest) {
  return handleMatchAlertScan(request);
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return handleMatchAlertScan(request);
}
