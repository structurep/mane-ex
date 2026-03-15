import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Heart,
  MapPin,
  Calendar,
  Ruler,
  Sparkles,
  Flame,
  Star,
  TrendingUp,
} from "lucide-react";
import type { VerificationTier } from "@/lib/listings/verification-tier";
import { VerificationBadge } from "@/components/listings/verification-badge";

export interface ListingCardData {
  id: string;
  name: string;
  slug: string;
  breed?: string | null;
  gender?: string | null;
  color?: string | null;
  age_years?: number | null;
  height_hands?: number | null;
  price?: number | null;
  location_city?: string | null;
  location_state?: string | null;
  completeness_score?: number | null;
  completeness_grade?: string | null;
  favorite_count?: number | null;
  published_at?: string | null;
  verification_tier?: VerificationTier | null;
  media?: { url: string; is_primary: boolean }[];
}

interface ListingCardProps {
  listing: ListingCardData;
  /** Prioritize image loading (for above-fold cards) */
  priority?: boolean;
  /** Show Hot badge (top trending listings) */
  trending?: boolean;
  /** Demand score 0–100 from swipe engagement */
  demandScore?: number | null;
  /** AI match percentage 0–100 */
  matchPercent?: number | null;
  /** Show debug overlay with score breakdown */
  debugScores?: { discipline: number; price: number; location: number; height: number; verification: number } | null;
  className?: string;
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

/**
 * Listing card — Origami design system.
 * Paper-framed image with fold corner, corner-flag badges, and editorial typography.
 */
export function ListingCard({
  listing: l,
  priority = false,
  trending = false,
  demandScore,
  matchPercent,
  debugScores,
  className,
}: ListingCardProps) {
  const priceStr = l.price
    ? `$${(l.price / 100).toLocaleString()}`
    : "Contact for Price";

  const daysListed = l.published_at ? daysSince(l.published_at) : 999;
  const badge = trending
    ? { label: "Hot", Icon: Flame, color: "bg-[var(--accent-red)] text-white" }
    : daysListed < 3
      ? { label: "Just Listed", Icon: Sparkles, color: "bg-[var(--ink-black)] text-white" }
      : (l.favorite_count ?? 0) > 5
        ? { label: "Popular", Icon: Flame, color: "bg-[var(--accent-red)] text-white" }
        : (l.completeness_score ?? 0) > 800
          ? { label: "Top Rated", Icon: Star, color: "bg-[var(--accent-gold)] text-white" }
          : null;

  const subtitleParts = [l.breed, l.color, l.gender].filter(Boolean);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(" · ") : null;

  const primary = l.media?.find((m) => m.is_primary) ?? l.media?.[0];

  return (
    <Link
      href={`/horses/${l.slug}`}
      data-testid="listing-card"
      className={cn(
        "group relative block transition-elevation hover-lift",
        className
      )}
    >
      {/* Paper-framed image container */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-[var(--paper-border)] bg-[var(--paper-warm)]">
        {/* Top-left corner flag badge */}
        {badge && (
          <div
            className={`badge-flag flex items-center gap-1 ${badge.color}`}
          >
            <badge.Icon className="h-3 w-3" />
            {badge.label}
          </div>
        )}

        {primary ? (
          <Image
            src={primary.url}
            alt={l.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            {...(priority ? { priority: true, fetchPriority: "high" as const } : {})}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--ink-faint)]">
            No photo
          </div>
        )}

        {/* Match % — right corner flag */}
        {matchPercent != null && matchPercent >= 70 ? (
          <div className="badge-flag-right flex items-center gap-1 bg-[var(--accent-gold)] text-white">
            <Star className="h-3 w-3" />
            {matchPercent}% Match
          </div>
        ) : (l.favorite_count ?? 0) > 0 ? (
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-[var(--radius-badge)] bg-[var(--ink-black)]/50 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            <Heart className="h-3 w-3" />
            {l.favorite_count}
          </div>
        ) : null}

        {/* Fold corner accent on image */}
        <div className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 bg-gradient-to-tl from-[var(--paper-bg)]/60 to-transparent" />

        {debugScores && (
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-[var(--ink-black)]/80 px-2 py-1.5 text-[9px] font-mono text-white">
            <div className="grid grid-cols-3 gap-x-2">
              <span>disc: {debugScores.discipline}</span>
              <span>price: {debugScores.price}</span>
              <span>loc: {debugScores.location}</span>
              <span>ht: {debugScores.height}</span>
              <span>ver: {debugScores.verification}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content — editorial layout */}
      <div className="pt-3">
        <div className="flex items-baseline justify-between">
          <p className="font-serif text-lg font-bold tracking-tight text-[var(--ink-black)]">
            {priceStr}
          </p>
          {l.location_state && (
            <span className="flex items-center gap-0.5 text-[12px] text-[var(--ink-mid)]">
              <MapPin className="h-3 w-3" />
              {l.location_city
                ? `${l.location_city}, ${l.location_state}`
                : l.location_state}
            </span>
          )}
        </div>

        <h3 className="mt-0.5 truncate text-[15px] font-medium text-[var(--ink-dark)] group-hover:text-[var(--ink-black)]">
          {l.name}
        </h3>

        {subtitle && (
          <p className="mt-0.5 truncate text-[13px] text-[var(--ink-mid)]">{subtitle}</p>
        )}

        {l.verification_tier && l.verification_tier !== "none" && (
          <div className="mt-1.5">
            <VerificationBadge tier={l.verification_tier} compact />
          </div>
        )}

        {demandScore != null && demandScore >= 40 && (
          <div className={cn(
            "badge-seal mt-1.5",
            demandScore >= 70
              ? "border-[var(--accent-red)] text-[var(--accent-red)]"
              : "border-[var(--accent-green)] text-[var(--accent-green)]"
          )}>
            {demandScore >= 70 ? <Flame className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
            {demandScore >= 70 ? "High Demand" : "Popular"}
          </div>
        )}

        <div className="mt-2 flex items-center gap-3 text-[12px] text-[var(--ink-soft)]">
          {l.age_years != null && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {l.age_years} yr{l.age_years !== 1 ? "s" : ""}
            </span>
          )}
          {l.height_hands != null && (
            <span className="flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              {l.height_hands} hh
            </span>
          )}
          {l.completeness_grade && (
            <span
              className={cn(
                "ml-auto rounded-[var(--radius-badge)] px-1.5 py-0.5 text-[11px] font-semibold capitalize leading-none",
                l.completeness_grade === "excellent"
                  ? "bg-[var(--accent-green-soft)] text-[var(--accent-green)]"
                  : l.completeness_grade === "good"
                    ? "bg-[var(--ink-black)]/5 text-[var(--ink-dark)]"
                    : "bg-[var(--ink-black)]/5 text-[var(--ink-faint)]"
              )}
            >
              {l.completeness_grade}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
