import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ISOBanner } from "@/components/marketing/iso-banner";
import { PlatformFeatures } from "@/components/marketing/platform-features";
import { ComparisonSection } from "@/components/marketing/comparison-section";
import { TestimonialSection } from "@/components/marketing/testimonial-section";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { HeroSearch } from "@/components/marketing/hero-search";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight } from "lucide-react";
import { ListingCard, SectionHeading } from "@/components/tailwind-plus";

export const metadata: Metadata = {
  title: "ManeExchange — Buy & Sell Horses with Confidence",
  description:
    "The trusted equine marketplace with escrow protection, verified sellers, and Mane Score transparency. Browse horses for sale, compare listings, and transact securely.",
};

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
      {/* Preload hero images — start download before body parses for faster LCP */}
      <link rel="preload" as="image" href="/hero-mobile.webp" type="image/webp" media="(max-width: 768px)" />
      <link rel="preload" as="image" href="/hero.webp" type="image/webp" media="(min-width: 769px)" />
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
                {featuredListings.map((l, i) => (
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
                    priority={i < 3}
                  />
                ))}
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
