import { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BrowseFilters } from "./filters";
import { BrowseResults } from "./results";
import { BasedOnSearches } from "./based-on-searches";
import { MatchMode } from "@/components/match/match-mode";
import { TrendingSection } from "./trending-section";
import { RecommendedSection } from "./recommended-section";

export const metadata: Metadata = {
  title: "Current Offerings",
  description:
    "Browse verified horse listings on ManeExchange. Filter by discipline, price, location, and more.",
};

type Props = {
  searchParams: Promise<{
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
  }>;
};

export default async function BrowsePage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-[var(--paper-bg)]">
      <Header />
      <main className="px-4 pb-16 pt-8 md:px-8 md:pt-12">
        <div className="mx-auto max-w-[1280px]">
          {/* Header — editorial */}
          <div className="mb-8">
            <p className="overline text-[var(--ink-faint)]">Browse</p>
            <h1 className="display-lg mt-2 text-[var(--ink-black)]">
              Current Offerings
            </h1>
            <div className="crease-divider mt-4" />
          </div>

          {/* Recommended For You (personalized) */}
          <Suspense fallback={null}>
            <RecommendedSection />
          </Suspense>

          {/* Trending */}
          <Suspense fallback={null}>
            <TrendingSection />
          </Suspense>

          {/* Filters + Match Mode toggle */}
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <BrowseFilters params={params} />
            </div>
            <MatchMode />
          </div>

          {/* Results */}
          <div className="mt-8">
            <Suspense
              fallback={
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-[var(--radius-card)]">
                      <div className="aspect-[4/3] animate-shimmer rounded-[var(--radius-card)]" />
                      <div className="space-y-2 pt-3">
                        <div className="h-4 w-3/4 animate-shimmer rounded-[var(--radius-badge)]" />
                        <div className="h-3 w-1/2 animate-shimmer rounded-[var(--radius-badge)]" />
                      </div>
                    </div>
                  ))}
                </div>
              }
            >
              <BrowseResults params={params} />
            </Suspense>
          </div>

          {/* Recommendations */}
          <Suspense fallback={null}>
            <BasedOnSearches />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
