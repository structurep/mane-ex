import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
  MapPin,
  Heart,
  Ruler,
  Calendar,
  BarChart3,
  Sparkles,
  Flame,
  Star,
} from "lucide-react";
import type { HorseListing } from "@/types/listings";
import { SaveSearchButton } from "./save-search-button";
import { ScrollReveal } from "@/components/scroll-reveal";

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
  if (params.q) {
    query = query.textSearch("search_vector", params.q);
  }
  if (params.state) {
    query = query.eq("location_state", params.state);
  }
  if (params.gender) {
    query = query.eq("gender", params.gender);
  }
  if (params.minPrice) {
    query = query.gte("price", parseInt(params.minPrice) * 100);
  }
  if (params.maxPrice) {
    query = query.lte("price", parseInt(params.maxPrice) * 100);
  }
  if (params.minHeight) {
    query = query.gte("height_hands", parseFloat(params.minHeight));
  }
  if (params.maxHeight) {
    query = query.lte("height_hands", parseFloat(params.maxHeight));
  }
  if (params.breed) {
    query = query.eq("breed", params.breed);
  }
  if (params.minAge) {
    query = query.gte("age_years", parseInt(params.minAge));
  }
  if (params.maxAge) {
    query = query.lte("age_years", parseInt(params.maxAge));
  }
  if (params.henneke) {
    query = query.eq("henneke_score", parseInt(params.henneke));
  }
  if (params.soundness) {
    query = query.eq("soundness_level", params.soundness);
  }
  if (params.region) {
    const regionStates: Record<string, string[]> = {
      southeast: ["FL", "GA", "SC", "NC", "VA", "KY", "TN", "AL", "MS", "LA"],
      northeast: ["NY", "NJ", "PA", "CT", "MA", "MD", "NH", "VT", "ME", "RI"],
      midwest: ["OH", "IL", "MI", "IN", "WI", "MN", "MO", "IA", "KS", "NE"],
      west: ["CA", "OR", "WA", "CO", "MT", "ID", "WY", "UT", "NV"],
      southwest: ["TX", "AZ", "NM", "OK", "AR"],
    };
    const states = regionStates[params.region];
    if (states) {
      query = query.in("location_state", states);
    }
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
      query = query.order("published_at", {
        ascending: false,
        nullsFirst: false,
      });
  }

  const { data: listings, count, error } = await query;

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-paper-cream p-8 text-center">
        <p className="text-ink-mid">
          Something went wrong loading listings. Please try again.
        </p>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-crease-mid bg-paper-cream p-12 text-center">
        <p className="text-lg font-medium text-ink-dark">No horses found</p>
        <p className="mt-1 text-sm text-ink-mid">
          Try adjusting your filters or check back soon for new listings.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <div>
      {/* Results count + timestamp */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-normal text-ink-mid">
          {count} horse{count !== 1 ? "s" : ""} available
          <span className="ml-1 text-ink-light">· Updated just now</span>
        </h2>
        <SaveSearchButton params={params} />
      </div>

      {/* Card grid with scroll-reveal */}
      <ScrollReveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => {
          const l = listing as unknown as HorseListing & {
            media: { url: string; is_primary: boolean }[];
          };
          const priceStr = l.price
            ? `$${(l.price / 100).toLocaleString()}`
            : "Contact";

          // FOMO badge: New (<3 days) > Popular (>5 saves) > Featured (score >800)
          const daysListed = l.published_at
            ? daysSince(l.published_at)
            : 999;
          const fomoBadge =
            daysListed < 3
              ? { label: "New", icon: Sparkles, className: "bg-blue text-paper-white" }
              : (l.favorite_count ?? 0) > 5
                ? { label: "Popular", icon: Flame, className: "bg-red text-paper-white" }
                : (l.completeness_score ?? 0) > 800
                  ? { label: "Top Rated", icon: Star, className: "bg-gold text-paper-white" }
                  : null;

          return (
            <Link
              key={l.id}
              href={`/horses/${l.slug}`}
              className="animate-fade-up group overflow-hidden rounded-lg bg-paper-white shadow-flat transition-all duration-300 hover:shadow-lifted"
            >
              {/* Image with gradient overlay price */}
              <div className="relative aspect-[3/2] overflow-hidden bg-paper-warm">
                {/* FOMO Badge */}
                {fomoBadge && (
                  <div className={`absolute top-2.5 left-2.5 z-10 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${fomoBadge.className}`}>
                    <fomoBadge.icon className="h-3 w-3" />
                    {fomoBadge.label}
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
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : null;
                })()}
                {/* Price overlay on gradient */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-black/70 via-ink-black/30 to-transparent px-3 pb-3 pt-8">
                  <p className="font-serif text-lg font-bold text-paper-white drop-shadow-sm">
                    {priceStr}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-3.5">
                <h3 className="font-medium text-ink-black group-hover:text-primary">
                  {l.name}
                </h3>
                <p className="mt-0.5 text-sm text-ink-mid">
                  {[l.breed, l.color].filter(Boolean).join(" · ")}
                </p>

                {/* Quick stats */}
                <div className="mt-2.5 flex flex-wrap gap-3 text-xs text-ink-light">
                  {l.age_years != null && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {l.age_years}yo
                    </span>
                  )}
                  {l.height_hands && (
                    <span className="flex items-center gap-1">
                      <Ruler className="h-3 w-3" />
                      {l.height_hands}hh
                    </span>
                  )}
                  {l.location_state && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {l.location_state}
                    </span>
                  )}
                </div>

                {/* Score + Saves */}
                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <span
                    className={`flex items-center gap-1 font-medium ${
                      l.completeness_grade === "excellent"
                        ? "text-forest"
                        : l.completeness_grade === "good"
                          ? "text-blue"
                          : "text-ink-light"
                    }`}
                  >
                    <BarChart3 className="h-3 w-3" />
                    {l.completeness_score}
                  </span>
                  <span className="flex items-center gap-1 text-ink-light">
                    <Heart className="h-3 w-3" />
                    {l.favorite_count}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </ScrollReveal>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/browse?${new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(params).filter(
                    ([, v]) => v !== undefined
                  ) as [string, string][]
                ),
                page: String(p),
              }).toString()}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "bg-paper-warm text-ink-mid hover:bg-paper-white"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
