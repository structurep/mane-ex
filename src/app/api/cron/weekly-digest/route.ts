import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/resend";
import { weeklyDigestEmail } from "@/lib/email/templates";

/**
 * Weekly digest cron job.
 * Sends a personalized weekly summary email to all users who have been active
 * (have listings, messages, or profile views in the past 7 days).
 *
 * Trigger via Vercel Cron: every Monday at 9am ET.
 */
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get all users with profiles (active sellers/buyers)
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .not("display_name", "is", null);

  if (error || !profiles?.length) {
    return NextResponse.json({ sent: 0, error: error?.message });
  }

  let sent = 0;
  let skipped = 0;

  for (const profile of profiles) {
    try {
      // Gather stats for this user
      const [listingsRes, messagesRes, viewsRes, favoritesRes] = await Promise.all([
        // New listings by this user in the past week
        supabase
          .from("horse_listings")
          .select("id", { count: "exact", head: true })
          .eq("seller_id", profile.id)
          .gte("created_at", weekAgo),
        // Messages received in the past week
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("recipient_id", profile.id)
          .gte("created_at", weekAgo),
        // Profile views (from notifications as proxy)
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile.id)
          .gte("created_at", weekAgo),
        // Favorites/saves on their listings
        supabase
          .from("collection_items")
          .select("id, horse_listings!inner(seller_id)", { count: "exact", head: true })
          .eq("horse_listings.seller_id", profile.id)
          .gte("created_at", weekAgo),
      ]);

      const stats = {
        newListings: listingsRes.count ?? 0,
        messages: messagesRes.count ?? 0,
        views: viewsRes.count ?? 0,
        newFavorites: favoritesRes.count ?? 0,
      };

      // Skip users with zero activity
      if (stats.newListings + stats.messages + stats.views + stats.newFavorites === 0) {
        skipped++;
        continue;
      }

      // Get user email
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
      const email = authUser?.user?.email;
      if (!email) {
        skipped++;
        continue;
      }

      const digest = weeklyDigestEmail(profile.display_name || "there", stats);
      await sendEmail({
        to: email,
        ...digest,
        idempotencyKey: `weekly-digest-${profile.id}-${new Date().toISOString().slice(0, 10)}`,
      });

      sent++;
    } catch (err) {
      console.error(`[WeeklyDigest] Error for user ${profile.id}:`, err);
    }
  }

  return NextResponse.json({ sent, skipped, total: profiles.length });
}
