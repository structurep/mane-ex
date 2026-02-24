import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Brain,
  TrendingUp,
  Heart,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Recommendations",
  description:
    "Personalized horse recommendations powered by ManeMatch AI. Find your perfect match.",
};

const topMatches = [
  {
    id: "1",
    slug: "midnight-storm",
    name: "Midnight Storm",
    breed: "Warmblood",
    price: 65000,
    location: "Wellington, FL",
    matchPercent: 96,
    disciplines: ["Hunter/Jumper"],
  },
  {
    id: "2",
    slug: "golden-promise",
    name: "Golden Promise",
    breed: "Hanoverian",
    price: 48000,
    location: "Ocala, FL",
    matchPercent: 93,
    disciplines: ["Dressage"],
  },
  {
    id: "3",
    slug: "sapphire-blue",
    name: "Sapphire Blue",
    breed: "Thoroughbred",
    price: 35000,
    location: "Aiken, SC",
    matchPercent: 91,
    disciplines: ["Eventing"],
  },
  {
    id: "4",
    slug: "thunder-road",
    name: "Thunder Road",
    breed: "Dutch Warmblood",
    price: 72000,
    location: "Lexington, KY",
    matchPercent: 89,
    disciplines: ["Hunter/Jumper", "Equitation"],
  },
];

const moreRecommendations = [
  {
    id: "5",
    slug: "silver-lining",
    name: "Silver Lining",
    breed: "KWPN",
    price: 55000,
    location: "Wellington, FL",
    matchPercent: 87,
    disciplines: ["Hunter/Jumper"],
  },
  {
    id: "6",
    slug: "riverside-dream",
    name: "Riverside Dream",
    breed: "Oldenburg",
    price: 42000,
    location: "Middleburg, VA",
    matchPercent: 85,
    disciplines: ["Dressage"],
  },
  {
    id: "7",
    slug: "copper-canyon",
    name: "Copper Canyon",
    breed: "Irish Sport Horse",
    price: 38000,
    location: "Ocala, FL",
    matchPercent: 83,
    disciplines: ["Eventing"],
  },
  {
    id: "8",
    slug: "noble-quest",
    name: "Noble Quest",
    breed: "Warmblood",
    price: 60000,
    location: "Tampa, FL",
    matchPercent: 81,
    disciplines: ["Hunter/Jumper"],
  },
  {
    id: "9",
    slug: "azure-sky",
    name: "Azure Sky",
    breed: "Hanoverian",
    price: 45000,
    location: "Wellington, FL",
    matchPercent: 79,
    disciplines: ["Dressage", "Eventing"],
  },
  {
    id: "10",
    slug: "storm-chaser",
    name: "Storm Chaser",
    breed: "Thoroughbred",
    price: 28000,
    location: "Aiken, SC",
    matchPercent: 77,
    disciplines: ["Eventing"],
  },
];

export default function RecommendationsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="with-grain bg-gradient-hero px-4 pt-24 pb-12 md:px-8 md:pt-36 md:pb-16">
          <div className="mx-auto max-w-[1200px] text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium text-gold">
                Smart Matching Enabled
              </span>
            </div>
            <h1 className="text-4xl tracking-tight text-ink-black md:text-5xl">
              Horses picked for you.
            </h1>
            <p className="text-lead mx-auto mt-4 max-w-2xl text-ink-mid">
              ManeMatch analyzes your preferences, browsing history, and saved
              horses to find your best matches.
            </p>
          </div>
        </section>

        {/* Top Matches */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-[1200px]">
            <p className="overline mb-3 text-gold">TOP MATCHES</p>
            <h2 className="mb-8 font-heading text-2xl font-semibold tracking-tight text-ink-black md:text-3xl">
              Your best matches right now
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {topMatches.map((horse) => (
                <Link
                  key={horse.id}
                  href={`/horses/${horse.slug}`}
                  className="group relative overflow-hidden rounded-lg border-0 bg-paper-white shadow-flat transition-elevation hover-lift hover:shadow-lifted"
                >
                  {/* Match badge */}
                  <div className="absolute top-3 left-3 z-10 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-white">
                    {horse.matchPercent}% Match
                  </div>
                  {/* Image placeholder */}
                  <div className="aspect-[4/3] bg-paper-warm" />
                  <div className="p-4">
                    <h3 className="font-medium text-ink-black group-hover:text-blue">
                      {horse.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-ink-mid">
                      {horse.breed} &middot; {horse.location}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {horse.disciplines.map((d) => (
                        <Badge
                          key={d}
                          variant="secondary"
                          className="text-xs"
                        >
                          {d}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-2 font-serif text-lg font-bold text-ink-black">
                      ${horse.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* More Recommendations */}
        <section className="bg-paper-white section-premium">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-8 font-heading text-2xl font-semibold tracking-tight text-ink-black md:text-3xl">
              More recommendations
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {moreRecommendations.map((horse) => (
                <Link
                  key={horse.id}
                  href={`/horses/${horse.slug}`}
                  className="group overflow-hidden rounded-lg border-0 bg-paper-white shadow-flat transition-elevation hover-lift hover:shadow-lifted"
                >
                  {/* Image placeholder */}
                  <div className="aspect-[4/3] bg-paper-warm" />
                  <div className="p-4">
                    <h3 className="font-medium text-ink-black group-hover:text-blue">
                      {horse.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-ink-mid">
                      {horse.breed} &middot; {horse.location}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {horse.disciplines.map((d) => (
                        <Badge
                          key={d}
                          variant="secondary"
                          className="text-xs"
                        >
                          {d}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="font-serif text-lg font-bold text-ink-black">
                        ${horse.price.toLocaleString()}
                      </p>
                      <span className="text-sm font-medium text-gold">
                        {horse.matchPercent}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-12 text-center font-heading text-2xl font-semibold tracking-tight text-ink-black md:text-3xl">
              How ManeMatch works
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                  <Heart className="h-6 w-6 text-gold" />
                </div>
                <h3 className="mb-2 font-medium text-ink-black">
                  Preference Matching
                </h3>
                <p className="text-sm text-ink-mid">
                  We match based on your saved disciplines, price range, location
                  preferences, and experience level.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue/10">
                  <Brain className="h-6 w-6 text-blue" />
                </div>
                <h3 className="mb-2 font-medium text-ink-black">
                  Behavior Analysis
                </h3>
                <p className="text-sm text-ink-mid">
                  Your browsing patterns, saved horses, and search history help us
                  understand what you&apos;re really looking for.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-forest/10">
                  <TrendingUp className="h-6 w-6 text-forest" />
                </div>
                <h3 className="mb-2 font-medium text-ink-black">
                  Success Patterns
                </h3>
                <p className="text-sm text-ink-mid">
                  We learn from successful matches — which horse-buyer pairings
                  lead to offers, trials, and completed sales.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-ink-black section-premium">
          <div className="mx-auto max-w-[1200px] text-center">
            <h2 className="mb-4 text-3xl tracking-tight text-paper-white">
              Your next horse is waiting.
            </h2>
            <p className="text-lead mx-auto mb-8 max-w-lg text-ink-light">
              Browse verified listings or list your horse on the marketplace
              built for the equestrian community.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href="/browse">
                  Browse Horses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard/listings/new">List Your Horse</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
