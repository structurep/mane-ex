import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { FeaturePreview } from "@/components/feature-preview";
import { BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Market Intelligence",
  description:
    "Real-time equine pricing data, anonymized comps, and market insights from ManeExchange.",
};

export default function MarketIntelligencePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="with-grain bg-gradient-hero px-4 pt-24 pb-12 md:px-8 md:pt-36 md:pb-16">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-3 text-gold">MARKET INTELLIGENCE</p>
            <h1 className="mb-4 text-4xl tracking-tight text-ink-black md:text-5xl">
              Know the market.
            </h1>
            <p className="text-lead mx-auto max-w-2xl text-ink-mid">
              Pricing data, anonymized comps, and market insights from the
              ManeExchange marketplace — powered by real transaction data.
            </p>
          </div>
        </section>

        {/* Feature preview */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-[1200px]">
            <FeaturePreview
              icon={<BarChart3 className="size-8" />}
              title="Market Intelligence is coming soon"
              description="We're building data-driven market tools powered by real ManeExchange transaction data."
              capabilities={[
                "Average and median prices by breed, discipline, and region",
                "Anonymized comparable sales from recent transactions",
                "Price trends over time with seasonal analysis",
                "Interactive price estimator with confidence ranges",
              ]}
              actionLabel="Browse Current Listings"
              actionHref="/browse"
            />
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
