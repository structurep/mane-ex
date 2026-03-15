import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight } from "lucide-react";
import { ListingCard, SectionHeading } from "@/components/tailwind-plus";
import { CompareCardOverlay } from "@/components/compare/compare-card-overlay";

/**
 * Async server component that fetches and renders the featured listings grid.
 * Designed to be wrapped in Suspense so the homepage hero can stream immediately.
 */
export async function FeaturedListings() {
  const supabase = await createClient();

  const [{ data: featured }, { count: activeCount }] = await Promise.all([
    supabase
      .from("horse_listings")
      .select(
        "id, name, slug, breed, price, height_hands, age, gender, location_city, location_state, view_count, favorite_count, completeness_score, discipline_ids, media:listing_media(url, is_primary)"
      )
      .eq("status", "active")
      .order("completeness_score", { ascending: false })
      .limit(6),
    supabase
      .from("horse_listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  const featuredListings = (featured ?? []) as Array<
    Record<string, unknown> & {
      media?: Array<{ url: string; is_primary: boolean }>;
    }
  >;

  if (featuredListings.length === 0) return null;

  return (
    <section aria-label="Featured listings" className="bg-paper-white px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="Featured Listings"
          description={`${activeCount ?? 0} horses listed right now`}
          actions={
            <Link
              href="/browse"
              className="hidden items-center gap-1 text-sm font-medium text-ink-dark hover:text-ink-black md:flex"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
          className="mb-8"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredListings.map((l) => {
            const primaryImg = l.media?.find((m) => m.is_primary) ?? l.media?.[0];
            return (
            <ListingCard
              key={String(l.id)}
              listing={{
                id: String(l.id),
                name: String(l.name),
                slug: String(l.slug),
                breed: typeof l.breed === "string" ? l.breed : null,
                gender: typeof l.gender === "string" ? l.gender : null,
                color: null,
                age_years: typeof l.age === "number" ? l.age : null,
                height_hands: typeof l.height_hands === "number" ? l.height_hands : null,
                price: typeof l.price === "number" ? l.price : null,
                location_city: typeof l.location_city === "string" ? l.location_city : null,
                location_state: typeof l.location_state === "string" ? l.location_state : null,
                completeness_score: typeof l.completeness_score === "number" ? l.completeness_score : null,
                favorite_count: typeof l.favorite_count === "number" ? l.favorite_count : null,
                media: l.media,
              }}
              overlay={
                <CompareCardOverlay
                  item={{ id: String(l.id), name: String(l.name), imageUrl: primaryImg?.url ?? null }}
                />
              }
              priority={false}
            />
            );
          })}
        </div>
        <div className="mt-6 text-center md:hidden">
          <Link href="/browse" className="text-sm font-medium text-saddle">
            View All Horses
            <ArrowRight className="ml-1 inline h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
