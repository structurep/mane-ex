import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/bottom-cta";
import { FlowToggle } from "./flow-toggle";

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
        {/* Hero */}
        <section className="bg-paper-white px-4 pt-20 pb-16 md:px-8 md:pt-24">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-3 text-red">HOW IT WORKS</p>
            <h1 className="mb-4 text-4xl font-bold text-ink-black md:text-5xl">
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

        {/* Buyer / Seller Flow */}
        <section className="bg-paper-white px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <FlowToggle />
          </div>
        </section>

        {/* Escrow Detail */}
        <section className="bg-ink-black px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <p className="overline mb-3 text-gold">MANEVAULT ESCROW</p>
                <h2 className="mb-4 text-3xl font-semibold text-paper-white">
                  Your money is protected
                  <br />
                  at every step.
                </h2>
                <p className="text-lead text-ink-light">
                  ManeVault holds funds securely until both parties are
                  satisfied. No more wiring $50,000 to a stranger.
                </p>
              </div>
              <div className="space-y-4">
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
                    className="flex items-center gap-4 rounded-md border border-crease-dark/30 p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold">
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

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
