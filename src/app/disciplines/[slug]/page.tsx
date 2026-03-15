import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { Button } from "@/components/ui/button";
import { getCreateListingUrl } from "@/lib/urls";
import {
  ArrowRight,
  MapPin,
  Calendar,
  Ruler,
  BarChart3,
  Heart,
  Sparkles,
  Flame,
  Star,
} from "lucide-react";
import type { HorseListing } from "@/types/listings";

/* ─── Discipline configuration ─── */

interface DisciplineConfig {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  heroImage: string;
  searchTerms: string[];
  relatedDisciplines: string[];
  priceRange: string;
  popularBreeds: string[];
  tips: string[];
}

const DISCIPLINES: Record<string, DisciplineConfig> = {
  "hunter-jumper": {
    name: "Hunter/Jumper",
    slug: "hunter-jumper",
    tagline: "Find your next partner over fences.",
    description:
      "Browse hunter, jumper, and equitation horses — from schoolmasters to Grand Prix prospects. Every listing includes show records, movement video, and verified documentation.",
    heroImage:
      "/placeholders/horses/horse-1.jpg",
    searchTerms: ["Hunter", "Jumper", "Equitation", "Hunter/Jumper", "Show Jumping"],
    relatedDisciplines: ["eventing", "equitation"],
    priceRange: "$15,000 – $250,000+",
    popularBreeds: ["Warmblood", "Thoroughbred", "Holsteiner", "Hanoverian", "Irish Sport Horse"],
    tips: [
      "Look for scope and rideability over raw power",
      "Under-saddle video over fences is essential",
      "Ask about show record at your competition level",
    ],
  },
  dressage: {
    name: "Dressage",
    slug: "dressage",
    tagline: "Harmony in motion.",
    description:
      "From Training Level schoolmasters to FEI Grand Prix prospects. Filter by training level, movement quality, and USDF competition records.",
    heroImage:
      "/placeholders/horses/horse-2.jpg",
    searchTerms: ["Dressage"],
    relatedDisciplines: ["eventing"],
    priceRange: "$20,000 – $500,000+",
    popularBreeds: ["Hanoverian", "Dutch Warmblood", "Oldenburg", "Trakehner", "Friesian"],
    tips: [
      "Straightness and regularity matter more than flashy gaits",
      "Ask for walk/trot/canter video on both reins",
      "Training Level horses suit riders moving up from other disciplines",
    ],
  },
  eventing: {
    name: "Eventing",
    slug: "eventing",
    tagline: "The ultimate all-around athlete.",
    description:
      "Three-phase horses for every level — Beginner Novice through Advanced. Bravery, fitness, and versatility in one listing.",
    heroImage:
      "/placeholders/horses/horse-3.jpg",
    searchTerms: ["Eventing"],
    relatedDisciplines: ["hunter-jumper", "dressage"],
    priceRange: "$10,000 – $150,000+",
    popularBreeds: ["Thoroughbred", "Irish Sport Horse", "Warmblood", "Appendix", "Trakehner"],
    tips: [
      "Thoroughbreds and TB crosses dominate the upper levels",
      "Ask about cross-country experience and boldness",
      "Soundness history is critical for this demanding sport",
    ],
  },
  western: {
    name: "Western",
    slug: "western",
    tagline: "Bred for the ride.",
    description:
      "Quarter Horses, Paints, and Appaloosas for western pleasure, reining, cutting, barrel racing, and ranch work. AQHA records and bloodline verification available.",
    heroImage:
      "/placeholders/horses/horse-4.jpg",
    searchTerms: ["Western Pleasure", "Reining", "Western"],
    relatedDisciplines: ["trail"],
    priceRange: "$5,000 – $100,000+",
    popularBreeds: ["Quarter Horse", "Paint", "Appaloosa", "Arabian"],
    tips: [
      "Bloodlines matter in western — ask about sire/dam records",
      "AQHA points and show records verify competition level",
      "Look for willingness and trainability over flash",
    ],
  },
  trail: {
    name: "Trail & Pleasure",
    slug: "trail",
    tagline: "Your next adventure starts in the saddle.",
    description:
      "Experienced, sure-footed, sensible trail horses and pleasure mounts. These are the dependable partners that make every ride enjoyable.",
    heroImage:
      "/placeholders/horses/horse-5.jpg",
    searchTerms: ["Trail"],
    relatedDisciplines: ["western"],
    priceRange: "$3,000 – $25,000",
    popularBreeds: ["Quarter Horse", "Morgan", "Arabian", "Tennessee Walker", "Mustang"],
    tips: [
      "Temperament is everything — look for calm, confident horses",
      "Trailering experience and water crossing comfort are key",
      "Older, experienced horses are often the best trail partners",
    ],
  },
  breeding: {
    name: "Breeding Stock",
    slug: "breeding",
    tagline: "The foundation of your program.",
    description:
      "Broodmares, stallions, and young stock with proven bloodlines. Registry verification, reproductive history, and progeny records.",
    heroImage:
      "/placeholders/horses/horse-6.jpg",
    searchTerms: ["Breeding"],
    relatedDisciplines: ["western", "dressage"],
    priceRange: "$5,000 – $200,000+",
    popularBreeds: ["Warmblood", "Quarter Horse", "Thoroughbred", "Hanoverian", "Trakehner"],
    tips: [
      "Registry verification is essential for breeding stock",
      "Ask about reproductive history and foaling records",
      "Progeny records speak louder than the horse's own record",
    ],
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const disc = DISCIPLINES[slug];
  if (!disc) return { title: "Discipline Not Found" };

  return {
    title: `${disc.name} Horses for Sale`,
    description: disc.description,
  };
}

export function generateStaticParams() {
  return Object.keys(DISCIPLINES).map((slug) => ({ slug }));
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export default async function DisciplinePage({ params }: Props) {
  const { slug } = await params;
  const disc = DISCIPLINES[slug];

  if (!disc) notFound();

  const supabase = await createClient();

  // Fetch listings matching this discipline
  const { data: listings, count } = await supabase
    .from("horse_listings")
    .select(
      `
      id, name, slug, breed, gender, color, age_years, height_hands,
      price, location_city, location_state,
      completeness_score, completeness_grade,
      view_count, favorite_count, published_at, status,
      media:listing_media!inner(url, is_primary)
    `,
      { count: "exact" }
    )
    .eq("status", "active")
    .or(disc.searchTerms.map((t) => `discipline.eq.${t}`).join(","))
    .order("completeness_score", { ascending: false })
    .limit(12);

  const horses = (listings || []) as unknown as (HorseListing & {
    media: { url: string; is_primary: boolean }[];
  })[];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden bg-paddock">
          <div className="absolute inset-0">
            <Image
              src={disc.heroImage}
              alt=""
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>
          <div className="relative px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto max-w-7xl">
              <p className="overline mb-3 text-white/50">
                {disc.name.toUpperCase()}
              </p>
              <h1 className="mb-4 font-serif text-4xl text-white sm:text-5xl">
                {disc.tagline}
              </h1>
              <p className="mb-8 max-w-xl text-lg text-white/70">
                {disc.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href={`/browse?discipline=${encodeURIComponent(disc.searchTerms[0])}`}>
                    Browse {disc.name}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="!bg-transparent border-white/30 text-white hover:!bg-white/10"
                  asChild
                >
                  <Link href="/iso/new">Post an ISO</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Quick stats ─── */}
        <section className="border-b border-crease-light bg-paper-white px-4 py-8 md:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-8">
            <div>
              <p className="font-serif text-2xl font-bold text-ink-black">
                {count || 0}
              </p>
              <p className="text-xs text-ink-light">Active Listings</p>
            </div>
            <div className="h-8 w-px bg-crease-light" />
            <div>
              <p className="font-serif text-2xl font-bold text-ink-black">
                {disc.priceRange}
              </p>
              <p className="text-xs text-ink-light">Typical Price Range</p>
            </div>
            <div className="h-8 w-px bg-crease-light" />
            <div>
              <div className="flex flex-wrap gap-1.5">
                {disc.popularBreeds.slice(0, 4).map((breed) => (
                  <Link
                    key={breed}
                    href={`/browse?discipline=${encodeURIComponent(disc.searchTerms[0])}&breed=${encodeURIComponent(breed)}`}
                    className="rounded-[var(--radius-card)] bg-paper-cream px-2.5 py-1 text-xs font-medium text-ink-mid hover:bg-paper-warm"
                  >
                    {breed}
                  </Link>
                ))}
              </div>
              <p className="mt-1 text-xs text-ink-light">Popular Breeds</p>
            </div>
          </div>
        </section>

        {/* ─── Listings grid ─── */}
        <section className="bg-paper-cream px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="font-serif text-2xl text-ink-black">
                  Featured {disc.name} Horses
                </h2>
                <p className="mt-1 text-sm text-ink-mid">
                  Sorted by Mane Score — most documented first.
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/browse?discipline=${encodeURIComponent(disc.searchTerms[0])}`}>
                  View All
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            {horses.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {horses.map((l) => {
                  const priceStr = l.price
                    ? `$${(l.price / 100).toLocaleString()}`
                    : "Contact";
                  const daysListed = l.published_at ? daysSince(l.published_at) : 999;
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
                      className="group overflow-hidden rounded-lg bg-paper-white shadow-flat transition-all duration-300 hover:shadow-lifted"
                    >
                      <div className="relative aspect-[3/2] overflow-hidden bg-paper-warm">
                        {fomoBadge && (
                          <div className={`absolute top-2.5 left-2.5 z-10 flex items-center gap-1 rounded-[var(--radius-card)] px-2.5 py-1 text-xs font-semibold ${fomoBadge.className}`}>
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
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                          ) : null;
                        })()}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-black/70 via-ink-black/30 to-transparent px-3 pb-3 pt-8">
                          <p className="font-serif text-lg font-bold text-paper-white drop-shadow-sm">
                            {priceStr}
                          </p>
                        </div>
                      </div>
                      <div className="p-3.5">
                        <h3 className="font-medium text-ink-black group-hover:text-primary">
                          {l.name}
                        </h3>
                        <p className="mt-0.5 text-sm text-ink-mid">
                          {[l.breed, l.color].filter(Boolean).join(" · ")}
                        </p>
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
                        <div className="mt-2.5 flex items-center justify-between text-xs">
                          <span
                            className={`flex items-center gap-1 font-medium ${
                              l.completeness_grade === "excellent"
                                ? "text-saddle"
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
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-crease-mid bg-paper-white p-12 text-center">
                <p className="text-lg font-medium text-ink-dark">
                  No {disc.name} horses listed yet
                </p>
                <p className="mt-1 text-sm text-ink-mid">
                  Be the first to list — or post an ISO to let sellers find you.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <Button size="sm" asChild>
                    <Link href={getCreateListingUrl()}>List a Horse</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/iso/new">Post an ISO</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── Buying tips ─── */}
        <section className="bg-paper-white px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-6 font-serif text-2xl text-ink-black">
              Tips for Buying a {disc.name} Horse
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {disc.tips.map((tip, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-crease-light bg-paper-cream p-5"
                >
                  <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-ink-mid">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Related disciplines ─── */}
        {disc.relatedDisciplines.length > 0 && (
          <section className="border-t border-crease-light bg-paper-cream px-4 py-12 md:px-8">
            <div className="mx-auto max-w-7xl">
              <h2 className="mb-4 text-lg font-semibold text-ink-black">
                Related Disciplines
              </h2>
              <div className="flex flex-wrap gap-3">
                {disc.relatedDisciplines.map((relSlug) => {
                  const rel = DISCIPLINES[relSlug];
                  if (!rel) return null;
                  return (
                    <Link
                      key={relSlug}
                      href={`/disciplines/${relSlug}`}
                      className="rounded-[var(--radius-card)] border border-crease-light bg-paper-white px-4 py-2 text-sm font-medium text-ink-dark transition-colors hover:bg-paper-warm"
                    >
                      {rel.name}
                      <ArrowRight className="ml-1.5 inline h-3 w-3" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
