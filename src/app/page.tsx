import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ISOBanner } from "@/components/marketing/iso-banner";
import { PlatformFeatures } from "@/components/marketing/platform-features";
import { ComparisonSection } from "@/components/marketing/comparison-section";
import { TestimonialSection } from "@/components/marketing/testimonial-section";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { HeroSearch } from "@/components/marketing/hero-search";
import { ArrowRight } from "lucide-react";
import { FeaturedListings } from "./featured-listings";
import { CompareBar } from "@/components/compare/compare-bar";

export const metadata: Metadata = {
  title: "ManeExchange — Buy & Sell Horses with Confidence",
  description:
    "The trusted equine marketplace with escrow protection, verified sellers, and Mane Score transparency. Browse horses for sale, compare listings, and transact securely.",
};

/* ISR: revalidate cached page every 5 minutes */
export const revalidate = 300;

function FeaturedListingsSkeleton() {
  return (
    <section aria-label="Featured listings" className="bg-paper-white px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="h-8 w-48 animate-shimmer rounded" />
          <div className="mt-2 h-4 w-32 animate-shimmer rounded" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/3] animate-shimmer rounded-lg" />
              <div className="space-y-2 pt-3">
                <div className="h-5 w-24 animate-shimmer rounded" />
                <div className="h-4 w-3/4 animate-shimmer rounded" />
                <div className="h-3 w-1/2 animate-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Preload hero images — start download before body parses for faster LCP */}
      <link rel="preload" as="image" href="/hero-mobile.webp" type="image/webp" media="(max-width: 768px)" fetchPriority="high" />
      <link rel="preload" as="image" href="/hero.webp" type="image/webp" media="(min-width: 769px)" fetchPriority="high" />
      <Header />

      <main>
        {/* ══════════════════════════════════════════════
            SECTION 1 — HERO (fully static, no data dependency)
            ══════════════════════════════════════════════ */}
        <section
          aria-label="Hero search"
          className="relative min-h-[85vh] overflow-hidden bg-hero-dark"
          style={{ backgroundColor: "#0F1419" }}
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
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F1419]/90 via-[#16212B]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111315]/85 via-transparent to-transparent" />
          </div>

          <div className="relative flex min-h-[85vh] items-center px-4 md:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <div className="max-w-2xl stagger-children">
                <p className="animate-fade-up overline mb-4 text-gold">
                  THE EQUESTRIAN MARKETPLACE
                </p>
                <h1 className="animate-fade-up display-xl mb-6 text-white">
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
                  Browse verified listings &middot; Join free
                </p>

                <div className="animate-fade-up mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    className="btn-inverse hover:scale-[1.02] transition-transform focus-visible:ring-white focus-visible:ring-offset-ink-black"
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
            SECTION 4 — FEATURED LISTINGS (streamed via Suspense)
            ══════════════════════════════════════════════ */}
        <Suspense fallback={<FeaturedListingsSkeleton />}>
          <FeaturedListings />
        </Suspense>

        {/* ══════════════════════════════════════════════
            SECTION 5 — COMPARISON (old way vs ManeExchange)
            ══════════════════════════════════════════════ */}
        <ComparisonSection />

        {/* ══════════════════════════════════════════════
            SECTION 6 — VALUE PROPOSITIONS
            ══════════════════════════════════════════════ */}
        <TestimonialSection />

        {/* ══════════════════════════════════════════════
            SECTION 7 — BOTTOM CTA
            ══════════════════════════════════════════════ */}
        <BottomCTA />
      </main>

      <Footer />
      <CompareBar />
    </div>
  );
}
