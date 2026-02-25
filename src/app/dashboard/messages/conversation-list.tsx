"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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
};

export function ConversationList({
  conversations,
}: {
  conversations: ConversationItem[];
}) {
  return (
    <div className="divide-y divide-crease-light rounded-lg border-0 bg-paper-cream shadow-flat">
      {conversations.map((c) => {
        const name =
          c.otherParticipant?.display_name ||
          c.otherParticipant?.full_name ||
          "Unknown";
        const timeAgo = c.lastMessageAt ? formatTimeAgo(c.lastMessageAt) : "";

        return (
          <Link
            key={c.id}
            href={`/dashboard/messages/${c.id}`}
            className="flex items-center gap-4 p-4 transition-colors hover:bg-paper-warm"
          >
            {/* Avatar */}
            <div className="h-10 w-10 shrink-0 rounded-full bg-paper-warm" />

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p
                  className={`text-sm font-medium ${c.unreadCount > 0 ? "text-ink-black" : "text-ink-dark"}`}
                >
                  {name}
                </p>
                <span className="text-xs text-ink-light">{timeAgo}</span>
              </div>
              {c.listing && (
                <p className="text-xs text-ink-light">Re: {c.listing.name}</p>
              )}
              {c.lastMessagePreview && (
                <p
                  className={`mt-0.5 truncate text-sm ${c.unreadCount > 0 ? "font-medium text-ink-dark" : "text-ink-mid"}`}
                >
                  {c.lastMessagePreview}
                </p>
              )}
            </div>

            {/* Unread badge */}
            {c.unreadCount > 0 && (
              <Badge className="shrink-0 bg-primary text-primary-foreground">
                {c.unreadCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </div>
  );
}

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
