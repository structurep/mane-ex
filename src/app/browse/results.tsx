import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
  MapPin,
  Heart,
  Ruler,
  Calendar,
  Sparkles,
  Flame,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { HorseListing } from "@/types/listings";
import { SaveSearchButton } from "./save-search-button";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/marketplace/scroll-reveal";

type Props = {
  params: {
    q?: string;
    discipline?: string;
    minPrice?: string;
    maxPrice?: string;
    state?: string;
    gender?: string;
    breed?: string;
    minHeight?: string;
    maxHeight?: string;
    minAge?: string;
    maxAge?: string;
    henneke?: string;
    soundness?: string;
    region?: string;
    sort?: string;
    page?: string;
  };
};

const PAGE_SIZE = 12;

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export async function BrowseResults({ params }: Props) {
  const supabase = await createClient();
  const page = parseInt(params.page || "1");
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("horse_listings")
    .select(
      `
      id, name, slug, breed, gender, color, age_years, height_hands,
      price, price_display, location_city, location_state,
      completeness_score, completeness_grade,
      view_count, favorite_count, published_at, status,
      media:listing_media!inner(url, is_primary)
    `,
      { count: "exact" }
    )
    .eq("status", "active")
    .range(offset, offset + PAGE_SIZE - 1);

  // Apply filters
  if (params.q) query = query.textSearch("search_vector", params.q);
  if (params.state) query = query.eq("location_state", params.state);
  if (params.gender) query = query.eq("gender", params.gender);
  if (params.minPrice) query = query.gte("price", parseInt(params.minPrice) * 100);
  if (params.maxPrice) query = query.lte("price", parseInt(params.maxPrice) * 100);
  if (params.minHeight) query = query.gte("height_hands", parseFloat(params.minHeight));
  if (params.maxHeight) query = query.lte("height_hands", parseFloat(params.maxHeight));
  if (params.breed) query = query.eq("breed", params.breed);
  if (params.minAge) query = query.gte("age_years", parseInt(params.minAge));
  if (params.maxAge) query = query.lte("age_years", parseInt(params.maxAge));
  if (params.henneke) query = query.eq("henneke_score", parseInt(params.henneke));
  if (params.soundness) query = query.eq("soundness_level", params.soundness);
  if (params.discipline) query = query.contains("discipline_ids", [params.discipline]);
  if (params.region) {
    const regionStates: Record<string, string[]> = {
      southeast: ["FL", "GA", "SC", "NC", "VA", "KY", "TN", "AL", "MS", "LA"],
      northeast: ["NY", "NJ", "PA", "CT", "MA", "MD", "NH", "VT", "ME", "RI"],
      midwest: ["OH", "IL", "MI", "IN", "WI", "MN", "MO", "IA", "KS", "NE"],
      west: ["CA", "OR", "WA", "CO", "MT", "ID", "WY", "UT", "NV"],
      southwest: ["TX", "AZ", "NM", "OK", "AR"],
    };
    const states = regionStates[params.region];
    if (states) query = query.in("location_state", states);
  }

  // Sort
  switch (params.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false, nullsFirst: false });
      break;
    case "score":
      query = query.order("completeness_score", { ascending: false });
      break;
    case "popular":
      query = query.order("favorite_count", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("published_at", { ascending: false, nullsFirst: false });
  }

  const { data: listings, count, error } = await query;

  if (error) {
    return (
      <div className="rounded-lg border border-crease-light bg-paper-cream p-10 text-center">
        <p className="text-ink-mid">
          Something went wrong loading listings. Please try again.
        </p>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    const hasFilters = Object.keys(params).some(
      (k) => k !== "page" && params[k as keyof typeof params]
    );
    return (
      <div className="rounded-lg border border-dashed border-crease-mid bg-paper-cream px-8 py-16 text-center">
        <p className="font-serif text-xl font-semibold text-ink-dark">
          No horses found
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-mid">
          {hasFilters
            ? "No listings match your current filters. Try broadening your search or removing some filters."
            : "Check back soon — new listings are added regularly."}
        </p>
        {hasFilters && (
          <Button variant="outline" size="sm" className="mt-5" asChild>
            <Link href="/browse">Reset All Filters</Link>
          </Button>
        )}
      </div>
    );
  }

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <div>
      {/* Results header */}
      <div className="mb-5 flex items-baseline justify-between">
        <p className="text-[13px] text-ink-mid">
          <span className="font-medium text-ink-dark">{count}</span>{" "}
          {count === 1 ? "horse" : "horses"} available
        </p>
        <SaveSearchButton params={params} />
      </div>

      {/* Card grid */}
      <ScrollReveal className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing, listingIndex) => {
          const l = listing as unknown as HorseListing & {
            media: { url: string; is_primary: boolean }[];
          };
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

          // Build subtitle line
          const subtitleParts = [l.breed, l.color, l.gender].filter(Boolean);
          const subtitle = subtitleParts.length > 0
            ? subtitleParts.join(" · ")
            : null;

          return (
            <Link
              key={l.id}
              href={`/horses/${l.slug}`}
              data-testid="listing-card"
              className="animate-fade-up group"
            >
              {/* Image — borderless, rounded, with hover zoom */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-paper-warm">
                {badge && (
                  <div className={`absolute top-2.5 left-2.5 z-10 flex items-center gap-1 rounded-full ${badge.bg} px-2.5 py-1 text-[11px] font-semibold text-paper-white backdrop-blur-sm`}>
                    <badge.Icon className="h-3 w-3" />
                    {badge.label}
                  </div>
                )}
                {(() => {
                  const primary = l.media?.find((m) => m.is_primary) || l.media?.[0];
                  return primary ? (
                    <Image
                      src={primary.url}
                      alt={l.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      {...(listingIndex === 0 ? { priority: true } : {})}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-ink-faint">
                      No photo
                    </div>
                  );
                })()}

                {/* Saves count — top right */}
                {(l.favorite_count ?? 0) > 0 && (
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 rounded-full bg-ink-black/50 px-2 py-1 text-[11px] font-medium text-paper-white backdrop-blur-sm">
                    <Heart className="h-3 w-3" />
                    {l.favorite_count}
                  </div>
                )}
              </div>

              {/* Content — open layout, no card border */}
              <div className="pt-3">
                {/* Price + Location row */}
                <div className="flex items-baseline justify-between">
                  <p className="font-serif text-lg font-bold tracking-tight text-ink-black">
                    {priceStr}
                  </p>
                  {l.location_state && (
                    <span className="flex items-center gap-0.5 text-[12px] text-ink-mid">
                      <MapPin className="h-3 w-3" />
                      {l.location_city ? `${l.location_city}, ${l.location_state}` : l.location_state}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="mt-0.5 truncate text-[15px] font-medium text-ink-dark group-hover:text-primary">
                  {l.name}
                </h3>

                {/* Subtitle */}
                {subtitle && (
                  <p className="mt-0.5 truncate text-[13px] text-ink-mid">
                    {subtitle}
                  </p>
                )}

                {/* Stats row */}
                <div className="mt-2 flex items-center gap-3 text-[12px] text-ink-light">
                  {l.age_years != null && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {l.age_years} yr{l.age_years !== 1 ? "s" : ""}
                    </span>
                  )}
                  {l.height_hands && (
                    <span className="flex items-center gap-1">
                      <Ruler className="h-3 w-3" />
                      {l.height_hands} hh
                    </span>
                  )}
                  {l.completeness_grade && (
                    <span className={`ml-auto rounded px-1.5 py-0.5 text-[11px] font-semibold capitalize leading-none ${
                      l.completeness_grade === "excellent"
                        ? "bg-forest/10 text-forest"
                        : l.completeness_grade === "good"
                          ? "bg-ink-black/5 text-ink-dark"
                          : "bg-ink-black/5 text-ink-faint"
                    }`}>
                      {l.completeness_grade}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </ScrollReveal>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
          {/* Previous */}
          {page > 1 && (
            <Link
              href={`/browse?${new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
                ),
                page: String(page - 1),
              }).toString()}`}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-mid transition-colors hover:bg-paper-warm hover:text-ink-dark"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/browse?${new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
                ),
                page: String(p),
              }).toString()}`}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                p === page
                  ? "bg-ink-black text-paper-white"
                  : "text-ink-mid hover:bg-paper-warm hover:text-ink-dark"
              }`}
            >
              {p}
            </Link>
          ))}

          {/* Next */}
          {page < totalPages && (
            <Link
              href={`/browse?${new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
                ),
                page: String(page + 1),
              }).toString()}`}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-mid transition-colors hover:bg-paper-warm hover:text-ink-dark"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
