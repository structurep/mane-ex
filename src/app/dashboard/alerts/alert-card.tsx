"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MatchAlert } from "@/lib/match/match-alerts";
import { markMatchAlertRead } from "@/lib/match/match-alerts";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function AlertCard({ alert }: { alert: MatchAlert }) {
  const l = alert.listing;
  const isUnread = !alert.read_at;
  const primary = l.media?.find((m) => m.is_primary) ?? l.media?.[0];
  const priceStr = l.price
    ? `$${(l.price / 100).toLocaleString()}`
    : "Contact for Price";

  async function handleClick() {
    if (isUnread) {
      markMatchAlertRead(alert.id).catch(() => {});
    }
  }

  return (
    <Link
      href={`/horses/${l.slug}`}
      onClick={handleClick}
      className={cn(
        "paper-flat flex gap-4 p-3 transition-elevation hover-lift",
        isUnread && "border-l-2 border-l-[var(--accent-gold)] bg-[var(--accent-gold-soft)]"
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-20 w-20 flex-none overflow-hidden rounded-[var(--radius-card)] border border-[var(--paper-border)] bg-[var(--paper-warm)]">
        {primary ? (
          <Image
            src={primary.url}
            alt={l.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--ink-faint)]">
            No photo
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[var(--ink-black)]">
              {l.name}
            </h3>
            <p className="text-sm font-medium text-[var(--ink-dark)]">{priceStr}</p>
          </div>
          <div className="badge-seal flex-none border-[var(--accent-gold)]/40 text-[var(--accent-gold)]">
            <Star className="h-3 w-3" />
            {alert.match_percent}%
          </div>
        </div>

        <div className="mt-1 flex items-center gap-3 text-xs text-[var(--ink-mid)]">
          {l.breed && <span>{l.breed}</span>}
          {l.location_state && (
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {l.location_state}
            </span>
          )}
          <span className="ml-auto text-[var(--ink-faint)]">
            {timeAgo(alert.created_at)}
          </span>
        </div>
      </div>

      {/* Unread indicator */}
      {isUnread && (
        <div className="flex flex-none items-center">
          <div className="h-2 w-2 rounded-full bg-[var(--accent-gold)]" />
        </div>
      )}
    </Link>
  );
}
