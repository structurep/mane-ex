import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { FeaturePreview } from "@/components/feature-preview";
import {
  Shield,
  Heart,
  Activity,
  AlertTriangle,
} from "lucide-react";

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
    color: "text-oxblood",
    bgColor: "bg-oxblood/10",
    description:
      "Protects against third-party claims for bodily injury or property damage caused by your horse. Essential for boarding, training, and show environments.",
  },
];

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

        {/* Coverage Types — educational, no fake data */}
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
                  className="rounded-lg border border-crease-light bg-paper-white p-6 shadow-flat"
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

        {/* Coming Soon */}
        <section className="bg-paper-white px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[800px]">
            <FeaturePreview
              icon={<Shield className="size-8" />}
              title="Insurance Marketplace is coming soon"
              description="We're building partnerships with vetted equine insurance providers so you can compare quotes and bind coverage directly through ManeExchange."
            />
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
