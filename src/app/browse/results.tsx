import { createClient } from "@/lib/supabase/server";
import type { HorseListing } from "@/types/listings";
import { SaveSearchButton } from "./save-search-button";
import { ScrollReveal } from "@/components/marketplace/scroll-reveal";
import {
  AlertBanner,
  EmptyState,
  Pagination,
  ListingCard,
  type ListingCardData,
} from "@/components/tailwind-plus";
import { getTrendingIds } from "@/actions/trending-listings";
import { getDemandScores } from "@/lib/match/demand-score";

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
    verification?: string;
    sort?: string;
    page?: string;
  };
};

const PAGE_SIZE = 12;

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
      completeness_score, completeness_grade, verification_tier,
      view_count, favorite_count, published_at, status,
      media:listing_media!inner(url, is_primary)
    `,
      { count: "exact" }
    )
    .eq("status", "active")
    .range(offset, offset + PAGE_SIZE - 1);

  // Apply filters — text search with ILIKE fallback for short/simple queries
  if (params.q) {
    const q = params.q.trim();
    if (q.length <= 2) {
      // Short queries: use ILIKE on name/breed
      query = query.or(`name.ilike.%${q}%,breed.ilike.%${q}%`);
    } else {
      // Full-text search using tsvector with websearch syntax for natural queries
      query = query.textSearch("search_vector", q, { type: "websearch" });
    }
  }
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
  if (params.verification) {
    const tiers: Record<string, string[]> = {
      bronze: ["bronze", "silver", "gold"],
      silver: ["silver", "gold"],
      gold: ["gold"],
    };
    const allowed = tiers[params.verification];
    if (allowed) query = query.in("verification_tier", allowed);
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

  const [queryResult, trendingIds, demandScores] = await Promise.all([
    query,
    getTrendingIds(),
    getDemandScores(),
  ]);
  const { data: listings, count, error } = queryResult;

  if (error) {
    return (
      <AlertBanner variant="error">
        Something went wrong loading listings. Please try again.
      </AlertBanner>
    );
  }

  if (!listings || listings.length === 0) {
    const hasFilters = Object.keys(params).some(
      (k) => k !== "page" && params[k as keyof typeof params]
    );
    const searchQuery = params.q?.trim();
    return (
      <div className="rounded-lg border border-dashed border-crease-mid bg-paper-cream">
        <EmptyState
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="size-10">
              <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          title={searchQuery ? `No results for "${searchQuery}"` : "No horses found"}
          description={
            searchQuery
              ? "Try a different search term, check your spelling, or remove some filters."
              : hasFilters
                ? "No listings match your current filters. Try broadening your search or removing some filters."
                : "Check back soon — new listings are added regularly."
          }
          actionLabel={hasFilters || searchQuery ? "Reset All Filters" : undefined}
          actionHref={hasFilters || searchQuery ? "/browse" : undefined}
        />
      </div>
    );
  }

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <div>
      {/* Results header */}
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[13px] text-ink-mid">
          <span className="font-medium text-ink-dark">{count}</span>{" "}
          {count === 1 ? "horse" : "horses"}
          {params.q ? <> matching <span className="font-medium text-ink-dark">&ldquo;{params.q}&rdquo;</span></> : " available"}
        </p>
        <SaveSearchButton params={params} />
      </div>

      {/* Card grid */}
      <ScrollReveal className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing, listingIndex) => {
          const l = listing as unknown as ListingCardData & {
            media: { url: string; is_primary: boolean }[];
            published_at: string | null;
          };
          return (
            <ListingCard
              key={l.id}
              listing={l}
              priority={listingIndex === 0}
              trending={trendingIds.has(l.id)}
              demandScore={demandScores.get(l.id)?.score ?? null}
              className="animate-fade-up"
            />
          );
        })}
      </ScrollReveal>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        buildHref={(p) => {
          const sp = new URLSearchParams(
            Object.fromEntries(
              Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
            )
          );
          sp.set("page", String(p));
          return `/browse?${sp.toString()}`;
        }}
        className="mt-10"
      />
    </div>
  );
}
