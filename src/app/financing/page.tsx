import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/bottom-cta";
import {
  Calculator,
  ArrowRight,
  Repeat,
  SplitSquareHorizontal,
  Building2,
  Landmark,
  BadgeDollarSign,
  Clock,
  Percent,
  CalendarRange,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
      "Fixed monthly payments with competitive rates. Finance your horse purchase over 12 to 60 months with a straightforward installment loan from one of our lending partners.",
    terms: "12-60 months",
    highlight: "Fixed monthly payments",
  },
  {
    title: "Lease-to-Own",
    icon: Repeat,
    description:
      "Ride while you pay. Lease-to-own agreements let you take possession immediately while building equity with each payment. At the end of the term, the horse is yours.",
    terms: "24-48 months",
    highlight: "Flexible terms",
  },
  {
    title: "Payment Plans",
    icon: SplitSquareHorizontal,
    description:
      "Split your purchase into installments processed through ManeVault escrow. Funds are held securely and released on schedule. No bank application required.",
    terms: "3-12 months",
    highlight: "Through ManeVault",
  },
];

const partners = [
  {
    name: "AgriFinance",
    type: "Agricultural Lender",
    typeIcon: Landmark,
    rateFrom: "5.9% APR",
    terms: "12-60 months",
    minAmount: "$10,000",
    maxAmount: "$500,000",
    description:
      "Specialized agricultural lender with deep experience in equine purchases. Pre-approval in 24 hours.",
  },
  {
    name: "Equine Capital Group",
    type: "Specialty Lender",
    typeIcon: BadgeDollarSign,
    rateFrom: "6.5% APR",
    terms: "12-48 months",
    minAmount: "$5,000",
    maxAmount: "$250,000",
    description:
      "Purpose-built for equestrian purchases. Flexible underwriting that considers the horse as collateral.",
  },
  {
    name: "First Western Bank",
    type: "Community Bank",
    typeIcon: Building2,
    rateFrom: "7.2% APR",
    terms: "12-36 months",
    minAmount: "$15,000",
    maxAmount: "$350,000",
    description:
      "Community bank with dedicated equine lending division. Personal service and local decision-making.",
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
            <p className="overline mb-3 text-red">FINANCING</p>
            <h1 className="mb-4 text-4xl font-bold text-ink-black md:text-5xl">
              Make your dream horse
              <br />
              affordable.
            </h1>
            <p className="text-lead mx-auto max-w-2xl text-ink-mid">
              Equine financing shouldn&apos;t be complicated. Compare lending
              partners, explore lease-to-own options, or split payments through
              ManeVault — all in one place.
            </p>
          </div>
        </section>

        {/* Financing Options */}
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
                  className="rounded-lg border border-crease-light bg-paper-white p-6 shadow-flat transition-elevation hover-lift"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-light">
                    <option.icon className="h-5 w-5 text-red" />
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
                    <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-medium text-forest">
                      {option.highlight}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Partners */}
        <section className="bg-paper-white px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-3 text-center text-2xl font-semibold text-ink-black">
              Featured Partners
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center text-ink-mid">
              Lending partners who understand equestrian purchases.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {partners.map((partner) => (
                <div
                  key={partner.name}
                  className="flex flex-col rounded-lg border border-crease-light bg-paper-white p-6 shadow-flat transition-elevation hover-lift"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-paper-cream">
                      <partner.typeIcon className="h-5 w-5 text-ink-mid" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-ink-black">
                        {partner.name}
                      </h3>
                      <p className="text-xs text-ink-light">{partner.type}</p>
                    </div>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-ink-mid">
                    {partner.description}
                  </p>
                  <div className="mt-auto space-y-3 border-t border-crease-light pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Percent className="h-3 w-3 text-ink-light" />
                          <span className="text-xs text-ink-light">
                            Rates from
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-ink-black">
                          {partner.rateFrom}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <CalendarRange className="h-3 w-3 text-ink-light" />
                          <span className="text-xs text-ink-light">Terms</span>
                        </div>
                        <p className="text-sm font-semibold text-ink-black">
                          {partner.terms}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-ink-light">
                      {partner.minAmount} &mdash; {partner.maxAmount}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Apply Now
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section className="bg-paper-cream px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[800px]">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
                <Calculator className="h-6 w-6 text-gold" />
              </div>
              <h2 className="mb-3 text-2xl font-semibold text-ink-black">
                Estimate Your Payment
              </h2>
              <p className="mx-auto mb-10 max-w-lg text-ink-mid">
                A quick look at what financing could cost. Actual rates depend on
                credit, term, and lender.
              </p>
            </div>
            <div className="rounded-lg border border-crease-light bg-paper-white p-8 shadow-folded">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="text-center">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-light">
                    Horse Price
                  </p>
                  <p className="text-2xl font-bold text-ink-black">$75,000</p>
                </div>
                <div className="text-center">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-light">
                    Rate / Term
                  </p>
                  <p className="text-2xl font-bold text-ink-black">
                    6.5% <span className="text-lg font-normal text-ink-mid">/ 48 mo</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-light">
                    Est. Monthly
                  </p>
                  <p className="text-2xl font-bold text-red">$1,782</p>
                </div>
              </div>
              <div className="crease-divider mt-6 mb-4" />
              <p className="text-center text-xs text-ink-light">
                Example based on $75,000 financed at 6.5% APR over 48 months.
                Does not include taxes, insurance, or fees. For illustration
                purposes only &mdash; not a loan offer.
              </p>
            </div>
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
