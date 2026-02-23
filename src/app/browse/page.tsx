import { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BrowseFilters } from "./filters";
import { BrowseResults } from "./results";
import { BasedOnSearches } from "./based-on-searches";

export const metadata: Metadata = {
  title: "Browse Horses",
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
    minHeight?: string;
    maxHeight?: string;
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
            <h1 className="text-3xl font-bold text-ink-black">
              Browse Horses
            </h1>
            <p className="mt-1 text-ink-mid">
              Verified listings with documentation you can trust.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            {/* Filters sidebar */}
            <aside className="lg:col-span-1">
              <BrowseFilters params={params} />
            </aside>

            {/* Results */}
            <div className="lg:col-span-3">
              <Suspense
                fallback={
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-[4/5] animate-pulse rounded-lg bg-paper-warm"
                      />
                    ))}
                  </div>
                }
              >
                <BrowseResults params={params} />
              </Suspense>
            </div>
          </div>

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
