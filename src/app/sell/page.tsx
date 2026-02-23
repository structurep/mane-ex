import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/bottom-cta";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Users, FileCheck, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Sell Your Horse",
  description:
    "Sell your horse on ManeExchange — the equestrian marketplace with verified buyers, secure escrow payments, and compliance built into every listing.",
};

const steps = [
  {
    number: 1,
    title: "Create Your Profile",
    description:
      "Set up your seller profile and verify your identity through Stripe. It takes less than 5 minutes.",
  },
  {
    number: 2,
    title: "Build Your Listing",
    description:
      "Our 7-step wizard walks you through everything — details, vet records, media, pricing. State disclosures are built in.",
  },
  {
    number: 3,
    title: "Get Discovered",
    description:
      "Your listing is searchable by discipline, price, location, and more. Your Mane Score helps you stand out.",
  },
  {
    number: 4,
    title: "Connect with Buyers",
    description:
      "Receive inquiries, schedule trials, and negotiate offers — all within the platform.",
  },
  {
    number: 5,
    title: "Accept & Escrow",
    description:
      "Accept an offer and the buyer\u2019s payment is held in ManeVault. Ship knowing funds are secured.",
  },
  {
    number: 6,
    title: "Get Paid",
    description:
      "After buyer confirms delivery and the dispute window closes, funds transfer to your bank. Simple.",
  },
];

const stats = [
  { value: "2,500+", label: "Active Members" },
  { value: "40%", label: "Faster Sales" },
  { value: "3x", label: "More Views" },
  { value: "$0", label: "To Start" },
];

const valueProps = [
  {
    icon: BarChart3,
    color: "gold",
    title: "Transparency Score",
    description:
      "Your Mane Score measures listing completeness and responsiveness — not horse quality. More documentation builds more trust with buyers.",
  },
  {
    icon: Users,
    color: "blue",
    title: "Qualified Inquiries",
    description:
      "No tire-kickers. Buyers browse verified listings with full documentation. When they reach out, they\u2019re serious.",
  },
  {
    icon: FileCheck,
    color: "forest",
    title: "Verified Documents",
    description:
      "Vet records, registration papers, Coggins, show history — all organized in one place. Buyers see everything upfront.",
  },
  {
    icon: Lock,
    color: "red",
    title: "Secure Payments",
    description:
      "ManeVault escrow protects both sides. ACH transfers keep fees at $5 instead of $1,450 on a $50K horse.",
  },
];

const faqs = [
  {
    question: "How much does it cost to list?",
    answer:
      "Free during launch. When pricing begins, Starter is free (3 listings), Pro is $49/mo (10 listings), and Elite is $149/mo (unlimited).",
  },
  {
    question: "What are the transaction fees?",
    answer:
      "Zero during launch. When fees begin, transactions over $50K are 3-5% and $10K-$50K are 5-8%. ACH transfers cap Stripe processing at $5.",
  },
  {
    question: "How does ManeVault escrow work?",
    answer:
      "When a buyer accepts an offer, funds are held securely until the horse is delivered and inspected. You ship knowing the money is there.",
  },
  {
    question: "What documents should I include?",
    answer:
      "At minimum: registration papers, current Coggins, and recent photos. For higher scores: vet records, show history, training logs, and video.",
  },
  {
    question: "How long does it take to sell?",
    answer:
      "Depends on the horse, price, and documentation quality. Sellers with complete listings and fast response times sell 40% faster on average.",
  },
];

const iconColorMap: Record<string, { bg: string; text: string }> = {
  gold: { bg: "bg-gold/10", text: "text-gold" },
  blue: { bg: "bg-blue/10", text: "text-blue" },
  forest: { bg: "bg-forest/10", text: "text-forest" },
  red: { bg: "bg-red-light", text: "text-red" },
};

export default function SellPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-paper-white px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-3 text-red">SELL ON MANEEXCHANGE</p>
            <h1 className="mb-6 text-4xl font-bold text-ink-black md:text-5xl">
              Sell smarter. Not harder.
            </h1>
            <p className="text-lead mx-auto mb-8 max-w-2xl text-ink-mid">
              The equestrian marketplace built for serious sellers. Verified
              buyers, secure payments, and a listing process that does the
              compliance work for you.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild>
                <Link href="/dashboard/listings/new">
                  List Your Horse
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/pricing">See Pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Social Proof Stats */}
        <section className="bg-ink-black px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-paper-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-ink-light">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-paper-cream px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <p className="overline mb-3 text-red">HOW IT WORKS</p>
            <h2 className="mb-10 text-3xl font-bold text-ink-black md:text-4xl">
              Six steps to a secure sale.
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-lg border border-border bg-paper-white p-6 shadow-flat"
                >
                  <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-red text-sm font-bold text-white">
                    {step.number}
                  </span>
                  <h3 className="mb-2 font-medium text-ink-black">
                    {step.title}
                  </h3>
                  <p className="text-sm text-ink-mid">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="bg-paper-white px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <p className="overline mb-3 text-red">WHY MANEEXCHANGE</p>
            <h2 className="mb-10 text-3xl font-bold text-ink-black md:text-4xl">
              Built for how horses are actually sold.
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {valueProps.map((prop) => {
                const Icon = prop.icon;
                const colors = iconColorMap[prop.color];
                return (
                  <div key={prop.title} className="flex gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.bg}`}
                    >
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="mb-1 font-medium text-ink-black">
                        {prop.title}
                      </h3>
                      <p className="text-sm text-ink-mid">{prop.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-paper-cream px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-3xl font-bold text-ink-black md:text-4xl">
              Common questions from sellers
            </h2>
            <div>
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group border-b border-border"
                >
                  <summary className="flex cursor-pointer items-center justify-between py-4 font-medium text-ink-black">
                    {faq.question}
                  </summary>
                  <p className="pb-4 text-sm text-ink-mid">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
