import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FlowToggle } from "./flow-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how ManeExchange protects buyers and sellers through verified listings, escrow payments, and transparent scoring.",
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ── Hero ── */}
        <section className="with-grain bg-gradient-hero px-4 pt-24 pb-20 md:px-8 md:pt-36 md:pb-28">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-4 text-red">HOW IT WORKS</p>
            <h1 className="mb-6 text-4xl tracking-tight text-ink-black md:text-6xl">
              Structured transactions.
              <br />
              <span className="text-ink-mid">Zero ambiguity.</span>
            </h1>
            <p className="text-lead mx-auto max-w-2xl text-ink-mid">
              Every step of a horse sale — from listing to payout — is
              documented, protected, and transparent.
            </p>
          </div>
        </section>

        {/* ── Buyer / Seller Flow ── */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-[1200px]">
            <FlowToggle />
          </div>
        </section>

        {/* ── Escrow Detail ── */}
        <section className="bg-ink-black section-premium">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <p className="overline mb-4 text-gold">MANEVAULT ESCROW</p>
                <h2 className="mb-6 text-3xl text-paper-white md:text-4xl">
                  Your money is protected
                  <br />
                  at every step.
                </h2>
                <p className="text-lead text-ink-light">
                  ManeVault holds funds securely until both parties are
                  satisfied. No more wiring $50,000 to a stranger.
                </p>
              </div>
              <div className="stagger-children space-y-4">
                {[
                  { step: "1", label: "Buyer pays into ManeVault escrow" },
                  { step: "2", label: "Funds held until horse ships" },
                  { step: "3", label: "Buyer inspects (5-day window)" },
                  { step: "4", label: "Buyer confirms or opens dispute" },
                  { step: "5", label: "14-day dispute window" },
                  { step: "6", label: "Funds released to seller" },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="animate-fade-up flex items-center gap-4 rounded-lg bg-ink-dark/60 p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20 font-serif text-sm font-bold text-gold">
                      {item.step}
                    </span>
                    <span className="text-sm text-paper-cream">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="with-grain bg-paper-white section-premium">
          <div className="mx-auto max-w-[1200px] text-center">
            <h2 className="mb-4 text-3xl text-ink-black md:text-4xl">
              Ready to get started?
            </h2>
            <p className="text-lead mx-auto mb-8 max-w-xl text-ink-mid">
              Join the marketplace built for equestrians who take transactions
              seriously.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Create Your Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/browse">Browse Horses</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
