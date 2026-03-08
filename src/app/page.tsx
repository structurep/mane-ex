import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ISOBanner } from "@/components/marketing/iso-banner";
import { PlatformFeatures } from "@/components/marketing/platform-features";
import { ComparisonSection } from "@/components/marketing/comparison-section";
import { TestimonialSection } from "@/components/marketing/testimonial-section";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { HeroSearch } from "@/components/marketing/hero-search";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  Eye,
  Heart,
  Award,
  Sparkles,
} from "lucide-react";

function formatPrice(cents: number | null): string {
  if (!cents) return "Price TBD";
  return `$${(cents / 100).toLocaleString()}`;
}

function formatHeight(hands: number | null): string {
  if (!hands) return "";
  return `${hands}hh`;
}

export default async function Home() {
  const supabase = await createClient();

  // Featured horses: highest Mane Score active listings
  const { data: featured } = await supabase
    .from("horse_listings")
    .select(
      "id, name, slug, breed, price, height_hands, age, gender, location_city, location_state, view_count, favorite_count, completeness_score, discipline_ids, media:listing_media(url, is_primary)"
    )
    .eq("status", "active")
    .order("completeness_score", { ascending: false })
    .limit(6);

  // Active listing count for stats
  const { count: activeCount } = await supabase
    .from("horse_listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

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
            SECTION 1 — HERO
            ══════════════════════════════════════════════ */}
        <section
          aria-label="Hero search"
          className="relative min-h-[85vh] overflow-hidden bg-hero-dark"
          style={{ backgroundColor: "#0F1A12" }}
        >
          <div className="absolute inset-0">
            <picture>
              <source
                media="(max-width: 768px)"
                srcSet="/hero-mobile.webp"
                type="image/webp"
              />
              <img
                src="/hero.webp"
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-30"
                fetchPriority="high"
                decoding="async"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F1A12]/90 via-[#0F1A12]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A12]/70 via-transparent to-transparent" />
          </div>

          <div className="relative flex min-h-[85vh] items-center px-4 md:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <div className="max-w-2xl stagger-children">
                <p className="animate-fade-up overline mb-4 text-coral">
                  THE EQUESTRIAN MARKETPLACE
                </p>
                <h1 className="animate-fade-up mb-6 font-serif text-4xl text-white sm:text-5xl md:text-6xl">
                  Find your
                  <br />
                  next partner.
                </h1>
                <p className="animate-fade-up mb-8 max-w-lg text-lg text-white/85">
                  The modern way to buy and sell hunters, jumpers, and dressage
                  horses. Transparent. Trusted. Beautiful.
                </p>

                <div className="animate-fade-up">
                  <HeroSearch />
                </div>

                <p className="animate-fade-up mt-4 text-sm text-white/80">
                  {activeCount ?? 0} horses listed &middot; Join free
                </p>

                <div className="animate-fade-up mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    className="bg-coral text-white hover:bg-coral-hover hover:scale-[1.02] transition-transform focus-visible:ring-white focus-visible:ring-offset-ink-black"
                    asChild
                  >
                    <Link href="/browse">
                      Browse Horses
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-ink-black border-white/30 text-white hover:bg-ink-dark focus-visible:ring-white focus-visible:ring-offset-ink-black"
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
            SECTION 2 — ISO BANNER
            ══════════════════════════════════════════════ */}
        <ISOBanner />

        {/* ══════════════════════════════════════════════
            SECTION 3 — PLATFORM FEATURES (icon row)
            ══════════════════════════════════════════════ */}
        <PlatformFeatures />

        {/* ══════════════════════════════════════════════
            SECTION 4 — FEATURED LISTINGS
            ══════════════════════════════════════════════ */}
        {featuredListings.length > 0 && (
          <section aria-label="Featured listings" className="bg-paper-white px-4 py-16 md:px-8 md:py-20">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-3xl text-ink-black">
                    Featured Listings
                  </h2>
                  <p className="mt-1 text-sm text-ink-mid">
                    {activeCount ?? 0} horses listed right now
                  </p>
                </div>
                <Link
                  href="/browse"
                  className="hidden items-center gap-1 text-sm font-medium text-ink-dark hover:text-ink-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm md:flex"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featuredListings.map((l) => {
                  const primaryMedia =
                    l.media?.find((m) => m.is_primary) ?? l.media?.[0];
                  const score =
                    typeof l.completeness_score === "number"
                      ? (l.completeness_score as number)
                      : 0;
                  const scorePercent = Math.min(
                    Math.round((score / 1000) * 100),
                    100
                  );

                  return (
                    <Link
                      key={String(l.id)}
                      href={`/horses/${String(l.slug)}`}
                    >
                      <Card className="group overflow-hidden border-0 shadow-flat transition-elevation hover-lift hover:shadow-lifted">
                        {/* Image */}
                        <div className="relative aspect-[4/3] bg-paper-warm">
                          {primaryMedia ? (
                            <Image
                              src={primaryMedia.url}
                              alt={String(l.name)}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-ink-faint">
                              No photo
                            </div>
                          )}
                          {/* Badges */}
                          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                            {score >= 750 && (
                              <span className="flex items-center gap-1 rounded-full bg-coral px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-white shadow-sm">
                                <Award className="h-3 w-3" />
                                Featured Seller
                              </span>
                            )}
                            {score >= 500 && score < 750 && (
                              <span className="flex items-center gap-1 rounded-full bg-ink-black/70 px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
                                <Sparkles className="h-3 w-3" />
                                Featured
                              </span>
                            )}
                          </div>
                          {/* Favorite */}
                          <div className="absolute right-3 top-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm">
                              <Heart className="h-4 w-4 text-coral" />
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4">
                          <p className="font-serif text-lg font-semibold text-ink-black">
                            {formatPrice(
                              typeof l.price === "number"
                                ? (l.price as number)
                                : null
                            )}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-mid">
                            {typeof l.age === "number" && (
                              <span>{l.age as number}yo</span>
                            )}
                            {typeof l.height_hands === "number" && (
                              <>
                                <span className="text-crease-mid">&middot;</span>
                                <span>
                                  {formatHeight(l.height_hands as number)}
                                </span>
                              </>
                            )}
                            {typeof l.gender === "string" && (
                              <>
                                <span className="text-crease-mid">&middot;</span>
                                <span className="capitalize">
                                  {l.gender as string}
                                </span>
                              </>
                            )}
                            {typeof l.breed === "string" && (
                              <>
                                <span className="text-crease-mid">&middot;</span>
                                <span>{l.breed as string}</span>
                              </>
                            )}
                            <span className="ml-auto rounded-full bg-forest/10 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-forest">
                              Active
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs text-ink-light">
                            {typeof l.location_city === "string" &&
                              `${l.location_city as string}, `}
                            {typeof l.location_state === "string" &&
                              (l.location_state as string)}
                          </p>

                          {/* Mane Score bar */}
                          <div className="mt-3 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-warm">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${scorePercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-ink-mid">
                              Mane Score {score}
                            </span>
                          </div>

                          {/* Views */}
                          <div className="mt-2 flex items-center justify-end gap-3 text-[10px] sm:text-xs text-ink-light">
                            {typeof l.view_count === "number" &&
                              (l.view_count as number) > 0 && (
                                <span className="flex items-center gap-0.5">
                                  <Eye className="h-3 w-3" />
                                  {l.view_count as number}+ views
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
                  className="text-sm font-medium text-coral"
                >
                  View All Horses
                  <ArrowRight className="ml-1 inline h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════
            SECTION 5 — COMPARISON (old way vs ManeExchange)
            ══════════════════════════════════════════════ */}
        <ComparisonSection />

        {/* ══════════════════════════════════════════════
            SECTION 6 — TESTIMONIALS
            ══════════════════════════════════════════════ */}
        <TestimonialSection />

        {/* ══════════════════════════════════════════════
            SECTION 7 — BOTTOM CTA
            ══════════════════════════════════════════════ */}
        <BottomCTA />
      </main>

      <Footer />
    </div>
  );
}
