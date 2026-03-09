import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { FeaturePreview } from "@/components/feature-preview";
import {
  BookOpen,
  TrendingUp,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Guides, insights, and expert advice for buying and selling horses. Educational resources from ManeExchange.",
};

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

        {/* Planned Guides — no fake articles or dead links */}
        <section className="bg-paper-cream px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-3 text-center text-2xl font-semibold text-ink-black">
              In-Depth Guides
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center text-ink-mid">
              We&apos;re building comprehensive guides to help you buy and sell
              with confidence.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {guides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <div
                    key={guide.title}
                    className="rounded-lg border border-crease-light/60 bg-paper-white p-6 shadow-flat md:p-8"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-ink-black">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-ink-mid leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="bg-paper-white px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[800px]">
            <FeaturePreview
              icon={<BookOpen className="size-8" />}
              title="Learning Center is coming soon"
              description="Articles, market reports, and expert guides are on the way. We'll cover everything from pre-purchase exams to pricing strategy."
            />
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
