import { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BrowseFilters } from "./filters";
import { BrowseResults } from "./results";
import { BasedOnSearches } from "./based-on-searches";

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
    sort?: string;
    page?: string;
  }>;
};

export default async function BrowsePage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-paper-white">
      <Header />
      <main className="px-4 pb-16 pt-6 md:px-8 md:pt-8">
        <div className="mx-auto max-w-[1280px]">
          {/* Header */}
          <div className="mb-6">
            <p className="overline text-ink-faint">Browse</p>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-ink-black md:text-4xl">
              Current Offerings
            </h1>
          </div>

          {/* Filters */}
          <BrowseFilters params={params} />

          {/* Results */}
          <div className="mt-6">
            <Suspense
              fallback={
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-lg">
                      <div className="aspect-[4/3] animate-shimmer rounded-lg" />
                      <div className="space-y-2 pt-3">
                        <div className="h-4 w-3/4 animate-shimmer rounded" />
                        <div className="h-3 w-1/2 animate-shimmer rounded" />
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
