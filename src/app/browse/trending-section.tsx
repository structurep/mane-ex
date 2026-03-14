import { getTrendingListings } from "@/actions/trending-listings";
import { ListingCard, type ListingCardData } from "@/components/tailwind-plus";
import { Flame } from "lucide-react";

/**
 * Horizontal-scroll trending horses row at top of /browse.
 * Server component — fetches from 5-min cached endpoint.
 * Only renders if there are trending listings.
 */
export async function TrendingSection() {
  const { listings } = await getTrendingListings(10);

  if (listings.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <Flame className="h-4 w-4 text-oxblood" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-mid">
          Trending Horses
        </h2>
      </div>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide md:-mx-0 md:px-0">
        {listings.map((l, i) => (
          <div key={l.id} className="w-[260px] flex-shrink-0 sm:w-[280px]">
            <ListingCard
              listing={l as unknown as ListingCardData}
              priority={i === 0}
              trending
            />
          </div>
        ))}
      </div>
    </section>
  );
}
