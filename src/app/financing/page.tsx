import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { FeaturePreview } from "@/components/feature-preview";
import {
  Repeat,
  SplitSquareHorizontal,
  Landmark,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Financing Partners",
  description:
    "Explore equine financing options including traditional loans, lease-to-own, and payment plans. Make your dream horse affordable with ManeExchange.",
};

const financingOptions = [
  {
    title: "Traditional Loan",
    icon: Landmark,
    description:
      "Fixed monthly payments with competitive rates. Finance your horse purchase over 12 to 60 months with a straightforward installment loan.",
    terms: "12-60 months",
    highlight: "Fixed monthly payments",
  },
  {
    title: "Lease-to-Own",
    icon: Repeat,
    description:
      "Ride while you pay. Lease-to-own agreements let you take possession immediately while building equity with each payment.",
    terms: "24-48 months",
    highlight: "Flexible terms",
  },
  {
    title: "Payment Plans",
    icon: SplitSquareHorizontal,
    description:
      "Split your purchase into installments processed through ManeVault escrow. Funds are held securely and released on schedule.",
    terms: "3-12 months",
    highlight: "Through ManeVault",
  },
];

export default function FinancingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-paper-white px-4 pt-20 pb-16 md:px-8 md:pt-24">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-3 text-gold">FINANCING</p>
            <h1 className="mb-4 text-4xl font-bold text-ink-black md:text-5xl">
              Make your dream horse
              <br />
              affordable.
            </h1>
            <p className="text-lead mx-auto max-w-2xl text-ink-mid">
              Equine financing shouldn&apos;t be complicated. We&apos;re
              building tools to help you compare lending options, explore
              lease-to-own arrangements, and split payments through ManeVault.
            </p>
          </div>
        </section>

        {/* Financing Options — educational, no fake lender data */}
        <section className="bg-paper-cream px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-3 text-center text-2xl font-semibold text-ink-black">
              Financing Options
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center text-ink-mid">
              Three paths to ownership. Choose the structure that fits your
              situation.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {financingOptions.map((option) => (
                <div
                  key={option.title}
                  className="rounded-lg border border-crease-light bg-paper-white p-6 shadow-flat"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <option.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-ink-black">
                    {option.title}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-ink-mid">
                    {option.description}
                  </p>
                  <div className="flex items-center gap-4 border-t border-crease-light pt-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-ink-light" />
                      <span className="text-xs text-ink-mid">
                        {option.terms}
                      </span>
                    </div>
                    <span className="rounded-[var(--radius-card)] bg-saddle/10 px-2.5 py-0.5 text-xs font-medium text-saddle">
                      {option.highlight}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="bg-paper-white px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[800px]">
            <FeaturePreview
              icon={<Landmark className="size-8" />}
              title="Financing Partners is coming soon"
              description="We're building partnerships with equine lenders so you can compare rates, get pre-approved, and finance your purchase directly through ManeExchange."
            />
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
