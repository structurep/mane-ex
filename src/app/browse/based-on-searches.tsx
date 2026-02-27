import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { TrendingUp, Sparkles, Heart } from "lucide-react";
import type { HorseListing } from "@/types/listings";

type RecommendedListing = HorseListing & {
  media: { url: string; is_primary: boolean }[];
  match_reason?: string;
};

type RecommendedData = {
  listings: RecommendedListing[];
  sectionTitle: string;
  sectionSubtitle: string;
  isPersonalized: boolean;
};

async function fetchRecommendations(
  excludeIds?: string[]
): Promise<RecommendedData | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let listings: RecommendedListing[] = [];
    let sectionTitle = "Trending Now";
    let sectionSubtitle = "Popular this week";
    let isPersonalized = false;

    if (user) {
      // ── Logged-in: personalize from favorites ──
      const { data: favorites } = await supabase
        .from("listing_favorites")
        .select("listing_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (favorites && favorites.length > 0) {
        const favIds = favorites.map((f) => f.listing_id);

        // Get the breeds, disciplines, and price range from favorited listings
        const { data: favListings } = await supabase
          .from("horse_listings")
          .select("breed, discipline_ids, price")
          .in("id", favIds);

        if (favListings && favListings.length > 0) {
          // Extract signals from favorites
          const breeds = [
            ...new Set(
              favListings
                .map((l) => l.breed)
                .filter((b): b is string => b !== null)
            ),
          ];
          const prices = favListings
            .map((l) => l.price)
            .filter((p): p is number => p !== null);
          const minPrice =
            prices.length > 0 ? Math.min(...prices) * 0.5 : null;
          const maxPrice =
            prices.length > 0 ? Math.max(...prices) * 1.5 : null;

          // Build exclude list: already-favorited + already shown in main results
          const allExcludeIds = [...favIds, ...(excludeIds || [])];

          // Try breed match first
          if (breeds.length > 0) {
            const { data: breedMatches } = await supabase
              .from("horse_listings")
              .select(
                `
                id, name, slug, breed, gender, color, age_years, height_hands,
                price, price_display, location_city, location_state,
                completeness_score, completeness_grade,
                view_count, favorite_count, published_at, status,
                media:listing_media!inner(url, is_primary)
              `
              )
              .eq("status", "active")
              .in("breed", breeds)
              .not("id", "in", `(${allExcludeIds.join(",")})`)
              .order("completeness_score", { ascending: false })
              .limit(6);

            if (breedMatches) {
              listings = (
                breedMatches as unknown as RecommendedListing[]
              ).map((l) => ({
                ...l,
                match_reason: "Similar breed",
              }));
            }
          }

          // Fill remaining slots with price range matches
          if (listings.length < 6 && minPrice !== null && maxPrice !== null) {
            const existingIds = [
              ...allExcludeIds,
              ...listings.map((l) => l.id),
            ];
            const { data: priceMatches } = await supabase
              .from("horse_listings")
              .select(
                `
                id, name, slug, breed, gender, color, age_years, height_hands,
                price, price_display, location_city, location_state,
                completeness_score, completeness_grade,
                view_count, favorite_count, published_at, status,
                media:listing_media!inner(url, is_primary)
              `
              )
              .eq("status", "active")
              .gte("price", minPrice)
              .lte("price", maxPrice)
              .not("id", "in", `(${existingIds.join(",")})`)
              .order("completeness_score", { ascending: false })
              .limit(6 - listings.length);

            if (priceMatches) {
              listings = [
                ...listings,
                ...(priceMatches as unknown as RecommendedListing[]).map(
                  (l) => ({
                    ...l,
                    match_reason: "Your price range",
                  })
                ),
              ];
            }
          }

          if (listings.length > 0) {
            sectionTitle = "Based on Your Activity";
            sectionSubtitle = "Personalized for you";
            isPersonalized = true;
          }
        }
      }
    }

    // ── Fallback: trending listings ──
    if (listings.length === 0) {
      const excludeFilter =
        excludeIds && excludeIds.length > 0
          ? excludeIds.join(",")
          : null;

      // Query trending_horses materialized view
      let query = supabase
        .from("trending_horses")
        .select("id, name, slug, breed, price, height_hands, location_state, primary_image_url, view_count, favorite_count, trending_score")
        .order("trending_score", { ascending: false })
        .limit(6);

      if (excludeFilter) {
        query = query.not("id", "in", `(${excludeFilter})`);
      }

      const { data: trending } = await query;

      if (trending && trending.length > 0) {
        // trending_horses view doesn't join media the same way, so we need to
        // fetch the full listing data for these IDs to keep card rendering consistent
        const trendingIds = trending.map((t) => t.id);

        const { data: trendingListings } = await supabase
          .from("horse_listings")
          .select(
            `
            id, name, slug, breed, gender, color, age_years, height_hands,
            price, price_display, location_city, location_state,
            completeness_score, completeness_grade,
            view_count, favorite_count, published_at, status,
            media:listing_media!inner(url, is_primary)
          `
          )
          .in("id", trendingIds)
          .eq("status", "active");

        if (trendingListings) {
          // Preserve trending order
          const listingMap = new Map(
            trendingListings.map((l) => [l.id, l])
          );
          listings = trendingIds
            .map((id) => listingMap.get(id))
            .filter((l): l is NonNullable<typeof l> => l !== undefined)
            .map((l) => ({
              ...(l as unknown as RecommendedListing),
              match_reason: "Trending",
            }));
        }
      }

      sectionTitle = "Trending Now";
      sectionSubtitle = "Popular this week";
      isPersonalized = false;
    }

    if (listings.length === 0) {
      return null;
    }

    return { listings, sectionTitle, sectionSubtitle, isPersonalized };
  } catch {
    return null;
  }
}

export async function BasedOnSearches({
  excludeIds,
}: {
  excludeIds?: string[];
}) {
  const data = await fetchRecommendations(excludeIds);
  if (!data) return null;

  const { listings, sectionTitle, sectionSubtitle, isPersonalized } = data;

  return (
    <section className="mt-12">
        {/* Section header */}
        <div className="mb-4 flex items-center gap-2">
          {isPersonalized ? (
            <Sparkles className="h-5 w-5 text-gold" />
          ) : (
            <TrendingUp className="h-5 w-5 text-primary" />
          )}
          <div>
            <h2 className="text-xl font-bold text-ink-black">{sectionTitle}</h2>
            <p className="text-sm text-ink-light">{sectionSubtitle}</p>
          </div>
        </div>

        {/* Horizontal scrollable row */}
        <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {listings.map((listing) => {
            const l = listing;
            const priceStr = l.price
              ? `$${(l.price / 100).toLocaleString()}`
              : "Contact";

            const primary =
              l.media?.find((m) => m.is_primary) || l.media?.[0];

            return (
              <Link
                key={l.id}
                href={`/horses/${l.slug}`}
                className="group flex-none w-[220px] overflow-hidden rounded-lg border border-border bg-paper-cream shadow-flat transition-elevation hover-lift hover:shadow-lifted md:w-[240px]"
              >
                {/* Image */}
                <div className="relative aspect-[3/2] overflow-hidden bg-paper-warm">
                  {primary ? (
                    <Image
                      src={primary.url}
                      alt={l.name}
                      fill
                      sizes="240px"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-ink-faint">
                      No photo
                    </div>
                  )}
                  {/* Match reason tag */}
                  {l.match_reason && (
                    <span
                      className={`absolute bottom-2 left-2 z-10 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        l.match_reason === "Similar breed"
                          ? "bg-blue text-white"
                          : l.match_reason === "Your price range"
                            ? "bg-forest text-white"
                            : "bg-red text-white"
                      }`}
                    >
                      {l.match_reason}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="truncate font-medium text-ink-black group-hover:text-primary">
                    {l.name}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-ink-mid">
                    {[l.breed, l.age_years != null ? `${l.age_years}yo` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-ink-black">
                      {priceStr}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-ink-light">
                      <Heart className="h-3 w-3" />
                      {l.favorite_count ?? 0}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    );
}
