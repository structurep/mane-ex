import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/bottom-cta";
import {
  Shield,
  Heart,
  Activity,
  AlertTriangle,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Insurance Marketplace",
  description:
    "Compare equine insurance providers and get quotes for mortality, major medical, loss of use, and liability coverage through ManeExchange.",
};

const coverageTypes = [
  {
    title: "Mortality Insurance",
    icon: Shield,
    color: "text-gold",
    bgColor: "bg-gold/10",
    description:
      "Covers the agreed value of your horse in the event of death from illness, injury, or accident. The foundation of any equine insurance policy.",
  },
  {
    title: "Major Medical",
    icon: Heart,
    color: "text-primary",
    bgColor: "bg-primary/10",
    description:
      "Covers surgical procedures, diagnostic imaging, colic surgery, and major veterinary expenses. Typical limits range from $5,000 to $15,000 per incident.",
  },
  {
    title: "Loss of Use",
    icon: Activity,
    color: "text-blue",
    bgColor: "bg-blue/10",
    description:
      "Pays a percentage of insured value if your horse becomes permanently unable to perform its intended use due to injury or illness.",
  },
  {
    title: "Liability Coverage",
    icon: AlertTriangle,
    color: "text-forest",
    bgColor: "bg-forest/10",
    description:
      "Protects against third-party claims for bodily injury or property damage caused by your horse. Essential for boarding, training, and show environments.",
  },
];

const providers = [
  {
    name: "Markel Specialty",
    specialization: "Full-spectrum equine coverage since 1930",
    rating: 4.8,
    coverages: ["Mortality", "Major Medical", "Loss of Use", "Liability"],
    startingPrice: "$45/month",
    highlight: "Industry leader",
  },
  {
    name: "Great American Insurance",
    specialization: "High-value show horse specialists",
    rating: 4.7,
    coverages: ["Mortality", "Major Medical", "Loss of Use"],
    startingPrice: "$62/month",
    highlight: "Best for show horses",
  },
  {
    name: "Broadstone Equine",
    specialization: "Competitive rates for recreational and sport horses",
    rating: 4.5,
    coverages: ["Mortality", "Major Medical", "Liability"],
    startingPrice: "$38/month",
    highlight: "Most affordable",
  },
  {
    name: "KBIS Insurance",
    specialization: "Comprehensive barn and multi-horse policies",
    rating: 4.6,
    coverages: ["Mortality", "Major Medical", "Loss of Use", "Liability"],
    startingPrice: "$55/month",
    highlight: "Best for barns",
  },
];

const steps = [
  {
    number: "1",
    title: "Tell us about your horse",
    description:
      "Breed, age, value, discipline, and location. We use your ManeExchange listing data to pre-fill the details.",
  },
  {
    number: "2",
    title: "Compare quotes",
    description:
      "Receive side-by-side quotes from vetted providers. Compare coverage limits, deductibles, and premiums in one view.",
  },
  {
    number: "3",
    title: "Get covered",
    description:
      "Select a plan and bind coverage directly. Your policy documents are stored securely in your ManeExchange dashboard.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.floor(rating)
              ? "fill-gold text-gold"
              : star <= rating
                ? "fill-gold/50 text-gold"
                : "text-crease-mid"
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium text-ink-dark">{rating}</span>
    </div>
  );
}

export default function InsurancePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-paper-white px-4 pt-20 pb-16 md:px-8 md:pt-24">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-3 text-gold">INSURANCE</p>
            <h1 className="mb-4 text-4xl font-bold text-ink-black md:text-5xl">
              Protect your investment.
            </h1>
            <p className="text-lead mx-auto max-w-2xl text-ink-mid">
              Compare equine insurance providers in one place. Mortality, major
              medical, loss of use, and liability — find the right coverage for
              your horse and your budget.
            </p>
          </div>
        </section>

        {/* Coverage Types */}
        <section className="bg-paper-cream px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-3 text-center text-2xl font-semibold text-ink-black">
              Coverage Types
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center text-ink-mid">
              Equine insurance isn&apos;t one-size-fits-all. Here are the four
              primary coverage categories.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              {coverageTypes.map((coverage) => (
                <div
                  key={coverage.title}
                  className="rounded-lg border border-crease-light bg-paper-white p-6 shadow-flat transition-elevation hover-lift"
                >
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${coverage.bgColor}`}
                  >
                    <coverage.icon className={`h-5 w-5 ${coverage.color}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-ink-black">
                    {coverage.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-mid">
                    {coverage.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Providers */}
        <section className="bg-paper-white px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-3 text-center text-2xl font-semibold text-ink-black">
              Featured Providers
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center text-ink-mid">
              Vetted insurance partners with decades of equine industry
              experience.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {providers.map((provider) => (
                <div
                  key={provider.name}
                  className="flex flex-col rounded-lg border border-crease-light bg-paper-white p-6 shadow-flat transition-elevation hover-lift"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-paper-cream px-2.5 py-0.5 text-xs font-medium text-ink-mid">
                      {provider.highlight}
                    </span>
                  </div>
                  <h3 className="mb-1 text-lg font-medium text-ink-black">
                    {provider.name}
                  </h3>
                  <p className="mb-3 text-sm text-ink-mid">
                    {provider.specialization}
                  </p>
                  <StarRating rating={provider.rating} />
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {provider.coverages.map((coverage) => (
                      <span
                        key={coverage}
                        className="rounded-md bg-paper-cream px-2 py-0.5 text-xs text-ink-mid"
                      >
                        {coverage}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto pt-6">
                    <p className="mb-3 text-sm text-ink-dark">
                      Starting from{" "}
                      <span className="font-semibold text-ink-black">
                        {provider.startingPrice}
                      </span>
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Get Quote
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-paper-cream px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-12 text-center text-2xl font-semibold text-ink-black">
              How It Works
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.number} className="relative text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {step.number}
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-ink-black">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-mid">
                    {step.description}
                  </p>
                  {index < steps.length - 1 && (
                    <ArrowRight className="absolute top-6 -right-4 hidden h-5 w-5 text-crease-mid md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
