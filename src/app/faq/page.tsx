"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ArrowRight } from "lucide-react";

type Category = "Buying" | "Selling" | "Payments" | "Trust & Safety";

interface FaqItem {
  category: Category;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: "Buying",
    question: "How do I search for a horse?",
    answer:
      "Use our Browse page to search by discipline, breed, price range, location, gender, height, and more. Every listing includes detailed information about the horse's training, show history, vet records, and media — so you can evaluate before reaching out. Save favorites to your Dream Barn collections and set up alerts for new matches.",
  },
  {
    category: "Buying",
    question: "What is ManeGuard buyer protection?",
    answer:
      "ManeGuard is our buyer protection program built on top of ManeVault escrow. When you purchase through ManeExchange, your funds are held securely until the horse arrives and passes your pre-purchase exam window. If the horse doesn't match the listing description or fails a PPE, you're covered. ManeGuard ensures you never wire money to a stranger with no recourse.",
  },
  {
    category: "Buying",
    question: "Can I arrange a trial ride before buying?",
    answer:
      "Yes. You can request a trial ride directly through the listing page. The seller receives your request with your riding background and preferred dates, and can accept, suggest alternatives, or decline. For out-of-area buyers, we also support guided video calls and virtual barn tours. All trial arrangements are documented on the platform for both parties' protection.",
  },
  {
    category: "Selling",
    question: "How do I list a horse?",
    answer:
      "From your dashboard, click 'New Listing' to start our 7-step listing wizard. You'll enter basic info (breed, age, height, discipline), farm and training details, show records, vet history, photos and videos, ownership history, and pricing. The wizard handles state-specific legal disclosures automatically — including Florida Rule 5H, California requirements, and UCC Article 2 warranty language. Save as a draft anytime and publish when ready.",
  },
  {
    category: "Selling",
    question: "What does the Mane Score measure?",
    answer:
      "The Mane Score is a listing completeness and seller engagement metric — it does not evaluate horse quality. It's scored on a 0-1000 scale across three components: Completeness (how thorough your listing documentation is), Engagement (response time, activity level), and Credibility (reviews, verified transactions). A higher score signals to buyers that you're a responsive, well-documented seller. The score decays slightly after 30 days of inactivity to keep the marketplace fresh.",
  },
  {
    category: "Selling",
    question: "How much does it cost to list?",
    answer:
      "ManeExchange offers tiered plans. Free accounts can list a limited number of horses with standard features. Paid plans unlock more listings, priority placement, advanced analytics, and premium features like ManeMatch AI recommendations. Visit our Pricing page for current plan details. There are no listing fees on the free tier — you only pay transaction fees when a sale closes through ManeVault.",
  },
  {
    category: "Payments",
    question: "How does ManeVault escrow work?",
    answer:
      "ManeVault is our built-in escrow system powered by Stripe Connect. When a buyer and seller agree on a price, the buyer funds the escrow. The funds are held securely by Stripe — not by ManeExchange — until the horse is delivered and the buyer confirms receipt. Once confirmed, funds are released to the seller. If there's a dispute, our resolution process kicks in before any money moves. It's the same protection you'd get from a dedicated escrow service, built directly into the platform.",
  },
  {
    category: "Payments",
    question: "What payment methods are accepted?",
    answer:
      "ManeVault supports ACH bank transfers and credit/debit cards. We recommend ACH for large transactions — the fee is a flat $5 compared to the 2.9% + 30 cents on card payments. For a $50,000 horse, that's $5 vs. $1,480. Both methods are processed securely through Stripe with full fraud protection.",
  },
  {
    category: "Payments",
    question: "When do sellers receive their funds?",
    answer:
      "Funds are released to the seller once the buyer confirms delivery and any agreed-upon inspection period (such as a PPE window) has passed. For ACH payouts, funds typically arrive in the seller's bank account within 2-3 business days after release. Sellers can track the status of every transaction in real time from their dashboard.",
  },
  {
    category: "Payments",
    question: "What are the transaction fees?",
    answer:
      "ManeExchange charges a small platform fee on completed transactions processed through ManeVault. ACH transfers carry a flat $5 processing fee. Card payments are subject to standard Stripe processing rates (2.9% + $0.30). There are no hidden fees — the total cost is shown before you confirm any transaction. Subscription plans may include reduced transaction fees at higher tiers.",
  },
  {
    category: "Trust & Safety",
    question: "How does seller verification work?",
    answer:
      "Sellers on ManeExchange go through identity verification via Stripe Connect when they set up their account for payouts. This includes legal name, address, and banking information verification. Beyond that, the Mane Score and badge system surfaces sellers who consistently provide thorough documentation, respond quickly, and complete transactions successfully. Look for badges like 'Escrow Verified' and 'Documentation Champion' as signals of a trusted seller.",
  },
  {
    category: "Trust & Safety",
    question: "How do I report a problem?",
    answer:
      "You can report any listing, user, or message directly from the platform using the flag icon. Reports are reviewed by our moderation team and resolved with full audit logging. For active transactions, you can open a dispute through the escrow timeline on your offers page. We take every report seriously — accounts that violate our terms are subject to suspension. You can track the status of your reports from your dashboard.",
  },
];

const FILTER_OPTIONS: ("All" | Category)[] = [
  "All",
  "Buying",
  "Selling",
  "Payments",
  "Trust & Safety",
];

const categoryAccent: Record<Category, string> = {
  Buying: "bg-blue-light text-blue",
  Selling: "bg-red-light text-red",
  Payments: "bg-gold-light text-gold",
  "Trust & Safety": "bg-forest-light text-forest",
};

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | Category>("All");
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const filteredItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesFilter =
        activeFilter === "All" || item.category === activeFilter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  function toggleItem(index: number) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ── Hero ── */}
        <section className="with-grain bg-gradient-hero px-4 pt-24 pb-20 md:px-8 md:pt-36 md:pb-28">
          <div className="mx-auto max-w-3xl">
            <p className="overline mb-4 text-red">
              FREQUENTLY ASKED QUESTIONS
            </p>
            <h1 className="mb-6 text-4xl tracking-tight text-ink-black md:text-6xl">
              We&apos;ve got answers.
            </h1>
            <p className="text-lead text-ink-mid">
              Everything you need to know about buying, selling, and transacting
              on ManeExchange. Can&apos;t find what you&apos;re looking for?{" "}
              <Link href="/contact" className="text-red underline">
                Reach out directly
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ── Search + Filters + Accordion ── */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-3xl">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-light" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-paper-white py-3 pr-4 pl-11 text-sm text-ink-black shadow-flat placeholder:text-ink-light focus:shadow-folded focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
              />
            </div>

            {/* Filter pills */}
            <div className="mb-10 flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none ${
                    activeFilter === filter
                      ? "bg-ink-black text-white shadow-flat"
                      : "bg-paper-white text-ink-mid shadow-flat hover:shadow-folded"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Accordion */}
            <div className="space-y-3">
              {filteredItems.length === 0 && (
                <div className="rounded-lg bg-paper-white px-6 py-12 text-center text-sm text-ink-light shadow-flat">
                  No questions match your search. Try a different term or{" "}
                  <Link href="/contact" className="text-red underline">
                    contact us
                  </Link>
                  .
                </div>
              )}
              {filteredItems.map((item) => {
                const originalIndex = FAQ_ITEMS.indexOf(item);
                const isOpen = openItems.has(originalIndex);

                return (
                  <div
                    key={originalIndex}
                    className={`rounded-lg bg-paper-white transition-elevation ${
                      isOpen ? "shadow-folded" : "shadow-flat hover:shadow-folded"
                    }`}
                  >
                    <button
                      onClick={() => toggleItem(originalIndex)}
                      className="flex w-full items-center justify-between rounded-lg px-6 py-5 text-left focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryAccent[item.category]}`}
                        >
                          {item.category}
                        </span>
                        <span className="font-medium text-ink-black">
                          {item.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={`ml-4 h-4 w-4 shrink-0 text-ink-light transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5">
                        <div className="crease-divider mb-4" />
                        <p className="text-sm leading-relaxed text-ink-mid">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="with-grain bg-paper-white section-premium">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl text-ink-black md:text-4xl">
              Still have questions?
            </h2>
            <p className="text-lead mx-auto mb-8 max-w-xl text-ink-mid">
              Our team is here to help. Reach out and we&apos;ll get back to you
              within 24 hours.
            </p>
            <Button size="lg" asChild>
              <Link href="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
