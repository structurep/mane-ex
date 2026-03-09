import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { FeaturePreview } from "@/components/feature-preview";
import {
  ClipboardList,
  Brain,
  TrendingUp,
  ArrowRight,
  Calculator,
} from "lucide-react";

export const metadata: Metadata = {
  title: "ManeEstimate — AI Horse Valuation Tool",
  description:
    "Get a data-driven price estimate for your horse based on comparable sales, breed, age, training level, and show record. Powered by ManeExchange AI.",
};

const steps = [
  {
    icon: ClipboardList,
    title: "Enter your horse's details",
    description:
      "Breed, age, discipline, training level, show record, and location. The more detail, the sharper the estimate.",
  },
  {
    icon: Brain,
    title: "AI analyzes comparable sales",
    description:
      "Our model searches the ManeExchange database for recently sold horses with similar profiles and adjusts for market trends.",
  },
  {
    icon: TrendingUp,
    title: "Get a price estimate with confidence range",
    description:
      "Receive a data-driven valuation range, a confidence score, and the key factors influencing price.",
  },
];

export default function ValuationPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-paper-white px-4 pt-20 pb-16 md:px-8 md:pt-24">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-3 text-gold">MANEESTIMATE</p>
            <h1 className="mb-4 text-4xl font-bold text-ink-black md:text-5xl">
              What&apos;s your horse worth?
            </h1>
            <p className="text-lead mx-auto max-w-2xl text-ink-mid">
              AI-powered valuation based on comparable sales data, breed, age,
              training level, and show record. No guesswork — just data.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-paper-cream px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-12 text-center text-2xl font-semibold text-ink-black">
              How it works
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <div
                  key={step.title}
                  className="relative rounded-lg bg-paper-white p-8 shadow-folded"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                      <step.icon className="h-5 w-5" />
                    </span>
                    <span className="overline text-ink-light">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-ink-black">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-mid">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature preview */}
        <section className="bg-paper-white px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[800px]">
            <FeaturePreview
              icon={<Calculator className="size-8" />}
              title="ManeEstimate is launching soon"
              description="Be the first to get an AI-powered valuation for your horse, backed by real ManeExchange transaction data."
              capabilities={[
                "Data-driven price range with confidence score",
                "Comparable sales analysis from recent transactions",
                "Key pricing factors breakdown (breed, age, training, location)",
                "Market trend context for informed decisions",
              ]}
              actionLabel="List Your Horse"
              actionHref="/sell"
            />
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
