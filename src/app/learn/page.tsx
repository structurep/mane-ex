import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/bottom-cta";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  TrendingUp,
  Shield,
  ArrowRight,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Guides, insights, and expert advice for buying and selling horses. Educational resources from ManeExchange.",
};

const categories = [
  "All",
  "Buying Guide",
  "Selling Tips",
  "Market Insights",
  "Horse Care",
  "Legal & Compliance",
  "Training",
];

type CategoryColor = {
  bg: string;
  text: string;
};

const categoryColors: Record<string, CategoryColor> = {
  "Buying Guide": { bg: "bg-blue/10", text: "text-blue" },
  "Selling Tips": { bg: "bg-primary/10", text: "text-primary" },
  "Market Insights": { bg: "bg-gold/10", text: "text-gold" },
  "Horse Care": { bg: "bg-forest/10", text: "text-forest" },
  "Legal & Compliance": { bg: "bg-ink-dark/10", text: "text-ink-dark" },
  Training: { bg: "bg-blue/10", text: "text-blue" },
};

const articles = [
  {
    title: "Pre-Purchase Exams: What to Expect and Why They Matter",
    excerpt:
      "A thorough PPE is the single most important step in any horse purchase. Here's what happens, what it costs, and how to interpret the results.",
    category: "Buying Guide",
    author: "ManeExchange Team",
    readTime: "8 min read",
  },
  {
    title: "How to Price Your Horse: A Data-Driven Approach",
    excerpt:
      "Stop guessing. Use comparable sales, market trends, and listing data to set a price that attracts serious buyers.",
    category: "Selling Tips",
    author: "ManeExchange Team",
    readTime: "10 min read",
  },
  {
    title: "Q1 2026 Market Report: Hunter/Jumper Trends",
    excerpt:
      "Median sale prices, time on market, and emerging demand patterns from the first quarter of 2026.",
    category: "Market Insights",
    author: "ManeExchange Team",
    readTime: "6 min read",
  },
  {
    title: "Understanding Coggins Tests and Health Certificates",
    excerpt:
      "What they test for, when you need them, and what happens if a horse tests positive for EIA.",
    category: "Horse Care",
    author: "ManeExchange Team",
    readTime: "5 min read",
  },
  {
    title: "Florida Rule 5H: What Sellers Need to Know",
    excerpt:
      "Florida's equine disclosure requirements are some of the strictest in the country. Here's how to stay compliant.",
    category: "Legal & Compliance",
    author: "ManeExchange Team",
    readTime: "7 min read",
  },
  {
    title: "Preparing Your Horse for a Trial Ride",
    excerpt:
      "First impressions matter. How to present your horse in the best light while keeping expectations honest.",
    category: "Training",
    author: "ManeExchange Team",
    readTime: "6 min read",
  },
];

const guides = [
  {
    icon: BookOpen,
    title: "The Buyer's Handbook",
    description:
      "Step-by-step from search to purchase. How to evaluate listings, schedule trials, navigate PPEs, and close the deal with confidence.",
  },
  {
    icon: TrendingUp,
    title: "The Seller's Playbook",
    description:
      "Maximize your listing's performance. Photography tips, pricing strategy, documentation best practices, and how to respond to inquiries.",
  },
  {
    icon: Shield,
    title: "Understanding ManeVault Escrow",
    description:
      "How protected payments work, from initial deposit through final release. What happens during disputes and how both parties are protected.",
  },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-paper-white px-4 pt-20 pb-16 md:px-8 md:pt-24">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-3 text-gold">LEARN</p>
            <h1 className="mb-4 text-4xl font-bold text-ink-black md:text-5xl">
              Knowledge is power.
            </h1>
            <p className="text-lead mx-auto max-w-2xl text-ink-mid">
              Guides, insights, and expert advice for buying and selling horses.
            </p>
          </div>
        </section>

        {/* Category Pills */}
        <section className="bg-paper-white px-4 pb-12 md:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category, i) => (
                <Badge
                  key={category}
                  variant={i === 0 ? "default" : "outline"}
                  className={
                    i === 0
                      ? "px-4 py-1.5 text-sm cursor-default"
                      : "px-4 py-1.5 text-sm cursor-default border-crease-light text-ink-mid hover:bg-paper-warm hover:text-ink-dark"
                  }
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Article */}
        <section className="bg-paper-cream px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-[1200px]">
            <Link href="#" className="group block">
              <div className="grid gap-8 md:grid-cols-2 md:items-center">
                <div className="aspect-video rounded-lg bg-paper-warm" />
                <div>
                  <Badge
                    variant="secondary"
                    className={`mb-4 ${categoryColors["Buying Guide"].bg} ${categoryColors["Buying Guide"].text} border-0`}
                  >
                    Buying Guide
                  </Badge>
                  <h2 className="mb-3 text-2xl font-semibold text-ink-black group-hover:text-primary transition-colors md:text-3xl">
                    The Complete Guide to Buying a Horse in 2026
                  </h2>
                  <p className="mb-4 text-ink-mid leading-relaxed">
                    Everything you need to know about finding, evaluating, and
                    purchasing a horse — from initial search to closing the deal.
                  </p>
                  <div className="mb-6 flex items-center gap-4 text-sm text-ink-light">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      ManeExchange Team
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      12 min read
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Article Grid */}
        <section className="bg-paper-white px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => {
                const colors = categoryColors[article.category] ?? {
                  bg: "bg-ink-dark/10",
                  text: "text-ink-dark",
                };
                return (
                  <Link
                    key={article.title}
                    href="#"
                    className="group block rounded-lg transition-elevation hover-lift"
                  >
                    <div className="overflow-hidden rounded-lg border border-crease-light/60 bg-paper-white shadow-flat">
                      <div className="aspect-[4/3] bg-paper-warm" />
                      <div className="p-5">
                        <Badge
                          variant="secondary"
                          className={`mb-3 ${colors.bg} ${colors.text} border-0`}
                        >
                          {article.category}
                        </Badge>
                        <h3 className="mb-2 text-lg font-medium text-ink-black group-hover:text-primary transition-colors leading-snug">
                          {article.title}
                        </h3>
                        <p className="mb-4 text-sm text-ink-mid line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-ink-light">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {article.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* In-Depth Guides */}
        <section className="bg-paper-cream px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-10 text-2xl font-semibold text-ink-black md:text-3xl">
              In-Depth Guides
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {guides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <Link
                    key={guide.title}
                    href="#"
                    className="group block rounded-lg border border-crease-light/60 bg-paper-white p-6 shadow-flat transition-elevation hover-lift md:p-8"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-ink-black group-hover:text-primary transition-colors">
                      {guide.title}
                    </h3>
                    <p className="mb-5 text-sm text-ink-mid leading-relaxed">
                      {guide.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                      Read Guide
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="bg-paddock px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-paper-white">
              Stay in the loop.
            </h2>
            <p className="mb-8 text-ink-light">
              Weekly market insights, new guides, and expert advice delivered to
              your inbox. No spam, no fluff — just substance.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 rounded-md border border-crease-dark/30 bg-ink-dark px-4 py-2.5 text-sm text-paper-white placeholder:text-ink-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Email address"
              />
              <Button size="lg" className="shrink-0">
                Subscribe
              </Button>
            </div>
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
