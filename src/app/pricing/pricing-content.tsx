"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight } from "lucide-react";

const sellerTiers = [
  {
    name: "Starter",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Individual sellers with a small number of horses.",
    features: [
      "Up to 3 active listings",
      "Basic seller profile",
      "Messaging (10/day)",
      "ManeVault escrow access",
      "Listing completeness score",
    ],
    cta: "Create Account",
    highlighted: false,
  },
  {
    name: "Pro",
    monthlyPrice: 49,
    annualPrice: 490,
    description: "Active sellers and small training operations.",
    features: [
      "Up to 10 active listings",
      "Farm storefront page",
      "Messaging (50/day)",
      "ISO matching (5/month)",
      "Priority in search results",
      "Analytics dashboard",
      "Seller verification badge",
    ],
    cta: "Select Pro",
    highlighted: true,
  },
  {
    name: "Elite",
    monthlyPrice: 149,
    annualPrice: 1490,
    description: "Consignment operations and high-volume programs.",
    features: [
      "Unlimited listings",
      "Custom farm branding",
      "Unlimited messaging",
      "Unlimited ISO matching",
      "Featured placement",
      "Advanced analytics",
      "ManeExchange Verified badge",
      "Dedicated support",
    ],
    cta: "Select Elite",
    highlighted: false,
  },
];

function formatPrice(tier: (typeof sellerTiers)[number], annual: boolean) {
  if (tier.monthlyPrice === 0) {
    return { display: "Free", note: "Complimentary", perMonth: null };
  }
  if (annual) {
    const perMonth = (tier.annualPrice / 12).toFixed(2);
    return {
      display: `$${perMonth}`,
      note: `$${tier.annualPrice.toLocaleString()}/year — 2 months free`,
      perMonth: "/mo",
    };
  }
  return {
    display: `$${tier.monthlyPrice}`,
    note: null,
    perMonth: "/mo",
  };
}

export function PricingContent() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ── Hero ── */}
        <section className="with-grain bg-gradient-hero px-4 pt-24 pb-20 md:px-8 md:pt-36 md:pb-28">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-4 text-gold">MEMBERSHIP</p>
            <h1 className="font-serif mb-6 text-4xl tracking-tight text-ink-black md:text-6xl">
              Plans designed for how you operate.
            </h1>
            <p className="text-lead mx-auto max-w-2xl text-ink-mid">
              Structured tiers for individual sellers, active barns, and
              high-volume consignment operations. All plans include ManeVault escrow.
            </p>
          </div>
        </section>

        {/* ── Toggle ── */}
        <section className="bg-paper-cream px-4 pt-16 pb-0 md:px-8 md:pt-20">
          <div className="flex items-center justify-center gap-3">
            <span
              className={`text-sm font-medium ${!annual ? "text-ink-black" : "text-ink-light"}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative h-7 w-12 rounded-full transition-colors ${annual ? "bg-forest" : "bg-ink-light/30"}`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${annual ? "translate-x-5.5" : "translate-x-0.5"}`}
              />
            </button>
            <span
              className={`text-sm font-medium ${annual ? "text-ink-black" : "text-ink-light"}`}
            >
              Annual
            </span>
            {annual && (
              <Badge
                variant="secondary"
                className="bg-forest-light text-xs text-forest"
              >
                2 months free
              </Badge>
            )}
          </div>
        </section>

        {/* ── Seller Plans ── */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-12 text-center">
              <p className="overline mb-3 text-gold">SELLER PLANS</p>
              <h2 className="font-serif text-3xl text-ink-black md:text-4xl">
                For sellers
              </h2>
            </div>

            <div className="stagger-children grid gap-6 md:grid-cols-3">
              {sellerTiers.map((tier) => {
                const price = formatPrice(tier, annual);
                return (
                  <div
                    key={tier.name}
                    className={`animate-fade-up relative rounded-lg p-8 transition-elevation hover-lift ${
                      tier.highlighted
                        ? "bg-paper-white shadow-lifted hover:shadow-hovering"
                        : "bg-paper-white shadow-flat hover:shadow-lifted"
                    }`}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    <h3 className="mb-1 font-heading text-lg font-semibold text-ink-black">
                      {tier.name}
                    </h3>
                    <div className="mb-1">
                      <span className="font-serif text-4xl font-bold text-ink-black">
                        {price.display}
                      </span>
                      {price.perMonth && (
                        <span className="text-sm text-ink-mid">
                          {price.perMonth}
                        </span>
                      )}
                    </div>
                    {tier.monthlyPrice === 0 ? (
                      <p className="mb-4 text-xs text-ink-light">
                        Free forever
                      </p>
                    ) : (
                      <p className="mb-4 text-xs text-ink-light">
                        {price.note
                          ? price.note
                          : `Currently waived — $${tier.monthlyPrice}/mo after launch`}
                      </p>
                    )}
                    <p className="mb-6 text-sm text-ink-mid">
                      {tier.description}
                    </p>
                    <div className="crease-divider mb-6" />
                    <ul className="mb-8 space-y-3">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-ink-dark"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={tier.highlighted ? "default" : "outline"}
                      asChild
                    >
                      <Link href="/signup">
                        {tier.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Buyer Plans ── */}
        <section className="with-grain bg-paper-white section-premium">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-12 text-center">
              <p className="overline mb-3 text-blue">BUYER PLANS</p>
              <h2 className="font-serif text-3xl text-ink-black md:text-4xl">
                For buyers
              </h2>
            </div>

            <div className="stagger-children mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
              {/* Free Buyer */}
              <div className="animate-fade-up rounded-lg bg-paper-cream p-8 shadow-flat transition-elevation hover-lift hover:shadow-lifted">
                <h3 className="font-heading text-lg font-semibold text-ink-black">
                  Free
                </h3>
                <p className="mt-1 font-serif text-4xl font-bold text-ink-black">
                  $0
                </p>
                <p className="text-xs text-ink-light">Complimentary</p>
                <p className="mt-3 text-sm text-ink-mid">
                  Browse, save, and contact sellers.
                </p>
                <div className="crease-divider my-6" />
                <ul className="space-y-3">
                  {[
                    "Browse all listings",
                    "Save to Dream Barn (10 max)",
                    "Message sellers (5/day)",
                    "Comparison tool",
                    "Price drop alerts",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-ink-dark"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-8 w-full" asChild>
                  <Link href="/signup">Create Account</Link>
                </Button>
              </div>

              {/* Buyer Pro */}
              <div className="animate-fade-up relative rounded-lg bg-paper-white p-8 shadow-lifted transition-elevation hover-lift hover:shadow-hovering">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-blue px-3 py-1 text-xs font-semibold text-white">
                    FOR BUYERS
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-ink-black">
                  Buyer Pro
                </h3>
                <div className="mt-1">
                  <span className="font-serif text-4xl font-bold text-ink-black">
                    Free
                  </span>
                </div>
                <p className="text-xs text-ink-light">
                  Currently waived — $39/mo after launch
                </p>
                <p className="mt-3 text-sm text-ink-mid">
                  AI-powered matching, unlimited access, and priority support.
                </p>
                <div className="crease-divider my-6" />
                <ul className="space-y-3">
                  {[
                    "Everything in Free",
                    "AI-powered ManeMatch recommendations",
                    "Unlimited Dream Barn collections",
                    "Unlimited messaging",
                    "Saved searches with alerts",
                    "Market intelligence access",
                    "Priority support",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-ink-dark"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" asChild>
                  <Link href="/signup">
                    Select Buyer Pro
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Elite math callout */}
            <div className="mx-auto mt-12 max-w-2xl rounded-lg bg-paddock p-8 text-center">
              <p className="overline text-ink-light">COMBINED VALUE</p>
              <p className="mt-3 text-lg font-semibold text-paper-white">
                Pro Seller ($49) + Buyer Pro ($39) ={" "}
                <span className="text-ink-light line-through">$88/mo</span>
              </p>
              <p className="mt-1 font-serif text-3xl font-bold text-gold">
                Elite gives you everything for $149/mo
              </p>
              <p className="mt-3 text-sm text-ink-light">
                Save with Elite if you&apos;re both buying and selling.
              </p>
            </div>
          </div>
        </section>

        {/* ── ManeVault Escrow Milestones ── */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-12 text-center">
              <p className="overline mb-3 text-gold">MANEVAULT ESCROW</p>
              <h2 className="font-serif text-3xl text-ink-black md:text-4xl">
                Funds released in milestones
              </h2>
              <p className="text-lead mx-auto mt-4 max-w-xl text-ink-mid">
                Not all at once. Each milestone protects both buyer and seller.
              </p>
            </div>

            <div className="stagger-children grid gap-6 md:grid-cols-3">
              {[
                {
                  pct: "25%",
                  label: "PPE Approval",
                  description:
                    "Released when buyer approves the pre-purchase exam results.",
                },
                {
                  pct: "25%",
                  label: "Trial Completion",
                  description:
                    "Released after the trial period is completed successfully.",
                },
                {
                  pct: "50%",
                  label: "Delivery Confirmation",
                  description:
                    "Final release when buyer confirms safe delivery and inspection.",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="animate-fade-up rounded-lg bg-paper-white p-8 text-center shadow-flat transition-elevation hover-lift hover:shadow-lifted"
                >
                  <p className="font-serif text-5xl font-bold text-ink-black">
                    {m.pct}
                  </p>
                  <p className="mt-2 font-heading text-sm font-semibold text-ink-dark">
                    {m.label}
                  </p>
                  <p className="mt-2 text-sm text-ink-mid">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Transaction Fees ── */}
        <section className="bg-paper-white section-compact">
          <div className="mx-auto max-w-[1200px]">
            <div className="rounded-lg bg-paper-cream p-8 shadow-flat md:p-12">
              <p className="overline mb-3 text-ink-light">
                TRANSACTION FEES
              </p>
              <h2 className="font-serif mb-4 text-2xl text-ink-black md:text-3xl">
                Transaction fees
              </h2>
              <p className="mb-8 max-w-xl text-ink-mid">
                Currently waived during launch. Standard rates upon general availability:
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-paper-warm p-6">
                  <p className="overline mb-2 text-ink-light">
                    TRANSACTIONS &gt; $50K
                  </p>
                  <p className="font-serif text-4xl font-bold text-ink-black">
                    3-5%
                  </p>
                </div>
                <div className="rounded-lg bg-paper-warm p-6">
                  <p className="overline mb-2 text-ink-light">
                    TRANSACTIONS $10K-$50K
                  </p>
                  <p className="font-serif text-4xl font-bold text-ink-black">
                    5-8%
                  </p>
                </div>
              </div>
              <p className="mt-6 text-xs text-ink-light">
                ACH transfers (default for transactions &gt;$5K) cap Stripe
                processing at $5 per transaction. Card payments incur standard
                processing fees (2.9% + $0.30).
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
