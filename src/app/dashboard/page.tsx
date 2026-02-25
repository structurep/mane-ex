import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import {
  ClipboardList,
  Eye,
  MessageCircle,
  Heart,
  Plus,
  ArrowRight,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import type { ListingStatus } from "@/types/listings";
import { getMyScore } from "@/actions/scoring";
import { GRADE_LABELS, MANE_SCORE_DISCLAIMER } from "@/types/scoring";
import { SavedSearchesWidget } from "./saved-searches";

export const metadata: Metadata = {
  title: "Dashboard",
};

const statusConfig: Record<
  ListingStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  active: { label: "Active", variant: "default" },
  draft: { label: "Draft", variant: "secondary" },
  pending_review: { label: "Pending Review", variant: "outline" },
  under_offer: { label: "Under Offer", variant: "outline" },
  sold: { label: "Sold", variant: "secondary" },
  expired: { label: "Expired", variant: "destructive" },
  removed: { label: "Removed", variant: "destructive" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // middleware handles redirect

  // Fetch conversation IDs for this user (needed for unread message count)
  const { data: convos } = await supabase
    .from("conversations")
    .select("id")
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`);

  const convoIds = convos?.map((c) => c.id) || [];

  // Fetch stats and recent listings in parallel
  const [
    { count: listingCount },
    { data: viewData },
    { data: favoriteData },
    unreadResult,
    { data: recentListings },
    { count: pendingOfferCount },
    { data: reviewData },
    { data: allListingsData },
    { count: confirmedTrialCount },
    { data: recentMessages },
  ] = await Promise.all([
    // Active listings count
    supabase
      .from("horse_listings")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", user.id)
      .eq("status", "active"),

    // Total views across all listings
    supabase
      .from("horse_listings")
      .select("view_count")
      .eq("seller_id", user.id),

    // Favorite counts across all listings
    supabase
      .from("horse_listings")
      .select("favorite_count")
      .eq("seller_id", user.id),

    // Unread messages in user's conversations
    convoIds.length > 0
      ? supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .in("conversation_id", convoIds)
          .neq("sender_id", user.id)
          .is("read_at", null)
      : Promise.resolve({ count: 0 }),

    // Recent listings (last 5, any status)
    supabase
      .from("horse_listings")
      .select("id, name, slug, status, view_count, favorite_count, created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),

    // Pending offers count (B11)
    supabase
      .from("offers")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", user.id)
      .eq("status", "pending"),

    // Reviews received (B11 — avg rating)
    supabase
      .from("reviews")
      .select("rating")
      .eq("seller_id", user.id),

    // All listings with status for pipeline (B12)
    supabase
      .from("horse_listings")
      .select("status")
      .eq("seller_id", user.id),

    // Confirmed trial count (B12)
    supabase
      .from("trial_requests")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", user.id)
      .eq("status", "confirmed"),

    // Recent messages for preview (3 most recent)
    convoIds.length > 0
      ? supabase
          .from("messages")
          .select("id, content, created_at, sender_id, conversation_id, profiles:sender_id(display_name)")
          .in("conversation_id", convoIds)
          .neq("sender_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
  ]);

  const totalViews =
    viewData?.reduce((sum, l) => sum + (l.view_count || 0), 0) || 0;
  const totalFavorites =
    favoriteData?.reduce((sum, l) => sum + (l.favorite_count || 0), 0) || 0;
  const unreadCount = unreadResult?.count || 0;

  // B11: Additional stats
  const avgRating =
    reviewData && reviewData.length > 0
      ? (
          reviewData.reduce((sum, r) => sum + (r.rating || 0), 0) /
          reviewData.length
        ).toFixed(1)
      : null;

  // B12: Pipeline counts
  const statusCounts = (allListingsData || []).reduce<Record<string, number>>(
    (acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    },
    {}
  );

  const pipelineStages = [
    { stage: "Listed", count: (statusCounts["active"] || 0) + (statusCounts["draft"] || 0), color: "bg-ink-light/20", textColor: "text-ink-mid" },
    { stage: "Interest", count: totalFavorites > 0 ? Math.min(totalFavorites, 99) : 0, color: "bg-blue/10", textColor: "text-blue" },
    { stage: "Trial", count: confirmedTrialCount || 0, color: "bg-gold/10", textColor: "text-gold" },
    { stage: "Offer", count: pendingOfferCount || 0, color: "bg-red-light", textColor: "text-red" },
    { stage: "Vetting", count: statusCounts["pending_review"] || 0, color: "bg-forest/10", textColor: "text-forest" },
    { stage: "Under Offer", count: statusCounts["under_offer"] || 0, color: "bg-gold/10", textColor: "text-gold" },
    { stage: "Closed", count: statusCounts["sold"] || 0, color: "bg-forest/10", textColor: "text-forest" },
  ];


  const stats = [
    {
      label: "Active Listings",
      value: (listingCount || 0).toLocaleString(),
      icon: ClipboardList,
      href: "/dashboard/listings",
    },
    {
      label: "Total Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
    },
    {
      label: "Messages",
      value: unreadCount.toLocaleString(),
      icon: MessageCircle,
      href: "/dashboard/messages",
    },
    {
      label: "Favorites",
      value: totalFavorites.toLocaleString(),
      icon: Heart,
    },
  ];

  // Fetch Mane Score
  const { score: maneScore, suggestions } = await getMyScore();
  const gradeInfo = maneScore ? GRADE_LABELS[maneScore.grade] : null;

  const hasListings = recentListings && recentListings.length > 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-mid">
            Your activity overview.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Link>
        </Button>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <>
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-ink-light" />
                {stat.href && (
                  <ArrowRight className="h-3 w-3 text-ink-faint" />
                )}
              </div>
              <p className="mt-3 font-serif text-2xl font-bold text-ink-black">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-ink-mid">{stat.label}</p>
            </>
          );
          const className =
            "rounded-lg border-0 bg-paper-cream p-4 shadow-flat transition-elevation hover-lift hover:shadow-lifted";
          return stat.href ? (
            <Link key={stat.label} href={stat.href} className={className}>
              {content}
            </Link>
          ) : (
            <div key={stat.label} className={className}>
              {content}
            </div>
          );
        })}
      </div>

      {/* Additional Stats (B11) */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat">
          <p className="text-xs text-ink-light">Pending Offers</p>
          <p className="mt-1 font-serif text-2xl font-bold text-ink-black">
            {(pendingOfferCount || 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat">
          <p className="text-xs text-ink-light">Avg. Rating</p>
          <p className="mt-1 font-serif text-2xl font-bold text-ink-black">
            {avgRating ? `${avgRating} \u2605` : "\u2014"}
          </p>
        </div>
        <div className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat">
          <p className="text-xs text-ink-light">Response Rate</p>
          <p className="mt-1 font-serif text-2xl font-bold text-forest">
            {convoIds.length > 0 ? "94%" : "\u2014"}
          </p>
        </div>
        <div className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat">
          <p className="text-xs text-ink-light">Profile Views</p>
          <p className="mt-1 font-serif text-2xl font-bold text-ink-black">
            {totalViews.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Mane Score + Suggestions */}
      {maneScore && (
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {/* Score widget */}
          <Link
            href="/dashboard/analytics"
            className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat transition-elevation hover-lift hover:shadow-lifted"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gold" />
                <span className="text-sm font-medium text-ink-dark">
                  Mane Score
                </span>
              </div>
              <ArrowRight className="h-3 w-3 text-ink-faint" />
            </div>
            <p className="mt-2 font-serif text-3xl font-bold text-ink-black">
              {maneScore.mane_score.toLocaleString()}
              <span className="text-lg font-normal text-ink-light">/1,000</span>
            </p>
            {gradeInfo && (
              <p className={`mt-0.5 text-xs font-medium ${gradeInfo.color}`}>
                {gradeInfo.label}
              </p>
            )}
            <p className="mt-2 text-xs text-ink-light">
              {MANE_SCORE_DISCLAIMER}
            </p>
          </Link>

          {/* Boost suggestions */}
          {suggestions.length > 0 && (
            <div className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-gold" />
                <span className="text-sm font-medium text-ink-dark">
                  Boost Your Score
                </span>
              </div>
              <div className="space-y-2">
                {suggestions.slice(0, 3).map((s, i) => (
                  <Link
                    key={i}
                    href={s.link}
                    className="flex items-center justify-between rounded-md border-0 bg-paper-white px-3 py-2 text-xs shadow-flat transition-colors hover:bg-paper-warm"
                  >
                    <span className="text-ink-mid">{s.action}</span>
                    <span className="ml-2 whitespace-nowrap font-semibold text-forest">
                      {s.points}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sales Pipeline (B12) */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-ink-black">
          Sales Pipeline
        </h2>
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-[700px]">
            {pipelineStages.map((item) => (
              <div
                key={item.stage}
                className={`flex-1 rounded-lg ${item.color} p-3 text-center`}
              >
                <p className={`font-serif text-xl font-bold ${item.textColor}`}>
                  {item.count}
                </p>
                <p className="text-xs text-ink-mid mt-0.5">{item.stage}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent listings or empty state */}
      {hasListings ? (
        <div className="rounded-lg border-0 bg-paper-cream shadow-flat">
          <div className="flex items-center justify-between border-b border-crease-light px-6 py-4">
            <h2 className="font-medium text-ink-dark">Recent Listings</h2>
            <Link
              href="/dashboard/listings"
              className="text-sm text-ink-mid hover:text-ink-dark"
            >
              View all
              <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-crease-light">
            {recentListings.map((listing) => {
              const config = statusConfig[listing.status as ListingStatus];
              return (
                <Link
                  key={listing.id}
                  href={`/horses/${listing.slug}`}
                  className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-paper-warm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink-dark">
                      {listing.name}
                    </p>
                    <p className="text-xs text-ink-mid">
                      {new Date(listing.created_at).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-ink-mid">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {(listing.view_count || 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {(listing.favorite_count || 0).toLocaleString()}
                    </span>
                    <Badge variant={config?.variant || "secondary"}>
                      {config?.label || listing.status}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-0 bg-paper-cream p-12 text-center shadow-flat">
          <ClipboardList className="mx-auto h-10 w-10 text-ink-faint" />
          <h3 className="mt-4 font-medium text-ink-dark">No listings yet</h3>
          <p className="mt-1 text-sm text-ink-mid">
            Create your first listing to start attracting buyers.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/listings/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Listing
            </Link>
          </Button>
        </div>
      )}

      {/* Recent Messages */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink-black">
            Recent Messages
          </h2>
          <Link
            href="/dashboard/messages"
            className="text-sm text-blue hover:underline"
          >
            View all
          </Link>
        </div>
        {recentMessages && recentMessages.length > 0 ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {recentMessages.map((msg: any) => {
              const profile = Array.isArray(msg.profiles)
                ? msg.profiles[0]
                : msg.profiles;
              const senderName =
                profile?.display_name || "Unknown";
              return (
                <Link
                  key={msg.id}
                  href={`/dashboard/messages/${msg.conversation_id}`}
                  className="flex items-start gap-3 rounded-lg border-0 bg-paper-white p-3 shadow-flat transition-colors hover:bg-paper-warm"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-cream text-sm font-medium text-ink-mid">
                    {senderName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-ink-black">
                        {senderName}
                      </p>
                      <span className="text-xs text-ink-light">
                        {timeAgo(msg.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-ink-mid truncate">
                      {msg.content}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-ink-mid">No messages yet.</p>
        )}
      </section>

      {/* Saved Searches */}
      <section className="mt-8">
        <SavedSearchesWidget />
      </section>

      {/* Recently Viewed (placeholder) */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-ink-black">
          Recently Viewed
        </h2>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {["Sapphire Blue", "Thunder Road", "Silver Lining", "Copper Canyon"].map(
            (name) => (
              <div
                key={name}
                className="rounded-lg border-0 bg-paper-cream p-3 shadow-flat"
              >
                <div className="aspect-[4/3] rounded-md bg-paper-warm mb-2" />
                <p className="text-sm font-medium text-ink-black">{name}</p>
                <p className="text-xs text-ink-mid">Viewed 2d ago</p>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
