"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/tailwind-plus";
import { CheckCircle2, ArrowRight } from "lucide-react";

const sellerTiers = [
  {
    name: "Free",
    tagline: "Hook",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "1 listing (ever)",
    features: [
      "1 active listing",
      "14-day visibility",
      "5 messages/month",
      "No analytics",
      "Standard placement",
      "Passive matching",
      "Basic Mane Score",
      "5% ManeVault fee",
    ],
    cta: "Start Free",
    style: "light" as const,
  },
  {
    name: "Starter",
    tagline: "Engage",
    monthlyPrice: 29,
    annualPrice: 290,
    description: "3 active listings",
    features: [
      "3 active listings",
      "Active while subscribed",
      "15 messages/month",
      "View counts only",
      "Standard placement",
      "Passive matching",
      "Identity verified badge",
      "5% ManeVault fee",
    ],
    cta: "Get Starter",
    style: "light" as const,
  },
  {
    name: "Pro",
    tagline: "Convert",
    monthlyPrice: 79,
    annualPrice: 790,
    description: "Unlimited listings",
    features: [
      "Unlimited listings",
      "Always live",
      "Unlimited messages",
      "Full analytics + sources",
      "Priority placement",
      "Active AI matching",
      "Verified badge + Mane Score",
      "5% ManeVault fee",
    ],
    cta: "Go Pro",
    style: "highlighted" as const,
  },
  {
    name: "Elite",
    tagline: "Dominate",
    monthlyPrice: 149,
    annualPrice: 1490,
    description: "Everything, unlimited",
    features: [
      "Unlimited listings, always on",
      "Homepage featured placement",
      "Unlimited messages",
      "Full + weekly AI reports",
      "First-priority placement",
      "Social promotion",
      "Featured Seller badge",
      "Buyer Pro included",
      "4% ManeVault fee",
      "Team accounts (up to 5)",
    ],
    cta: "Go Elite",
    style: "elite" as const,
  },
];

function formatPrice(
  tier: (typeof sellerTiers)[number],
  annual: boolean
) {
  if (tier.monthlyPrice === 0) {
    return { display: "$0", note: "forever", perMonth: null };
  }
  if (annual) {
    const perMonth = Math.round(tier.annualPrice / 12);
    return {
      display: `$${perMonth}`,
      note: `$${tier.annualPrice.toLocaleString()}/year`,
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
  const [planType, setPlanType] = useState<"seller" | "buyer">("seller");

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ══════════════════════════════════════════════
            HERO
            ══════════════════════════════════════════════ */}
        <section className="bg-paper-cream px-4 pt-24 pb-8 md:px-8 md:pt-36 md:pb-12">
          <div className="mx-auto max-w-[1200px] text-center">
            <h1 className="mb-6 font-serif text-4xl tracking-tight text-ink-black md:text-6xl">
              Choose the plan that fits
              <br />
              how you {planType === "seller" ? "sell" : "buy"} horses.
            </h1>
            <p className="text-lead mx-auto max-w-2xl text-ink-mid">
              {planType === "seller"
                ? "Free to start. Upgrade when your listings need more visibility, messages, and intelligence."
                : "Browse free for 14 days. Upgrade when you need unlimited messaging, ISOs, and AI matching."}
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            TOGGLES
            ══════════════════════════════════════════════ */}
        <section className="bg-paper-cream px-4 pb-12 md:px-8">
          <div className="flex flex-col items-center gap-5">
            {/* Plan type toggle */}
            <div className="flex gap-1 rounded-[var(--radius-card)] bg-paddock p-1">
              <button
                onClick={() => setPlanType("seller")}
                className={`rounded-[var(--radius-card)] px-6 py-2.5 text-sm font-semibold transition-colors ${
                  planType === "seller"
                    ? "bg-white text-paddock"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Seller Plans
              </button>
              <button
                onClick={() => setPlanType("buyer")}
                className={`rounded-[var(--radius-card)] px-6 py-2.5 text-sm font-semibold transition-colors ${
                  planType === "buyer"
                    ? "bg-white text-paddock"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Buyer Plans
              </button>
            </div>

            {/* Billing toggle */}
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium ${!annual ? "text-ink-black" : "text-ink-light"}`}
              >
                Monthly
              </span>
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative h-7 w-12 rounded-full transition-colors ${annual ? "bg-navy" : "bg-ink-light/30"}`}
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
                <span className="text-sm font-medium text-primary">
                  Save 2 months
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SELLER PLANS — 4 Tiers
            ══════════════════════════════════════════════ */}
        {planType === "seller" && (
          <section className="bg-paper-cream px-4 pb-16 md:px-8 md:pb-20">
            <div className="mx-auto max-w-[1200px]">
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {sellerTiers.map((tier) => {
                  const price = formatPrice(tier, annual);
                  const isElite = tier.style === "elite";
                  const isHighlighted = tier.style === "highlighted";

                  return (
                    <div
                      key={tier.name}
                      className={`relative flex flex-col rounded-[var(--radius-card)] p-6 ${
                        isElite
                          ? "border-2 border-primary bg-paddock text-white"
                          : isHighlighted
                            ? "border-2 border-primary bg-paper-white shadow-lifted"
                            : "border border-crease-light bg-paper-white"
                      }`}
                    >
                      {isHighlighted && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <StatusBadge variant="navy">
                            Most Popular
                          </StatusBadge>
                        </div>
                      )}
                      {isElite && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <StatusBadge variant="gold">
                            Best Value
                          </StatusBadge>
                        </div>
                      )}

                      <p
                        className={`text-xs font-semibold uppercase tracking-wider ${isElite ? "text-primary" : "text-ink-light"}`}
                      >
                        {tier.tagline}
                      </p>
                      <h3
                        className={`mt-1 font-heading text-xl font-bold ${isElite ? "text-white" : "text-ink-black"}`}
                      >
                        {tier.name}
                      </h3>
                      <div className="mt-3">
                        <span
                          className={`font-serif text-4xl font-bold ${isElite ? "text-white" : "text-ink-black"}`}
                        >
                          {price.display}
                        </span>
                        {price.perMonth && (
                          <span
                            className={`text-sm ${isElite ? "text-white/60" : "text-ink-mid"}`}
                          >
                            {price.perMonth}
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-1 text-xs ${isElite ? "text-white/50" : "text-ink-light"}`}
                      >
                        {price.note ?? tier.description}
                      </p>

                      <div
                        className={`my-5 border-t ${isElite ? "border-white/10" : "border-crease-light"}`}
                      />

                      <ul className="mb-6 flex-1 space-y-3">
                        {tier.features.map((feature) => (
                          <li
                            key={feature}
                            className={`flex items-start gap-2 text-sm ${isElite ? "text-white/80" : "text-ink-dark"}`}
                          >
                            <CheckCircle2
                              className={`mt-0.5 h-4 w-4 shrink-0 ${isElite ? "text-primary" : "text-forest"}`}
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full ${
                          isElite
                            ? "bg-white text-paddock hover:bg-white/90"
                            : isHighlighted
                              ? ""
                              : ""
                        }`}
                        variant={
                          isElite
                            ? "secondary"
                            : isHighlighted
                              ? "default"
                              : "outline"
                        }
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

              {/* Elite Math Box */}
              <div className="mx-auto mt-12 max-w-2xl rounded-[var(--radius-card)] bg-paddock p-8 text-center">
                <p className="overline text-white/50">THE ELITE MATH</p>
                <p className="mt-3 text-lg text-white">
                  Pro Seller + Buyer Pro ={" "}
                  <span className="text-white/50 line-through">$118/mo</span>
                </p>
                <p className="mt-1 font-serif text-3xl font-bold text-primary">
                  Elite = $149/mo — everything.
                </p>
                <p className="mt-3 text-sm text-white/60">
                  Elite is cheaper than buying both sides separately. Plus 4%
                  escrow vs 5%.
                </p>
                <Button size="lg" className="mt-6" asChild>
                  <Link href="/signup">
                    Start Elite
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════
            BUYER PLANS
            ══════════════════════════════════════════════ */}
        {planType === "buyer" && (
          <section className="bg-paper-cream px-4 pb-16 md:px-8 md:pb-20">
            <div className="mx-auto max-w-3xl">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Free Buyer */}
                <div className="rounded-[var(--radius-card)] border border-crease-light bg-paper-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-light">
                    14-Day Trial
                  </p>
                  <h3 className="mt-1 font-heading text-xl font-bold text-ink-black">
                    Free
                  </h3>
                  <p className="mt-3 font-serif text-4xl font-bold text-ink-black">
                    $0
                  </p>
                  <p className="mt-1 text-xs text-ink-light">14 days</p>
                  <div className="my-5 border-t border-crease-light" />
                  <ul className="space-y-3">
                    {[
                      "Browse all listings",
                      "1 saved search",
                      "5 messages/month",
                      "No ISOs",
                      "No price drop alerts",
                      "Basic search",
                      "Platform messaging",
                      "Standard ManeVault",
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
                  <Button variant="outline" className="mt-6 w-full" asChild>
                    <Link href="/signup">Start Trial</Link>
                  </Button>
                </div>

                {/* Buyer Pro */}
                <div className="relative rounded-[var(--radius-card)] border-2 border-primary bg-paper-white p-6 shadow-lifted">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <StatusBadge variant="navy">
                      Most Popular
                    </StatusBadge>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Find Your Horse
                  </p>
                  <h3 className="mt-1 font-heading text-xl font-bold text-ink-black">
                    Buyer Pro
                  </h3>
                  <div className="mt-3">
                    <span className="font-serif text-4xl font-bold text-ink-black">
                      {annual ? "$33" : "$39"}
                    </span>
                    <span className="text-sm text-ink-mid">/mo</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-light">
                    {annual ? "$390/year" : "Currently waived"}
                  </p>
                  <div className="my-5 border-t border-crease-light" />
                  <ul className="space-y-3">
                    {[
                      "Unlimited messages",
                      "3 ISOs",
                      "Unlimited saved searches",
                      "AI matching",
                      "Pre-listing access 24hr",
                      "Price drop alerts (instant)",
                      "Direct seller contact",
                      "Extended PPE + priority disputes",
                      "ISO analytics",
                      "Advanced filters",
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
                  <Button className="mt-6 w-full" asChild>
                    <Link href="/signup">
                      Get Buyer Pro
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════
            MANEVAULT ESCROW
            ══════════════════════════════════════════════ */}
        <section className="bg-paper-white px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-[1200px]">
            <h3 className="mb-8 text-center font-serif text-2xl text-ink-black md:text-3xl">
              ManeVault Escrow — Built Into Every Sale
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  pct: "25%",
                  label: "At PPE approval",
                },
                {
                  pct: "25%",
                  label: "At trial completion",
                },
                {
                  pct: "50%",
                  label: "At delivery",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-[var(--radius-card)] border border-crease-light bg-paper-cream p-8 text-center"
                >
                  <p className="font-serif text-5xl font-bold text-ink-black">
                    {m.pct}
                  </p>
                  <p className="mt-2 text-sm text-ink-mid">{m.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-ink-light">
              Standard fee: 5% &middot; Elite fee: 4% &middot; Elite saves
              $1,000 on every $100K sale
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            BOTTOM CTA
            ══════════════════════════════════════════════ */}
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
