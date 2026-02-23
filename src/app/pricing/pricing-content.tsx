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
    description: "Perfect for individual sellers with a few horses.",
    features: [
      "Up to 3 active listings",
      "Basic seller profile",
      "Messaging (10/day)",
      "ManeVault escrow access",
      "Listing completeness score",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    monthlyPrice: 49,
    annualPrice: 490,
    description: "For active sellers and small barns.",
    features: [
      "Up to 10 active listings",
      "Farm storefront page",
      "Messaging (50/day)",
      "ISO matching (5/month)",
      "Priority in search results",
      "Analytics dashboard",
      "Seller verification badge",
    ],
    cta: "Start Free",
    highlighted: true,
  },
  {
    name: "Elite",
    monthlyPrice: 149,
    annualPrice: 1490,
    description: "For consignment barns and high-volume sellers.",
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
    cta: "Start Free",
    highlighted: false,
  },
];

function formatPrice(tier: (typeof sellerTiers)[number], annual: boolean) {
  if (tier.monthlyPrice === 0) {
    return { display: "Free", note: "Free forever", perMonth: null };
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
      <main className="px-4 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-16 text-center">
            <p className="overline mb-3 text-red">PRICING</p>
            <h1 className="mb-4 text-4xl font-bold text-ink-black md:text-5xl">
              Free to start. Free to grow.
            </h1>
            <p className="text-lead mx-auto max-w-2xl text-ink-mid">
              Every tier is free during our launch period. Build your presence
              and track record before any fees kick in.
            </p>
          </div>

          {/* B9: Monthly/Annual Toggle */}
          <div className="mb-12 flex items-center justify-center gap-3">
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
                className="bg-forest/10 text-forest text-xs"
              >
                2 months free
              </Badge>
            )}
          </div>

          {/* Seller Tiers */}
          <div className="mb-8 text-center">
            <p className="overline mb-3 text-red">SELLER PLANS</p>
            <h2 className="text-2xl font-semibold text-ink-black">
              Plans for sellers
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {sellerTiers.map((tier) => {
              const price = formatPrice(tier, annual);
              return (
                <div
                  key={tier.name}
                  className={`relative rounded-lg border p-8 ${
                    tier.highlighted
                      ? "border-red bg-paper-white shadow-folded"
                      : "border-border bg-paper-cream shadow-flat"
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-red px-3 py-1 text-xs font-semibold text-white">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <h3 className="mb-1 text-lg font-semibold text-ink-black">
                    {tier.name}
                  </h3>
                  <div className="mb-1">
                    <span className="text-3xl font-bold text-ink-black">
                      {price.display}
                    </span>
                    {price.perMonth && (
                      <span className="text-sm text-ink-mid">
                        {price.perMonth}
                      </span>
                    )}
                  </div>
                  {tier.monthlyPrice === 0 ? (
                    <p className="mb-3 text-xs text-ink-light">Free forever</p>
                  ) : (
                    <p className="mb-3 text-xs text-ink-light">
                      {price.note
                        ? price.note
                        : `During launch — $${tier.monthlyPrice}/mo after`}
                    </p>
                  )}
                  <p className="mb-6 text-sm text-ink-mid">
                    {tier.description}
                  </p>
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

          {/* B8: Buyer Plans */}
          <div className="mt-16">
            <div className="mb-8 text-center">
              <p className="overline mb-3 text-blue">BUYER PLANS</p>
              <h2 className="text-2xl font-semibold text-ink-black">
                Tools for serious buyers
              </h2>
            </div>
            <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
              {/* Free Buyer */}
              <div className="rounded-lg border border-border bg-paper-cream p-8 shadow-flat">
                <h3 className="text-lg font-semibold text-ink-black">Free</h3>
                <p className="mt-1 text-3xl font-bold text-ink-black">$0</p>
                <p className="text-xs text-ink-light">Free forever</p>
                <p className="mt-3 text-sm text-ink-mid">
                  Browse, save, and message sellers.
                </p>
                <ul className="mt-6 space-y-3">
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
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
              {/* Buyer Pro */}
              <div className="relative rounded-lg border border-blue bg-paper-white p-8 shadow-folded">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-blue px-3 py-1 text-xs font-semibold text-white">
                    FOR BUYERS
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-ink-black">
                  Buyer Pro
                </h3>
                <div className="mt-1">
                  <span className="text-3xl font-bold text-ink-black">
                    Free
                  </span>
                </div>
                <p className="text-xs text-ink-light">
                  During launch — $39/mo after
                </p>
                <p className="mt-3 text-sm text-ink-mid">
                  AI matching, unlimited access, and priority support.
                </p>
                <ul className="mt-6 space-y-3">
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
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Elite math callout */}
            <div className="mx-auto mt-8 max-w-2xl rounded-lg bg-ink-black p-6 text-center">
              <p className="text-sm text-ink-light">Do the math</p>
              <p className="mt-2 text-lg font-semibold text-paper-white">
                Pro Seller ($49) + Buyer Pro ($39) ={" "}
                <span className="text-ink-light line-through">$88/mo</span>
              </p>
              <p className="mt-1 text-2xl font-bold text-gold">
                Elite gives you everything for $149/mo
              </p>
              <p className="mt-2 text-sm text-ink-light">
                Save with Elite if you&apos;re both buying and selling.
              </p>
            </div>
          </div>

          {/* B10: ManeVault Escrow Milestones */}
          <div className="mt-16 rounded-lg border border-border bg-paper-white p-8">
            <h2 className="mb-2 text-xl font-semibold text-ink-black">
              ManeVault Escrow
            </h2>
            <p className="mb-6 text-ink-mid">
              Funds are released in milestones, not all at once.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-md bg-paper-cream p-5 text-center">
                <p className="text-3xl font-bold text-ink-black">25%</p>
                <p className="mt-1 text-sm font-medium text-ink-dark">
                  PPE Approval
                </p>
                <p className="mt-1 text-xs text-ink-mid">
                  Released when buyer approves the pre-purchase exam results.
                </p>
              </div>
              <div className="rounded-md bg-paper-cream p-5 text-center">
                <p className="text-3xl font-bold text-ink-black">25%</p>
                <p className="mt-1 text-sm font-medium text-ink-dark">
                  Trial Completion
                </p>
                <p className="mt-1 text-xs text-ink-mid">
                  Released after the trial period is completed successfully.
                </p>
              </div>
              <div className="rounded-md bg-paper-cream p-5 text-center">
                <p className="text-3xl font-bold text-ink-black">50%</p>
                <p className="mt-1 text-sm font-medium text-ink-dark">
                  Delivery Confirmation
                </p>
                <p className="mt-1 text-xs text-ink-mid">
                  Final release when buyer confirms safe delivery and
                  inspection.
                </p>
              </div>
            </div>
          </div>

          {/* Transaction fees */}
          <div className="mt-16 rounded-lg border border-border bg-paper-cream p-8">
            <h2 className="mb-4 text-xl font-semibold text-ink-black">
              Transaction Fees
            </h2>
            <p className="mb-4 text-ink-mid">
              Zero transaction fees during launch. When fees begin (month
              12-18):
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md bg-paper-warm p-4">
                <p className="overline mb-1 text-ink-light">
                  TRANSACTIONS &gt; $50K
                </p>
                <p className="text-2xl font-bold text-ink-black">3-5%</p>
              </div>
              <div className="rounded-md bg-paper-warm p-4">
                <p className="overline mb-1 text-ink-light">
                  TRANSACTIONS $10K-$50K
                </p>
                <p className="text-2xl font-bold text-ink-black">5-8%</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-ink-light">
              ACH transfers (default for transactions &gt;$5K) cap Stripe
              processing at $5 per transaction. Card payments incur standard
              processing fees (2.9% + $0.30).
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
