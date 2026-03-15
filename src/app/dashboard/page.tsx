import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  DollarSign,
  Star,
  Send,
  HandshakeIcon,
  UserCheck,
  Truck,
} from "lucide-react";
import type { ListingStatus } from "@/types/listings";
import { getMyScore } from "@/actions/scoring";
import { GRADE_LABELS, MANE_SCORE_DISCLAIMER } from "@/types/scoring";
import { getCreateListingUrl } from "@/lib/urls";
import { getTransportRequestCounts, getProviderLeadCounts } from "@/actions/transport";
import { SavedSearchesWidget } from "./saved-searches";
import { DeleteListingButton } from "@/components/marketplace/delete-listing-button";
import {
  SectionHeading,
  StackedList,
  ActivityFeed,
  StatusBadge,
  ActionPanel,
  EmptyState,
  AlertBanner,
  type StackedListItem,
  type ActivityItem,
  type ActionPanelItem,
} from "@/components/tailwind-plus";

export const metadata: Metadata = {
  title: "Dashboard",
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

  if (!user) return null;

  // Fetch conversation IDs
  const { data: convos } = await supabase
    .from("conversations")
    .select("id")
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`);

  const convoIds = convos?.map((c) => c.id) || [];

  // Fetch profile for buyer qualification check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, buyer_qualification")
    .eq("id", user.id)
    .single();

  const isBuyerUnverified =
    profile?.role === "buyer" && (!profile?.buyer_qualification || profile.buyer_qualification === "unverified");

  // Parallel data fetches
  const [
    { count: listingCount },
    { data: viewData },
    { data: favoriteData },
    unreadResult,
    { data: recentListings },
    { count: pendingOfferCount },
    { data: reviewData },
    { data: allListingsData },
    { data: recentMessages },
    { data: recentOffers },
    { data: transportNotifs },
  ] = await Promise.all([
    supabase
      .from("horse_listings")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", user.id)
      .eq("status", "active"),
    supabase
      .from("horse_listings")
      .select("view_count")
      .eq("seller_id", user.id),
    supabase
      .from("horse_listings")
      .select("favorite_count")
      .eq("seller_id", user.id),
    convoIds.length > 0
      ? supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .in("conversation_id", convoIds)
          .neq("sender_id", user.id)
          .is("read_at", null)
      : Promise.resolve({ count: 0 }),
    supabase
      .from("horse_listings")
      .select("id, name, slug, status, view_count, favorite_count, created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("offers")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", user.id)
      .eq("status", "pending"),
    supabase
      .from("reviews")
      .select("rating")
      .eq("seller_id", user.id),
    supabase
      .from("horse_listings")
      .select("status")
      .eq("seller_id", user.id),
    convoIds.length > 0
      ? supabase
          .from("messages")
          .select("id, body, created_at, sender_id, conversation_id, profiles:sender_id(display_name)")
          .in("conversation_id", convoIds)
          .neq("sender_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    supabase
      .from("offers")
      .select("id, amount, status, created_at, listing:horse_listings!listing_id(name, slug), buyer:profiles!buyer_id(display_name)")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("notifications")
      .select("id, title, body, link, created_at")
      .eq("user_id", user.id)
      .eq("type", "transport_request")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalViews = viewData?.reduce((sum, l) => sum + (l.view_count || 0), 0) || 0;
  const totalFavorites = favoriteData?.reduce((sum, l) => sum + (l.favorite_count || 0), 0) || 0;
  const unreadCount = unreadResult?.count || 0;
  const avgRating =
    reviewData && reviewData.length > 0
      ? (reviewData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewData.length).toFixed(1)
      : null;

  // Pipeline counts
  const statusCounts = (allListingsData || []).reduce<Record<string, number>>(
    (acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; },
    {}
  );

  const pendingReviewCount = statusCounts["pending_review"] || 0;
  const draftCount = statusCounts["draft"] || 0;

  // Transport request + provider lead counts for listing rows
  const listingIds = (recentListings || []).map((l) => l.id);
  const [transportCounts, providerLeadCounts] = await Promise.all([
    getTransportRequestCounts(listingIds),
    getProviderLeadCounts(listingIds),
  ]);

  const pipelineStages = [
    { stage: "Draft", count: draftCount, textColor: "text-blue" },
    { stage: "In Review", count: pendingReviewCount, textColor: "text-gold" },
    { stage: "Active", count: statusCounts["active"] || 0, textColor: "text-forest" },
    { stage: "Offer", count: pendingOfferCount || 0, textColor: "text-oxblood" },
    { stage: "Sold", count: statusCounts["sold"] || 0, textColor: "text-forest" },
  ];

  // Mane Score
  const { score: maneScore, suggestions } = await getMyScore();
  const gradeInfo = maneScore ? GRADE_LABELS[maneScore.grade] : null;
  const hasListings = recentListings && recentListings.length > 0;

  // Build activity feed from messages + offers
  const activityItems: ActivityItem[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (recentMessages || []).forEach((msg: any) => {
    const profile = Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles;
    const senderName = profile?.display_name || "Someone";
    activityItems.push({
      id: `msg-${msg.id}`,
      icon: <MessageCircle className="h-4 w-4 text-ink-mid" />,
      iconBg: "bg-paper-warm",
      content: (
        <p>
          <span className="font-medium text-ink-dark">{senderName}</span>{" "}
          sent a message: &ldquo;{(msg.body as string)?.slice(0, 60)}{(msg.body as string)?.length > 60 ? "..." : ""}&rdquo;
        </p>
      ),
      timestamp: timeAgo(msg.created_at),
      dateTime: msg.created_at,
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (recentOffers || []).forEach((offer: any) => {
    const buyer = Array.isArray(offer.buyer) ? offer.buyer[0] : offer.buyer;
    const listing = Array.isArray(offer.listing) ? offer.listing[0] : offer.listing;
    const buyerName = buyer?.display_name || "A buyer";
    const horseName = listing?.name || "a listing";
    const statusVariant = offer.status === "pending" ? "yellow" : offer.status === "accepted" ? "green" : "gray";
    activityItems.push({
      id: `offer-${offer.id}`,
      icon: <DollarSign className="h-4 w-4 text-gold" />,
      iconBg: "bg-gold/10",
      content: (
        <p>
          <span className="font-medium text-ink-dark">{buyerName}</span>{" "}
          made a ${(offer.amount as number)?.toLocaleString()} offer on{" "}
          <span className="font-medium text-ink-dark">{horseName}</span>
          <StatusBadge variant={statusVariant} className="ml-2 inline-flex">
            {offer.status}
          </StatusBadge>
        </p>
      ),
      timestamp: timeAgo(offer.created_at),
      dateTime: offer.created_at,
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (transportNotifs || []).forEach((n: any) => {
    activityItems.push({
      id: `transport-${n.id}`,
      icon: <Truck className="h-4 w-4 text-[var(--accent-blue)]" />,
      iconBg: "bg-[var(--accent-blue)]/10",
      content: (
        <p>
          {n.body || n.title}
        </p>
      ),
      timestamp: timeAgo(n.created_at),
      dateTime: n.created_at,
    });
  });

  // Sort by dateTime descending
  activityItems.sort((a, b) => {
    const da = a.dateTime ? new Date(a.dateTime).getTime() : 0;
    const db = b.dateTime ? new Date(b.dateTime).getTime() : 0;
    return db - da;
  });

  // Build recent inquiries for StackedList
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inquiryItems: StackedListItem[] = (recentMessages || []).slice(0, 4).map((msg: any) => {
    const profile = Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles;
    const senderName = profile?.display_name || "Unknown";
    return {
      id: msg.id,
      href: `/dashboard/messages/${msg.conversation_id}`,
      initials: senderName.charAt(0).toUpperCase(),
      title: senderName,
      subtitle: (msg.body as string)?.slice(0, 80) || "New message",
      meta: <span className="text-xs text-ink-faint">{timeAgo(msg.created_at)}</span>,
    };
  });

  // KPI stats
  const kpis = [
    { label: "Active Listings", value: (listingCount || 0).toLocaleString(), icon: ClipboardList, href: "/dashboard/listings", accent: "text-oxblood" },
    { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, accent: "text-ink-mid" },
    { label: "Unread Messages", value: unreadCount.toLocaleString(), icon: MessageCircle, href: "/dashboard/messages", accent: "text-gold" },
    { label: "Saves", value: totalFavorites.toLocaleString(), icon: Heart, accent: "text-oxblood/70" },
    { label: "Pending Offers", value: (pendingOfferCount || 0).toLocaleString(), icon: DollarSign, href: "/dashboard/offers", accent: "text-forest" },
    { label: "Avg. Rating", value: avgRating ? `${avgRating} \u2605` : "\u2014", icon: Star, accent: "text-gold" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="display-md text-[var(--ink-black)]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-mid)]">Your marketplace at a glance.</p>
        </div>
        <Button asChild>
          <Link href={getCreateListingUrl()}>
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Link>
        </Button>
      </div>

      {/* ─── Attention Banner ─── */}
      {(() => {
        const actions: { text: string; href: string }[] = [];
        if ((pendingOfferCount || 0) > 0)
          actions.push({ text: `${pendingOfferCount} pending offer${(pendingOfferCount || 0) !== 1 ? "s" : ""} to review`, href: "/dashboard/offers" });
        if (unreadCount > 0)
          actions.push({ text: `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`, href: "/dashboard/messages" });
        if (draftCount > 0)
          actions.push({ text: `${draftCount} draft listing${draftCount !== 1 ? "s" : ""} to finish`, href: "/dashboard" });

        if (actions.length === 0) return null;

        return (
          <AlertBanner variant="warning" title="Needs your attention" className="mb-6">
            <p className="text-sm">
              {actions.map((a, i) => (
                <span key={i}>
                  {i > 0 && " · "}
                  <Link href={a.href} className="font-medium text-oxblood hover:underline">{a.text}</Link>
                </span>
              ))}
            </p>
          </AlertBanner>
        );
      })()}

      {/* ─── Buyer Qualification Prompt ─── */}
      {isBuyerUnverified && (
        <AlertBanner variant="info" title="Improve your buyer profile" className="mb-6">
          <p className="text-sm">
            Complete your buyer profile to increase seller response rates.{" "}
            <Link href="/dashboard/settings" className="font-medium text-oxblood hover:underline">
              Complete profile
            </Link>
          </p>
        </AlertBanner>
      )}

      {/* ─── KPI Row ─── */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const inner = (
            <div className="paper-raised p-4 transition-all hover:shadow-folded">
              <Icon className={`h-4 w-4 ${kpi.accent}`} />
              <p className="mt-2 font-serif text-2xl font-bold text-[var(--ink-black)]">{kpi.value}</p>
              <p className="overline mt-1 text-[var(--ink-faint)]">{kpi.label}</p>
            </div>
          );
          return kpi.href ? (
            <Link key={kpi.label} href={kpi.href}>{inner}</Link>
          ) : (
            <div key={kpi.label}>{inner}</div>
          );
        })}
      </div>

      {/* ─── Two-column: Recent Inquiries + Activity Feed ─── */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Inquiries (StackedList) */}
        <section>
          <SectionHeading
            title="Recent Inquiries"
            actions={
              <Link href="/dashboard/messages" className="text-sm font-medium text-oxblood hover:underline">
                View all
              </Link>
            }
          />
          {inquiryItems.length > 0 ? (
            <div className="mt-2 rounded-lg bg-paper-cream px-4 shadow-flat">
              <StackedList items={inquiryItems} />
            </div>
          ) : (
            <div className="mt-2 rounded-lg bg-paper-cream shadow-flat">
              <EmptyState
                icon={<MessageCircle className="h-8 w-8" />}
                title="No inquiries yet"
                description="Messages from buyers will appear here."
              />
            </div>
          )}
        </section>

        {/* Activity Feed */}
        <section>
          <SectionHeading title="Recent Activity" />
          {activityItems.length > 0 ? (
            <div className="mt-2 rounded-lg bg-paper-cream p-5 shadow-flat">
              <ActivityFeed items={activityItems.slice(0, 6)} />
            </div>
          ) : (
            <div className="mt-2 rounded-lg bg-paper-cream shadow-flat">
              <EmptyState
                icon={<Send className="h-8 w-8" />}
                title="No activity yet"
                description="Messages, offers, and updates will appear here."
              />
            </div>
          )}
        </section>
      </div>

      {/* ─── Sales Pipeline ─── */}
      <section className="mb-8">
        <SectionHeading title="Sales Pipeline" />
        <div className="mt-2 flex gap-1.5 overflow-x-auto">
          {pipelineStages.map((item, i) => (
            <div key={item.stage} className="flex items-center gap-1.5">
              <div className="paper-flat min-w-[100px] flex-1 px-4 py-3 text-center">
                <p className={`font-serif text-xl font-bold ${item.textColor}`}>{item.count}</p>
                <p className="overline mt-1 text-[var(--ink-faint)]">{item.stage}</p>
              </div>
              {i < pipelineStages.length - 1 && (
                <ArrowRight className="h-3 w-3 shrink-0 text-crease-mid" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Recent Listings ─── */}
      {hasListings ? (
        <section className="mb-8">
          <SectionHeading
            title="Your Listings"
            actions={
              <Link href="/dashboard/listings" className="text-sm font-medium text-oxblood hover:underline">
                View all <ArrowRight className="ml-1 inline h-3 w-3" />
              </Link>
            }
          />
          <div className="mt-2 divide-y divide-crease-light rounded-lg bg-paper-cream shadow-flat">
            {recentListings.map((listing) => {
              const status = listing.status as ListingStatus;
              const variant = status === "active" ? "green" : status === "pending_review" ? "gold" : status === "sold" ? "gray" : status === "draft" ? "blue" : status === "under_offer" ? "yellow" : "gray";
              const statusLabel = status === "active" ? "Active" : status === "pending_review" ? "In Review" : status === "draft" ? "Draft" : status === "under_offer" ? "Under Offer" : status === "sold" ? "Sold" : status;
              return (
                <Link
                  key={listing.id}
                  href={`/horses/${listing.slug}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-paper-warm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-dark">{listing.name}</p>
                    <p className="text-[11px] text-ink-faint">
                      {new Date(listing.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-ink-faint">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {(listing.view_count || 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {(listing.favorite_count || 0).toLocaleString()}
                    </span>
                    {(transportCounts[listing.id] || 0) > 0 && (
                      <span className="flex items-center gap-1 text-[var(--accent-blue)]" title={`${transportCounts[listing.id]} transport request${transportCounts[listing.id] > 1 ? "s" : ""}${(providerLeadCounts[listing.id] || 0) > 0 ? `, ${providerLeadCounts[listing.id]} provider${providerLeadCounts[listing.id] > 1 ? "s" : ""} contacted` : ""}`}>
                        <Truck className="h-3 w-3" />
                        {transportCounts[listing.id]}
                        {(providerLeadCounts[listing.id] || 0) > 0 && (
                          <span className="text-[10px] text-ink-faint">/{providerLeadCounts[listing.id]}p</span>
                        )}
                      </span>
                    )}
                    <StatusBadge variant={variant}>{statusLabel}</StatusBadge>
                  </div>
                  {status !== "sold" && status !== "removed" && (
                    <div onClick={(e) => e.preventDefault()}>
                      <DeleteListingButton listingId={listing.id} listingName={listing.name} />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="mb-8">
          <div className="rounded-lg bg-paper-cream shadow-flat">
            <EmptyState
              icon={<ClipboardList className="h-10 w-10" />}
              title="Your stable is empty"
              description="List your first horse and start reaching verified buyers on ManeExchange."
              actionLabel="Create Your First Listing"
              actionHref={getCreateListingUrl()}
            />
          </div>
        </section>
      )}

      {/* ─── Mane Score ─── */}
      {maneScore && (
        <section className="mb-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/dashboard/analytics"
            className="rounded-lg bg-paper-cream p-5 shadow-flat transition-all hover:shadow-folded"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gold" />
                <span className="text-sm font-medium text-ink-dark">Mane Score</span>
              </div>
              <ArrowRight className="h-3 w-3 text-ink-faint" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-ink-black">
              {maneScore.mane_score.toLocaleString()}
              <span className="text-lg font-normal text-ink-faint">/1,000</span>
            </p>
            {gradeInfo && (
              <p className={`mt-0.5 text-xs font-medium ${gradeInfo.color}`}>{gradeInfo.label}</p>
            )}
            <p className="mt-2 text-[11px] text-ink-faint">{MANE_SCORE_DISCLAIMER}</p>
          </Link>

          {suggestions.length > 0 && (
            <div className="rounded-lg bg-paper-cream p-5 shadow-flat">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-gold" />
                <span className="text-sm font-medium text-ink-dark">Boost Your Score</span>
              </div>
              <div className="space-y-2">
                {suggestions.slice(0, 3).map((s, i) => (
                  <Link
                    key={i}
                    href={s.link}
                    className="flex items-center justify-between rounded-md bg-paper-white px-3 py-2 text-xs shadow-flat transition-colors hover:bg-paper-warm"
                  >
                    <span className="text-ink-mid">{s.action}</span>
                    <span className="ml-2 whitespace-nowrap font-semibold text-forest">{s.points}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ─── Quick Actions ─── */}
      <section className="mb-8">
        <SectionHeading title="Quick Actions" />
        <ActionPanel
          className="mt-2"
          items={[
            { label: "New Listing", icon: <Plus className="h-4 w-4" />, href: getCreateListingUrl(), accent: "text-oxblood" },
            { label: "View Offers", icon: <HandshakeIcon className="h-4 w-4" />, href: "/dashboard/offers", accent: "text-gold" },
            { label: "Edit Profile", icon: <UserCheck className="h-4 w-4" />, href: "/dashboard/settings", accent: "text-ink-mid" },
            { label: "View Analytics", icon: <BarChart3 className="h-4 w-4" />, href: "/dashboard/analytics", accent: "text-forest" },
          ] satisfies ActionPanelItem[]}
        />
      </section>

      {/* ─── Saved Searches ─── */}
      <section className="mb-8">
        <SavedSearchesWidget />
      </section>
    </div>
  );
}
