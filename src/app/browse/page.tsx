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
    <div className="min-h-screen">
      <Header />
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-black">
              Current Offerings
            </h1>
            <p className="mt-1 text-ink-mid">
              Verified listings with documentation you can trust.
            </p>
          </div>

          {/* Filters — horizontal top bar */}
          <BrowseFilters params={params} />

          {/* Results — full width */}
          <Suspense
            fallback={
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-lg bg-paper-white shadow-flat"
                  >
                    <div className="aspect-[3/2] animate-shimmer" />
                    <div className="space-y-2 p-3.5">
                      <div className="h-4 w-3/4 animate-shimmer rounded" />
                      <div className="h-3 w-1/2 animate-shimmer rounded" />
                      <div className="h-3 w-2/3 animate-shimmer rounded" />
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <BrowseResults params={params} />
          </Suspense>

          {/* Personalized recommendations */}
          <Suspense fallback={null}>
            <BasedOnSearches />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
