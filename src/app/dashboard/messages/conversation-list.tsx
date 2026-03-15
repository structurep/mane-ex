"use client";

import { MessageSquare } from "lucide-react";
import { StackedList, StatusBadge, EmptyState, type StackedListItem } from "@/components/tailwind-plus";
import { BuyerBadge } from "@/components/buyer/buyer-badge";
import type { QualificationBadge } from "@/lib/buyer/qualification-score";

type ConversationItem = {
  id: string;
  otherParticipant: {
    id: string;
    display_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  listing: { id: string; name: string; slug: string } | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  buyerBadge?: QualificationBadge | null;
  buyerLevel?: string | null;
  buyerBudgetMin?: number | null;
  buyerBudgetMax?: number | null;
};

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ConversationList({
  conversations,
}: {
  conversations: ConversationItem[];
}) {
  if (conversations.length === 0) {
    return (
      <div className="rounded-lg bg-paper-cream shadow-flat">
        <EmptyState
          icon={<MessageSquare className="h-10 w-10" />}
          title="No messages yet"
          description="When you contact a seller or receive an inquiry, conversations will appear here."
          actionLabel="Browse horses"
          actionHref="/browse"
        />
      </div>
    );
  }

  const items: StackedListItem[] = conversations.map((c) => {
    const name =
      c.otherParticipant?.display_name ||
      c.otherParticipant?.full_name ||
      "Unknown";
    const timeStr = c.lastMessageAt ? formatTimeAgo(c.lastMessageAt) : "";
    const horseName = c.listing?.name;

    // Build buyer summary line for sellers
    const budgetStr = c.buyerBudgetMin != null || c.buyerBudgetMax != null
      ? `$${((c.buyerBudgetMin ?? 0) / 100).toLocaleString()}–$${((c.buyerBudgetMax ?? 0) / 100).toLocaleString()}`
      : null;
    const buyerMeta = [c.buyerLevel, budgetStr].filter(Boolean).join(" · ");

    const badgeLabel = c.buyerBadge && c.buyerBadge !== "Unverified" ? ` · ${c.buyerBadge}` : "";
    const subtitleBase = horseName
      ? `Re: ${horseName} · ${c.lastMessagePreview?.slice(0, 50) || ""}`
      : c.lastMessagePreview?.slice(0, 70) || "No messages";
    const subtitleFull = buyerMeta
      ? `${subtitleBase} · ${buyerMeta}`
      : subtitleBase;

    return {
      id: c.id,
      href: `/dashboard/messages/${c.id}`,
      imageUrl: c.otherParticipant?.avatar_url || undefined,
      initials: name.charAt(0).toUpperCase(),
      title: `${name}${badgeLabel}`,
      subtitle: subtitleFull,
      meta: <span className="text-xs text-ink-faint">{timeStr}</span>,
      badge: c.unreadCount > 0 ? (
        <StatusBadge variant="navy">{c.unreadCount}</StatusBadge>
      ) : undefined,
    };
  });

  return (
    <div className="rounded-lg bg-paper-cream px-4 shadow-flat">
      <StackedList items={items} />
    </div>
  );
}
