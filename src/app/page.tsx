import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomCTA } from "@/components/bottom-cta";
import { HeroSearch } from "@/components/hero-search";
import { FeatureGrid } from "@/components/feature-grid";
import { TestimonialSection } from "@/components/testimonial-section";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  Eye,
  Heart,
  Shield,
  BarChart3,
  Bookmark,
  UserCheck,
  GitCompareArrows,
  Search,
} from "lucide-react";

function formatPrice(cents: number | null): string {
  if (!cents) return "Price TBD";
  return `$${(cents / 100).toLocaleString()}`;
}

const platformFeatures = [
  {
    icon: Shield,
    title: "ManeVault Escrow",
    description:
      "Funds held securely until the horse is delivered and inspected. No more wiring money to strangers.",
  },
  {
    icon: BarChart3,
    title: "Mane Score",
    description:
      "Every seller earns a transparent quality score based on completeness, responsiveness, and transaction history.",
  },
  {
    icon: Bookmark,
    title: "Dream Barn",
    description:
      "Save favorites, track price changes, and organize your search into collections you can share with your trainer.",
  },
  {
    icon: UserCheck,
    title: "Verified Sellers",
    description:
      "Identity-verified sellers with documented track records. Look for the verified badge on every listing.",
  },
  {
    icon: GitCompareArrows,
    title: "Compare Side-by-Side",
    description:
      "Put two horses next to each other — vet records, show history, conformation, price — and make a confident decision.",
  },
  {
    icon: Search,
    title: "ISO Matching",
    description:
      "Post what you're looking for and let sellers come to you. Our matching engine connects the right horses to the right riders.",
  },
];

export default async function Home() {
  const supabase = await createClient();

  // Featured horses: highest Mane Score active listings
  const { data: featured } = await supabase
    .from("horse_listings")
    .select(
      "id, name, slug, breed, price, location_state, view_count, favorite_count, media:listing_media(url, is_primary)"
    )
    .eq("status", "active")
    .order("completeness_score", { ascending: false })
    .limit(6);

  const featuredListings = (featured ?? []) as Array<
    Record<string, unknown> & {
      media?: Array<{ url: string; is_primary: boolean }>;
    }
  >;

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* ══════════════════════════════════════════════
            SECTION 1 — HERO (full-bleed photo + search)
            ══════════════════════════════════════════════ */}
        <section
          className="relative min-h-[85vh] overflow-hidden bg-hero-dark"
          style={{ backgroundColor: "#0F1A12" }}
        >
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1920&q=80&auto=format&fit=crop"
              alt=""
              fill
              className="object-cover opacity-20"
              priority
              fetchPriority="high"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F1A12]/90 via-[#0F1A12]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A12]/80 via-transparent to-transparent" />
          </div>

          <div className="relative flex min-h-[85vh] items-center px-4 md:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <div className="max-w-2xl">
                <h1 className="mb-6 font-serif text-4xl text-white sm:text-5xl md:text-6xl">
                  Find your
                  <br />
                  next partner.
                </h1>
                <p className="mb-8 max-w-lg text-lg text-white/70">
                  Verified listings. Secured payments. The marketplace built for
                  equestrians.
                </p>

                <HeroSearch />

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/browse">
                      Browse Horses
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="!bg-transparent border-white/30 text-white hover:!bg-white/10"
                    asChild
                  >
                    <Link href="/sell">List Your Horse</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 2 — FEATURED LISTINGS (3-col grid)
            ══════════════════════════════════════════════ */}
        {featuredListings.length > 0 && (
          <section className="bg-paper-white px-4 py-16 md:px-8 md:py-20">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="font-serif text-3xl text-ink-black">
                  Featured Listings
                </h2>
                <Button variant="outline" asChild className="hidden md:flex">
                  <Link href="/browse" className="gap-1.5">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featuredListings.map((l) => {
                  const primaryMedia = l.media?.find((m) => m.is_primary) ?? l.media?.[0];
                  return (
                  <Link
                    key={String(l.id)}
                    href={`/horses/${String(l.slug)}`}
                  >
                    <Card className="group overflow-hidden border-0 shadow-flat transition-elevation hover-lift hover:shadow-lifted">
                      <div className="relative aspect-[4/3] bg-paper-warm">
                        {primaryMedia ? (
                          <>
                            <Image
                              src={primaryMedia.url}
                              alt={String(l.name)}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                            <span className="absolute bottom-3 left-3 font-serif text-lg font-semibold text-white">
                              {formatPrice(
                                typeof l.price === "number"
                                  ? (l.price as number)
                                  : null
                              )}
                            </span>
                          </>
                        ) : (
                          <div className="flex h-full items-center justify-center text-ink-faint">
                            No photo
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-heading text-sm font-semibold text-ink-black line-clamp-1">
                          {String(l.name)}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-ink-mid">
                          {typeof l.breed === "string" && (
                            <span>{l.breed}</span>
                          )}
                          {typeof l.location_state === "string" && (
                            <span>{l.location_state}</span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-end gap-2 text-xs text-ink-light">
                          {typeof l.view_count === "number" &&
                            (l.view_count as number) > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Eye className="h-3 w-3" />
                                {l.view_count as number}
                              </span>
                            )}
                          {typeof l.favorite_count === "number" &&
                            (l.favorite_count as number) > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Heart className="h-3 w-3" />
                                {l.favorite_count as number}
                              </span>
                            )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                  );
                })}
              </div>
              <div className="mt-6 text-center md:hidden">
                <Link
                  href="/browse"
                  className="text-sm font-medium text-primary"
                >
                  View All Horses
                  <ArrowRight className="ml-1 inline h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════
            SECTION 3 — FEATURE GRID (dark, 6 features)
            ══════════════════════════════════════════════ */}
        <FeatureGrid
          title="A better way to find your horse."
          subtitle="Every feature is designed to bring transparency, trust, and confidence to the equestrian marketplace."
          features={platformFeatures}
          columns={3}
          dark
        />

        {/* ══════════════════════════════════════════════
            SECTION 4 — TESTIMONIALS
            ══════════════════════════════════════════════ */}
        <TestimonialSection />

        {/* ══════════════════════════════════════════════
            SECTION 5 — BOTTOM CTA
            ══════════════════════════════════════════════ */}
        <BottomCTA />
      </main>

      <Footer />
    </div>
  );
}
