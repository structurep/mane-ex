"use client";

import Link from "next/link";
import { markNotificationRead } from "@/actions/notifications";
import {
  MessageCircle,
  DollarSign,
  Bell,
  CheckCircle2,
  XCircle,
  Heart,
  Search,
  Truck,
} from "lucide-react";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const typeConfig: Record<string, { icon: typeof Bell; bg: string; iconClass: string }> = {
  message: { icon: MessageCircle, bg: "bg-blue/10", iconClass: "text-blue" },
  offer: { icon: DollarSign, bg: "bg-gold/10", iconClass: "text-gold" },
  listing_status: { icon: CheckCircle2, bg: "bg-forest/10", iconClass: "text-forest" },
  listing_rejected: { icon: XCircle, bg: "bg-red-light", iconClass: "text-red" },
  favorite: { icon: Heart, bg: "bg-oxblood/5", iconClass: "text-oxblood" },
  saved_search: { icon: Search, bg: "bg-forest/10", iconClass: "text-forest" },
  transport_request: { icon: Truck, bg: "bg-[var(--accent-blue)]/10", iconClass: "text-[var(--accent-blue)]" },
};

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationCard({ n }: { n: Notification }) {
  const config = typeConfig[n.type] ?? { icon: Bell, bg: "bg-paper-warm", iconClass: "text-ink-mid" };
  const Icon = config.icon;
  const isUnread = !n.read_at;

  async function handleClick() {
    if (isUnread) {
      markNotificationRead(n.id).catch(() => {});
    }
  }

  const content = (
    <div className="flex gap-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
        <Icon className={`h-4 w-4 ${config.iconClass}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${isUnread ? "font-medium text-ink-black" : "text-ink-dark"}`}>
          {n.title}
        </p>
        {typeof n.body === "string" && (
          <p className="mt-0.5 text-sm text-ink-mid line-clamp-2">{n.body}</p>
        )}
        <p className="mt-1 text-xs text-ink-light">{timeAgo(n.created_at)}</p>
      </div>
      {isUnread && (
        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-oxblood" />
      )}
    </div>
  );

  const className = `block rounded-lg p-4 transition-colors ${
    isUnread ? "bg-paper-cream" : "bg-paper-white hover:bg-paper-cream/50"
  }`;

  if (n.link) {
    return (
      <Link href={n.link} className={className} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
