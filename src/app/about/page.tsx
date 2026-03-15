import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { ArrowRight, Eye, Shield, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "ManeExchange was born from the same frustration every equestrian knows — the horse market deserves better.",
};

const values = [
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Every listing includes verified information, clear pricing, and honest representations. No hidden surprises, no guessing games.",
  },
  {
    icon: Shield,
    title: "Trust",
    description:
      "Secure escrow payments, verified sellers, and real reviews. Because when you\u2019re investing in a partner, you deserve peace of mind.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We\u2019re more than a marketplace \u2014 we\u2019re a community of riders, trainers, and horse lovers building something better together.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ══════════════════════════════════════════════
            SECTION 1 — HERO (photo + overlay)
            ══════════════════════════════════════════════ */}
        <section
          className="relative flex min-h-[60vh] items-center overflow-hidden bg-hero-dark"
          style={{ backgroundColor: "#1C1410" }}
        >
          <div className="absolute inset-0">
            <Image
              src="/placeholders/horses/hero-1.jpg"
              alt=""
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1C1410]/90 via-[#2E241D]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1410]/85 via-transparent to-transparent" />
          </div>

          <div className="relative px-4 py-24 md:px-8 md:py-32">
            <div className="mx-auto max-w-7xl">
              <div className="max-w-2xl">
                <p className="overline mb-4 text-gold">OUR STORY</p>
                <h1 className="mb-6 font-serif text-4xl text-white sm:text-5xl md:text-6xl">
                  We&apos;re riders too.
                </h1>
                <p className="max-w-lg text-lg text-white/70">
                  ManeExchange was born from the same frustration every
                  equestrian knows — the horse market deserves better than
                  Facebook groups and word of mouth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 2 — MISSION + STATS (2-col)
            ══════════════════════════════════════════════ */}
        <section className="bg-paper-white px-4 py-16 md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <h2 className="mb-6 font-serif text-3xl text-ink-black md:text-4xl">
                  Built for this community.
                </h2>
                <p className="mb-4 text-ink-mid">
                  We believe buying and selling horses should feel as good as
                  riding them. Every feature on ManeExchange exists because we
                  wished it existed when we were searching for our own horses.
                </p>
                <p className="text-ink-mid">
                  From verified health records to transparent pricing, we&apos;re
                  creating the marketplace the equestrian world has always
                  deserved — where trust comes standard, not as an afterthought.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-[var(--radius-card)] border border-crease-light bg-paper-cream p-5 text-center">
                  <Shield className="mx-auto mb-2 h-6 w-6 text-forest" />
                  <p className="font-heading text-sm font-semibold text-ink-black">Escrow-Protected</p>
                  <p className="mt-1 text-xs text-ink-mid">Every transaction secured by ManeVault</p>
                </div>
                <div className="rounded-[var(--radius-card)] border border-crease-light bg-paper-cream p-5 text-center">
                  <Eye className="mx-auto mb-2 h-6 w-6 text-gold" />
                  <p className="font-heading text-sm font-semibold text-ink-black">Verified Listings</p>
                  <p className="mt-1 text-xs text-ink-mid">Vet records, show history, and real pricing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 3 — VALUES (3-col)
            ══════════════════════════════════════════════ */}
        <section className="bg-paper-cream px-4 py-16 md:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-10 text-center font-serif text-3xl text-ink-black md:text-4xl">
              What we stand for.
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {values.map((v) => {
                const Icon = v.icon;
                return (
                  <div
                    key={v.title}
                    className="rounded-[var(--radius-card)] border border-crease-light bg-paper-white p-8"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-3 font-heading text-lg font-semibold text-ink-black">
                      {v.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-mid">
                      {v.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 4 — FINAL CTA
            ══════════════════════════════════════════════ */}
        <section className="bg-paper-white px-4 py-16 md:px-8">
          <div className="mx-auto max-w-[1200px] text-center">
            <h2 className="mb-4 font-serif text-3xl text-ink-black md:text-4xl">
              Your next chapter starts here.
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-ink-mid">
              The equestrian marketplace built on transparency, verified
              records, and escrow-protected transactions.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/browse">
                  Browse Horses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/sell">List Your Horse</Link>
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
