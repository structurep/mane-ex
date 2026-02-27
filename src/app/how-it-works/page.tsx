import { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/bottom-cta";
import { FaqAccordion } from "@/components/faq-accordion";
import { FlowToggle } from "./flow-toggle";
import {
  BarChart3,
  Search,
  Bookmark,
  CheckCircle2,
  DollarSign,
  Bell,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how ManeExchange protects buyers and sellers through verified listings, escrow payments, and transparent scoring.",
};

const faqs = [
  {
    question: "Is ManeExchange free to use as a buyer?",
    answer:
      "You get a 14-day free trial. After that, browsing is free but messaging and advanced features require Buyer Pro ($39/mo). Sellers can start with 1 free listing.",
  },
  {
    question: "How does ManeVault escrow protect me?",
    answer:
      "Funds are held by a neutral third party until the horse arrives and passes your inspection. A 5-day inspection window and 14-day dispute window protect both buyer and seller.",
  },
  {
    question: "What is the Mane Score?",
    answer:
      "A documentation completeness score on every listing. It measures how thoroughly a seller has documented vet records, show history, registration, and media — not the quality of the horse itself.",
  },
  {
    question: "Can I list my horse for free?",
    answer:
      "Yes — 1 listing on the Free plan. Starter ($29/mo) gives you 3, Pro ($79/mo) is unlimited, and Elite ($149/mo) includes featured placement and Buyer Pro.",
  },
  {
    question: "How long does the escrow process take?",
    answer:
      "After delivery confirmation, the buyer has 5 days to inspect. If no dispute is opened, funds release after the 14-day dispute window closes. Total: about 3 weeks from offer acceptance.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ══════════════════════════════════════════════
            SECTION 1 — HERO (dark photo)
            ══════════════════════════════════════════════ */}
        <section className="relative flex min-h-[50vh] items-center overflow-hidden bg-paddock">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1920&q=80&auto=format&fit=crop"
              alt=""
              fill
              className="object-cover opacity-10"
            />
          </div>
          <div className="relative px-4 py-24 md:px-8 md:py-32">
            <div className="mx-auto max-w-7xl">
              <div className="max-w-2xl">
                <p className="overline mb-4 text-primary">HOW IT WORKS</p>
                <h1 className="font-serif text-4xl text-white sm:text-5xl md:text-6xl">
                  Everything you need to
                  <br />
                  buy or sell with confidence.
                </h1>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 2 — BENEFITS GRID (buyer/seller toggle)
            ══════════════════════════════════════════════ */}
        <section className="bg-paper-cream px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <FlowToggle />
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 3 — MANE SCORE (2-col with mock)
            ══════════════════════════════════════════════ */}
        <section className="bg-paper-white px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <BarChart3 className="h-3 w-3" /> MANE SCORE
                </span>
                <h2 className="mt-4 font-serif text-3xl text-ink-black md:text-4xl">
                  Transparency you can trust
                </h2>
                <p className="mt-4 text-ink-mid">
                  Every listing earns a documentation completeness score. Vet
                  records, show history, registration, media quality, and seller
                  responsiveness — all measured objectively.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "1,000-point documentation scoring",
                    "Vet records, x-rays, and show history verified",
                    "Response time contributes to score",
                    "Higher scores = more buyer trust = faster sales",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-ink-dark"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Mock Mane Score card */}
              <div className="rounded-2xl border border-crease-light bg-paper-cream p-8">
                <div className="text-center">
                  <p className="text-sm text-ink-light">Mane Score</p>
                  <p className="mt-2 font-serif text-6xl font-bold text-ink-black">
                    87
                  </p>
                  <p className="mt-1 text-sm font-medium text-forest">
                    Excellent
                  </p>
                  <div className="mx-auto mt-4 h-2 w-48 rounded-full bg-paper-warm">
                    <div className="h-2 w-[87%] rounded-full bg-forest" />
                  </div>
                </div>
                <div className="mt-8 space-y-3">
                  {[
                    { label: "Vet Records", score: 95 },
                    { label: "Show History", score: 90 },
                    { label: "Media Quality", score: 85 },
                    { label: "Response Time", score: 78 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs text-ink-mid">
                        <span>{item.label}</span>
                        <span>{item.score}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-paper-warm">
                        <div
                          className="h-1.5 rounded-full bg-primary"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 4 — MANEVAULT ESCROW (dark, 2-col)
            ══════════════════════════════════════════════ */}
        <section className="bg-paddock px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                  MANEVAULT
                </span>
                <h2 className="mt-4 text-3xl text-white md:text-4xl">
                  Secure payments, clear costs
                </h2>
                <p className="mt-4 text-lg text-white/70">
                  ManeVault holds funds securely until both parties are
                  satisfied. ACH transfers cap fees at $5. No more wiring
                  $50,000 to a stranger.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Funds held until horse arrives",
                    "5-day post-delivery inspection",
                    "14-day dispute resolution window",
                    "ACH transfers cap fees at $5",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-white/80"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Mock cost breakdown */}
              <div className="rounded-2xl bg-ink-dark/60 p-8">
                <p className="mb-4 text-sm font-medium text-white/60">
                  Sample Transaction
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Horse Price", value: "$125,000" },
                    { label: "Commission (10%)", value: "$12,500" },
                    { label: "Shipping", value: "$2,800" },
                    { label: "Insurance", value: "$2,500" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between border-b border-white/10 pb-3"
                    >
                      <span className="text-sm text-white/70">
                        {item.label}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {item.value}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-medium text-white">Total</span>
                    <span className="font-serif text-2xl font-bold text-white">
                      $142,800
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-white/40">
                    ManeVault fee: 5% ($7,140) &middot; Elite: 4% ($5,712)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 5 — ISO MATCHING (2-col)
            ══════════════════════════════════════════════ */}
        <section className="bg-paper-cream px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Search className="h-3 w-3" /> ISO POSTS
                </span>
                <h2 className="mt-4 font-serif text-3xl text-ink-black md:text-4xl">
                  Let horses find you
                </h2>
                <p className="mt-4 text-ink-mid">
                  Post an &ldquo;In Search Of&rdquo; describing your ideal horse
                  — breed, discipline, age, budget, and location. When a new
                  listing matches, you&apos;re notified automatically.
                </p>
                <p className="mt-3 text-ink-mid">
                  Sellers can also browse active ISOs and submit their horses
                  directly to buyers who are looking for exactly what they have.
                </p>
              </div>
              {/* Mock ISO card */}
              <div className="rounded-2xl border border-crease-light bg-paper-white p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  SAMPLE ISO
                </p>
                <h3 className="mt-2 font-heading text-lg font-semibold text-ink-black">
                  Hunter/Jumper, 16-16.2hh
                </h3>
                <div className="mt-4 space-y-2 text-sm text-ink-mid">
                  <p>
                    <span className="font-medium text-ink-dark">Budget:</span>{" "}
                    $40,000–$75,000
                  </p>
                  <p>
                    <span className="font-medium text-ink-dark">Age:</span> 7–12
                    years
                  </p>
                  <p>
                    <span className="font-medium text-ink-dark">Location:</span>{" "}
                    East Coast, willing to ship
                  </p>
                  <p>
                    <span className="font-medium text-ink-dark">Level:</span>{" "}
                    3&apos;6&quot;+ experience, amateur-friendly
                  </p>
                </div>
                <div className="mt-4 rounded-lg bg-forest/10 px-4 py-2 text-xs text-forest">
                  3 matching listings found
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 5B — PRICE TRANSPARENCY (2-col, reversed)
            ══════════════════════════════════════════════ */}
        <section className="bg-paper-white px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 md:grid-cols-2">
              {/* Mock listing prices */}
              <div className="rounded-2xl border border-crease-light bg-paper-cream p-8 md:order-1">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
                  PRICE TRANSPARENCY
                </p>
                <div className="space-y-3">
                  {[
                    {
                      name: "Midnight Star",
                      details: "16.1hh \u00b7 8yo \u00b7 Hunter",
                      price: "$125,000",
                    },
                    {
                      name: "Golden Hour",
                      details: "16.3hh \u00b7 10yo \u00b7 Equitation",
                      price: "$85,000",
                    },
                    {
                      name: "Blue Ribbon",
                      details: "15.3hh \u00b7 6yo \u00b7 Jumper",
                      price: "$95,000",
                    },
                  ].map((horse) => (
                    <div
                      key={horse.name}
                      className="flex items-center justify-between rounded-lg bg-paper-white p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink-black">
                          {horse.name}
                        </p>
                        <p className="text-xs text-ink-mid">{horse.details}</p>
                      </div>
                      <p className="font-serif text-sm font-semibold text-ink-black">
                        {horse.price}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center text-xs text-ink-light">
                  All prices shown upfront — no hidden costs
                </p>
              </div>

              <div className="md:order-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <DollarSign className="h-3 w-3" /> REAL PRICES
                </span>
                <h2 className="mt-4 font-serif text-3xl text-ink-black md:text-4xl">
                  No more guessing games
                </h2>
                <p className="mt-4 text-ink-mid">
                  See real asking prices upfront — no more &ldquo;DM for
                  price&rdquo; or &ldquo;POA.&rdquo; Know if a horse fits your
                  budget before you ever reach out.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Asking prices visible on every listing",
                    "Filter by budget instantly",
                    "See full cost breakdown before inquiring",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-ink-dark"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 6 — DREAM BARN (2-col, reversed)
            ══════════════════════════════════════════════ */}
        <section className="bg-paper-white px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 md:grid-cols-2">
              {/* Mock comparison */}
              <div className="rounded-2xl border border-crease-light bg-paper-cream p-8 md:order-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  DREAM BARN
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      name: "Sapphire",
                      breed: "Warmblood",
                      price: "$65,000",
                      status: "Watching",
                    },
                    {
                      name: "Gatsby",
                      breed: "Thoroughbred",
                      price: "$45,000",
                      change: "Price drop",
                    },
                    {
                      name: "Luna",
                      breed: "Dutch WB",
                      price: "$85,000",
                      status: "Shared with trainer",
                    },
                  ].map((horse) => (
                    <div
                      key={horse.name}
                      className="flex items-center justify-between rounded-lg bg-paper-white p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink-black">
                          {horse.name}
                        </p>
                        <p className="text-xs text-ink-mid">{horse.breed}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink-black">
                          {horse.price}
                        </p>
                        {horse.change && (
                          <p className="text-xs text-primary">{horse.change}</p>
                        )}
                        {horse.status && (
                          <p className="text-xs text-ink-light">
                            {horse.status}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:order-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Bookmark className="h-3 w-3" /> DREAM BARN
                </span>
                <h2 className="mt-4 font-serif text-3xl text-ink-black md:text-4xl">
                  Organize your search
                </h2>
                <p className="mt-4 text-ink-mid">
                  Save horses to themed collections. Track price changes over
                  time. Share your shortlist with your trainer. Get notified when
                  a saved horse&apos;s status changes.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Create unlimited collections",
                    "Track price drops in real time",
                    "Share with your trainer or advisor",
                    "Compare horses side-by-side",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-ink-dark"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 7 — SAVED SEARCHES (2-col)
            ══════════════════════════════════════════════ */}
        <section className="bg-paper-cream px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Bell className="h-3 w-3" /> SAVED SEARCHES
                </span>
                <h2 className="mt-4 font-serif text-3xl text-ink-black md:text-4xl">
                  Never miss a match
                </h2>
                <p className="mt-4 text-ink-mid">
                  Save your search criteria and get notified when new horses
                  match. Track multiple searches for yourself or clients.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Instant new listing alerts",
                    "Multiple saved searches",
                    "Price drop notifications",
                    "Compare saved horses",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-ink-dark"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Mock saved searches */}
              <div className="rounded-2xl border border-crease-light bg-paper-white p-8">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
                  SAVED SEARCHES
                </p>
                <div className="space-y-3">
                  {[
                    {
                      name: "Junior Hunter",
                      newCount: 12,
                      criteria: "$50k\u2013$100k \u00b7 15.2\u201316.2hh \u00b7 6\u201310 yrs",
                    },
                    {
                      name: "Big Eq Prospect",
                      newCount: 5,
                      criteria: "$75k\u2013$150k \u00b7 16.0\u201317.0hh \u00b7 Equitation",
                    },
                    {
                      name: "Packer for Daughter",
                      newCount: 0,
                      criteria: "$30k\u2013$60k \u00b7 Safe \u00b7 Children\u2019s Hunter",
                    },
                  ].map((search) => (
                    <div
                      key={search.name}
                      className="flex items-center justify-between rounded-lg bg-paper-cream p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink-black">
                          {search.name}
                        </p>
                        <p className="text-xs text-ink-mid">
                          {search.criteria}
                        </p>
                      </div>
                      {search.newCount > 0 ? (
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {search.newCount} new
                        </span>
                      ) : (
                        <span className="text-xs text-ink-light">
                          Up to date
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 8 — FAQ
            ══════════════════════════════════════════════ */}
        <FaqAccordion heading="Frequently Asked Questions" items={faqs} />

        {/* ══════════════════════════════════════════════
            SECTION 8 — BOTTOM CTA
            ══════════════════════════════════════════════ */}
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
