import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { FaqAccordion } from "@/components/marketplace/faq-accordion";
import { getCreateListingUrl } from "@/lib/urls";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Users,
  FileCheck,
  Lock,
  Timer,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sell Your Horse",
  description:
    "Sell your horse on ManeExchange. List in 5 minutes, reach serious buyers, skip the tire-kickers.",
};

const steps = [
  {
    number: 1,
    time: "~30 seconds",
    title: "Create Your Account",
    description:
      "Email, password, done. We\u2019ll ask about your role (seller, trainer, both) so we can tailor the experience.",
  },
  {
    number: 2,
    time: "~3 minutes",
    title: "Tell Your Horse\u2019s Story",
    description:
      "Name, breed, height, age \u2014 the basics. Then the good stuff: training history, show experience, rideability. Paint the picture.",
  },
  {
    number: 3,
    time: "~2 minutes",
    title: "Upload the Receipts",
    description:
      "PPE, x-rays, show records \u2014 the docs that build trust. We auto-link USEF/USHJA/FEI records. More docs = higher Mane Score.",
  },
  {
    number: 4,
    time: "~2 minutes",
    title: "Set Your Price",
    description:
      "We\u2019ll show you market comps for similar horses. Price it right, or choose \u2018Price on Request\u2019 for flexibility.",
  },
  {
    number: 5,
    time: "~30 seconds",
    title: "Hit Publish",
    description:
      "Review your listing, click publish, and you\u2019re live. We handle search optimization and buyer matching.",
  },
  {
    number: 6,
    time: "Ongoing",
    title: "Field Inquiries",
    description:
      "Buyers message you directly with their profile visible. Schedule trials, answer questions, close the deal.",
  },
];

const differentiators = [
  {
    value: "Mane Score",
    label: "Transparency built in",
    sub: "every listing scored on completeness",
  },
  { value: "ManeVault", label: "Escrow protection", sub: "funds held until delivery confirmed" },
  { value: "Verified", label: "Buyer profiles included", sub: "see who's inquiring before you respond" },
  { value: "$0", label: "To get started", sub: "list your first horse free" },
];

const valueProps = [
  {
    icon: BarChart3,
    title: "Transparency Score",
    description:
      "Buyers see exactly what you\u2019ve disclosed at a glance. High scores = high trust = faster sales.",
    vs: "Facebook: buyers have no idea what\u2019s real",
  },
  {
    icon: Users,
    title: "Qualified Inquiries Only",
    description:
      "Every buyer has a profile. You see their budget, experience level, and what they\u2019re looking for before you respond.",
    vs: "Facebook: anonymous DMs from tire-kickers",
  },
  {
    icon: FileCheck,
    title: "Verified Documents",
    description:
      "PPE, x-rays, show records \u2014 uploaded and verified. Serious buyers don\u2019t waste time on unverified listings.",
    vs: 'Facebook: "I\'ll send it later" runaround',
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description:
      "ManeVault escrow protects both sides. No more chasing deposits or worrying about bounced checks.",
    vs: "Facebook: cash, Venmo, and hope for the best",
  },
];

const faqs = [
  {
    question: "How long does it take to list a horse?",
    answer:
      "Most sellers complete their first listing in under 10 minutes. Our 7-step wizard walks you through everything with autosave, so you can come back anytime.",
  },
  {
    question: "What documents should I upload?",
    answer:
      "PPE reports, x-rays, and Coggins are the big ones. Show records, registration papers, and training logs boost your Mane Score. The more you document, the more trust you build.",
  },
  {
    question: "How do I boost my Mane Score?",
    answer:
      "Upload a recent PPE, link show records, add x-rays, include video, respond to inquiries quickly, and complete all listing fields. Each action improves your score.",
  },
  {
    question: "Can I edit my listing after publishing?",
    answer:
      "Absolutely. Update photos, adjust pricing, add new documents, and modify details at any time from your dashboard.",
  },
  {
    question: "What\u2019s the success fee?",
    answer:
      "ManeVault escrow handles secure payments \u2014 5% standard fee, or 4% for Elite sellers. No sale, no fee.",
  },
  {
    question: "How do inquiries work?",
    answer:
      "Buyers message you directly through the platform. You\u2019ll see their profile, experience level, and budget before responding. Schedule trials, answer questions, and negotiate \u2014 all in one place.",
  },
];

export default function SellPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ══════════════════════════════════════════════
            SECTION 1 — HERO (2-col: text + glass card)
            ══════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-paddock">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1534307671554-9a6d81f4d629?w=1920&q=80&auto=format&fit=crop"
              alt=""
              fill
              className="object-cover opacity-10"
            />
          </div>

          <div className="relative px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
              {/* Left: Text */}
              <div>
                <h1 className="mb-6 font-serif text-4xl text-white sm:text-5xl md:text-6xl">
                  Sell smarter.
                  <br />
                  <span className="text-primary">Not harder.</span>
                </h1>
                <p className="mb-8 max-w-lg text-lg text-white/70">
                  Your horse deserves better than a Facebook post. List in 5
                  minutes, reach serious buyers, skip the tire-kickers.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" asChild>
                    <Link href={getCreateListingUrl()}>
                      Start Your Listing
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="!bg-transparent border-white/30 text-white hover:!bg-white/10"
                    asChild
                  >
                    <Link href="/how-it-works">Watch How It Works</Link>
                  </Button>
                </div>
                <p className="mt-4 text-sm text-white/40">
                  Free to list. No credit card required.
                </p>
              </div>

              {/* Right: Glass value card */}
              <div className="rounded-2xl border border-white/10 bg-white/10 p-8 backdrop-blur-sm">
                <div className="mb-6 flex items-center gap-2 text-sm text-white/60">
                  <Timer className="h-4 w-4" />
                  Why sellers switch to ManeExchange
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="font-serif text-3xl font-bold text-white">
                      Verified buyers only
                    </p>
                    <p className="text-sm text-white/50">
                      every inquiry includes a buyer profile
                    </p>
                  </div>
                  <div className="border-t border-white/10" />
                  <div>
                    <p className="font-serif text-3xl font-bold text-white">
                      Escrow-protected
                    </p>
                    <p className="text-sm text-white/50">
                      ManeVault holds funds until delivery
                    </p>
                  </div>
                  <div className="border-t border-white/10" />
                  <div>
                    <p className="font-serif text-3xl font-bold text-white">
                      No more tire-kickers
                    </p>
                    <p className="text-sm text-white/50">
                      Mane Score filters serious from casual
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 2 — HOW IT WORKS (6 step cards)
            ══════════════════════════════════════════════ */}
        <section className="bg-paper-white px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <h2 className="font-serif text-3xl text-ink-black md:text-4xl">
                How it works
              </h2>
              <p className="mt-3 text-ink-mid">
                Six steps. Ten minutes. Buyers who actually read the listing.
                <span className="ml-1 text-ink-light">
                  Revolutionary, we know.
                </span>
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="relative overflow-hidden rounded-2xl border border-crease-light bg-paper-cream p-6"
                >
                  {/* Watermark step number */}
                  <span className="absolute -right-2 -top-4 font-serif text-[6rem] font-bold leading-none text-ink-black/[0.03]">
                    {step.number}
                  </span>
                  <div className="relative">
                    <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {step.number}
                    </span>
                    <h3 className="mb-1 font-heading text-base font-semibold text-ink-black">
                      {step.title}
                    </h3>
                    <p className="mb-3 text-xs text-ink-light">{step.time}</p>
                    <p className="text-sm leading-relaxed text-ink-mid">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 3 — STATS BAR (dark)
            ══════════════════════════════════════════════ */}
        <section className="bg-paddock px-4 py-16 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-center">
              <h2 className="font-serif text-3xl text-white md:text-4xl">
                The ManeExchange difference
              </h2>
              <p className="mt-3 text-white/50">
                Built for serious equestrian transactions
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {differentiators.map((d) => (
                <div key={d.label} className="text-center">
                  <p className="font-serif text-4xl font-bold text-white">
                    {d.value}
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/80">
                    {d.label}
                  </p>
                  <p className="text-xs text-white/40">{d.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 4 — WHY SELLERS CHOOSE (with vs Facebook)
            ══════════════════════════════════════════════ */}
        <section className="bg-paper-cream px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <h2 className="font-serif text-3xl text-ink-black md:text-4xl">
                Why sellers choose ManeExchange
              </h2>
              <p className="mt-3 max-w-2xl text-ink-mid">
                We&apos;re not just another listing site. We built the tools
                that actually get horses sold — faster, for fair prices, to
                qualified buyers.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {valueProps.map((prop) => {
                const Icon = prop.icon;
                return (
                  <div
                    key={prop.title}
                    className="rounded-2xl border border-crease-light bg-paper-white p-6 shadow-flat"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-2 font-heading text-base font-semibold text-ink-black">
                      {prop.title}
                    </h3>
                    <p className="mb-4 text-sm text-ink-mid">
                      {prop.description}
                    </p>
                    <div className="rounded-lg bg-paper-cream px-4 py-3">
                      <p className="text-xs text-ink-light">
                        <span className="font-medium">vs</span> {prop.vs}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline CTA */}
            <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-crease-light bg-paper-white p-8 text-center shadow-flat">
              <h3 className="mb-2 font-heading text-lg font-semibold text-ink-black">
                Free to start. Upgrade when you&apos;re ready.
              </h3>
              <p className="mb-6 text-sm text-ink-mid">
                List your first horse at no cost. See plans and pricing after
                you sign up.
              </p>
              <Button asChild>
                <Link href="/signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-3 text-xs text-ink-light">
                No credit card required
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 5 — FAQ
            ══════════════════════════════════════════════ */}
        <FaqAccordion heading="Questions? Answers." items={faqs} />

        {/* ══════════════════════════════════════════════
            SECTION 6 — BOTTOM CTA
            ══════════════════════════════════════════════ */}
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
