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
} from "lucide-react";

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
  media?: { url: string; is_primary: boolean }[];
}

interface ListingCardProps {
  listing: ListingCardData;
  /** Prioritize image loading (for above-fold cards) */
  priority?: boolean;
  className?: string;
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

/**
 * Listing card for browse grids and featured sections.
 * Borderless open layout with hover zoom, badges, and stats.
 */
export function ListingCard({
  listing: l,
  priority = false,
  className,
}: ListingCardProps) {
  const priceStr = l.price
    ? `$${(l.price / 100).toLocaleString()}`
    : "Contact for Price";

  const daysListed = l.published_at ? daysSince(l.published_at) : 999;
  const badge =
    daysListed < 3
      ? { label: "Just Listed", Icon: Sparkles, bg: "bg-blue/90" }
      : (l.favorite_count ?? 0) > 5
        ? { label: "Popular", Icon: Flame, bg: "bg-oxblood/90" }
        : (l.completeness_score ?? 0) > 800
          ? { label: "Top Rated", Icon: Star, bg: "bg-gold/90" }
          : null;

  const subtitleParts = [l.breed, l.color, l.gender].filter(Boolean);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(" · ") : null;

  const primary = l.media?.find((m) => m.is_primary) ?? l.media?.[0];

  return (
    <Link
      href={`/horses/${l.slug}`}
      data-testid="listing-card"
      className={cn("group", className)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-paper-warm">
        {badge && (
          <div
            className={`absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full ${badge.bg} px-2.5 py-1 text-[11px] font-semibold text-paper-white backdrop-blur-sm`}
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
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            {...(priority ? { priority: true, fetchPriority: "high" as const } : {})}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-faint">
            No photo
          </div>
        )}
        {(l.favorite_count ?? 0) > 0 && (
          <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-ink-black/50 px-2 py-1 text-[11px] font-medium text-paper-white backdrop-blur-sm">
            <Heart className="h-3 w-3" />
            {l.favorite_count}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pt-3">
        <div className="flex items-baseline justify-between">
          <p className="font-serif text-lg font-bold tracking-tight text-ink-black">
            {priceStr}
          </p>
          {l.location_state && (
            <span className="flex items-center gap-0.5 text-[12px] text-ink-mid">
              <MapPin className="h-3 w-3" />
              {l.location_city
                ? `${l.location_city}, ${l.location_state}`
                : l.location_state}
            </span>
          )}
        </div>

        <h3 className="mt-0.5 truncate text-[15px] font-medium text-ink-dark group-hover:text-primary">
          {l.name}
        </h3>

        {subtitle && (
          <p className="mt-0.5 truncate text-[13px] text-ink-mid">{subtitle}</p>
        )}

        <div className="mt-2 flex items-center gap-3 text-[12px] text-ink-light">
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
                "ml-auto rounded px-1.5 py-0.5 text-[11px] font-semibold capitalize leading-none",
                l.completeness_grade === "excellent"
                  ? "bg-forest/10 text-forest"
                  : l.completeness_grade === "good"
                    ? "bg-ink-black/5 text-ink-dark"
                    : "bg-ink-black/5 text-ink-faint"
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
