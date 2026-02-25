import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/bottom-cta";
import {
  ClipboardList,
  Brain,
  TrendingUp,
  ArrowRight,
  Plus,
  Equal,
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

const factors = [
  { label: "Breed (Thoroughbred)", impact: "positive" as const, icon: Plus },
  { label: "Age (8 years)", impact: "neutral" as const, icon: Equal },
  { label: "Show Record (A-rated)", impact: "positive" as const, icon: Plus },
  { label: "Training (3rd level)", impact: "positive" as const, icon: Plus },
  { label: "Location (Wellington, FL)", impact: "positive" as const, icon: Plus },
];

const comparables = [
  {
    name: "Summer Solstice",
    breed: "Thoroughbred",
    age: "7yo",
    discipline: "Hunter/Jumper",
    price: "$52,000",
    daysAgo: 12,
  },
  {
    name: "Harbor Lights",
    breed: "Thoroughbred",
    age: "9yo",
    discipline: "Hunter/Jumper",
    price: "$48,500",
    daysAgo: 23,
  },
  {
    name: "April Rain",
    breed: "Warmblood",
    age: "8yo",
    discipline: "Hunter",
    price: "$61,000",
    daysAgo: 31,
  },
];

export default function ValuationPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ── Hero ── */}
        <section className="bg-paper-white px-4 pt-20 pb-16 md:px-8 md:pt-24">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-3 text-gold">MANEESTIMATE</p>
            <h1 className="mb-4 text-4xl font-bold text-ink-black md:text-5xl">
              What&apos;s your horse worth?
            </h1>
            <p className="text-lead mx-auto max-w-2xl text-ink-mid">
              AI-powered valuation based on comparable sales data, breed, age,
              training level, and show record. No guesswork &mdash; just data.
            </p>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="bg-paper-cream px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-12 text-center text-2xl font-semibold text-ink-black">
              How it works
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <div
                  key={step.title}
                  className="relative rounded-lg bg-paper-white p-8 shadow-folded transition-elevation hover-lift"
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

        {/* ── Sample Estimate ── */}
        <section className="bg-paper-white px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-12 text-center">
              <p className="overline mb-3 text-ink-light">PREVIEW</p>
              <h2 className="text-2xl font-semibold text-ink-black">
                What an estimate looks like
              </h2>
            </div>

            <div className="mx-auto max-w-3xl space-y-8">
              {/* Horse Details Card */}
              <div className="rounded-lg border border-crease-light bg-paper-cream p-6 shadow-flat">
                <p className="overline mb-2 text-ink-light">HORSE DETAILS</p>
                <h3 className="text-xl font-medium text-ink-black">
                  Bay Thoroughbred, 8yo, Hunter/Jumper, 16.2hh
                </h3>
              </div>

              {/* Estimated Range */}
              <div className="rounded-lg border border-gold/30 bg-paper-white p-8 text-center shadow-lifted">
                <p className="overline mb-3 text-gold">ESTIMATED VALUE</p>
                <p className="mb-2 font-serif text-4xl font-bold tracking-tight text-ink-black md:text-5xl">
                  $45,000 &mdash; $65,000
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-forest" />
                  <span className="text-sm font-medium text-forest">
                    High confidence &middot; Based on 47 comparable sales
                  </span>
                </div>
              </div>

              {/* Factors */}
              <div className="rounded-lg border border-crease-light bg-paper-cream p-6 shadow-flat">
                <p className="overline mb-4 text-ink-light">
                  PRICING FACTORS
                </p>
                <div className="space-y-3">
                  {factors.map((factor) => (
                    <div
                      key={factor.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-ink-dark">
                        {factor.label}
                      </span>
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          factor.impact === "positive"
                            ? "bg-forest/10 text-forest"
                            : "bg-ink-faint/20 text-ink-light"
                        }`}
                      >
                        <factor.icon className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparable Sales */}
              <div>
                <p className="overline mb-4 text-ink-light">
                  COMPARABLE SALES
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {comparables.map((comp) => (
                    <div
                      key={comp.name}
                      className="rounded-lg border border-crease-light bg-paper-cream p-5 shadow-flat"
                    >
                      <p className="mb-1 font-medium text-ink-black">
                        {comp.name}
                      </p>
                      <p className="mb-3 text-xs text-ink-light">
                        {comp.breed} &middot; {comp.age} &middot;{" "}
                        {comp.discipline}
                      </p>
                      <div className="flex items-end justify-between">
                        <span className="text-lg font-semibold text-ink-black">
                          {comp.price}
                        </span>
                        <span className="text-xs text-ink-faint">
                          {comp.daysAgo}d ago
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Coming Soon Banner ── */}
        <section className="bg-paddock px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-3 text-gold">COMING SOON</p>
            <h2 className="mb-4 text-3xl font-semibold text-paper-white">
              ManeEstimate is launching soon.
            </h2>
            <p className="text-lead mx-auto mb-8 max-w-xl text-ink-light">
              Be the first to get an AI-powered valuation for your horse.
              Sign up for early access.
            </p>
            <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 rounded-md border border-crease-dark/30 bg-ink-dark px-4 py-3 text-sm text-paper-white placeholder:text-ink-light focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                aria-label="Email address for early access"
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-medium text-ink-black transition-colors hover:bg-gold/90">
                Get Early Access
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
