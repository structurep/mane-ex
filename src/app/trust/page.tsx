import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Lock,
  FileCheck,
  UserCheck,
  FileText,
  CheckCircle2,
  ArrowRight,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Trust & Safety",
  description:
    "Learn how ManeExchange protects buyers and sellers with escrow payments, verified listings, seller verification, and UCC-compliant contracts.",
};

const pillars = [
  {
    icon: Lock,
    iconColor: "text-gold",
    iconBg: "bg-gold/10",
    title: "Secure Payments",
    description:
      "ManeVault escrow holds buyer funds until the horse is delivered and inspected. ACH transfers minimize fees. No more wiring money to strangers.",
  },
  {
    icon: FileCheck,
    iconColor: "text-blue",
    iconBg: "bg-blue/10",
    title: "Verified Listings",
    description:
      "Every listing has a completeness score. Vet records, registration papers, and show history \u2014 documented and organized in one place.",
  },
  {
    icon: UserCheck,
    iconColor: "text-navy",
    iconBg: "bg-navy/10",
    title: "Seller Verification",
    description:
      "Verified sellers complete identity verification through Stripe. Look for the verified badge when browsing listings.",
  },
  {
    icon: FileText,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    title: "Secure Contracts",
    description:
      "UCC-compliant Bill of Sale generated for every transaction. State-specific disclosures built into the listing process.",
  },
];

const buyerTips = [
  "Always use ManeVault escrow \u2014 never wire money directly to a seller",
  "Review the listing\u2019s completeness score before making an offer",
  "Request a pre-purchase exam (PPE) from your own veterinarian",
  "Book a trial ride through the platform to create a documented record",
  "Check the seller\u2019s Mane Score, reviews, and response time",
];

const sellerTips = [
  "Complete your seller verification to earn the verified badge",
  "Upload thorough documentation \u2014 vet records, registration, show history",
  "Use ManeVault escrow to guarantee payment before shipping",
  "Respond to inquiries promptly to improve your Mane Score",
  "Document all communications through the platform\u2019s messaging system",
];

export default function TrustPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="with-grain bg-gradient-hero px-4 pt-24 pb-16 md:px-8 md:pt-36 md:pb-20">
          <div className="mx-auto max-w-[1200px] text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[var(--radius-card)] bg-navy/10">
              <Shield className="h-8 w-8 text-navy" />
            </div>
            <p className="overline mb-3 text-navy">TRUST & SAFETY</p>
            <h1 className="mb-4 text-4xl tracking-tight text-ink-black md:text-5xl">
              Your safety is our foundation.
            </h1>
            <p className="text-lead mx-auto max-w-2xl text-ink-mid">
              Every feature on ManeExchange is designed to protect both buyers
              and sellers.
            </p>
          </div>
        </section>

        {/* Four Safety Pillars */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-[1200px]">
            <div className="stagger-children grid gap-6 md:grid-cols-2">
              {pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="animate-fade-up rounded-lg border-0 bg-paper-white p-6 shadow-flat transition-elevation hover-lift hover:shadow-lifted"
                >
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${pillar.iconBg}`}
                  >
                    <pillar.icon
                      className={`h-5 w-5 ${pillar.iconColor}`}
                    />
                  </div>
                  <h3 className="mb-2 font-medium text-ink-black">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-ink-mid">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Buyers */}
        <section className="bg-paper-white section-premium">
          <div className="mx-auto max-w-[1200px]">
            <p className="overline mb-3 text-blue">FOR BUYERS</p>
            <h2 className="mb-8 text-3xl tracking-tight text-ink-black">
              Buy with confidence.
            </h2>
            <div className="space-y-4">
              {buyerTips.map((tip) => (
                <div key={tip} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                  <p className="text-ink-mid">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Sellers */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-[1200px]">
            <p className="overline mb-3 text-gold">FOR SELLERS</p>
            <h2 className="mb-8 text-3xl tracking-tight text-ink-black">
              Sell with protection.
            </h2>
            <div className="space-y-4">
              {sellerTips.map((tip) => (
                <div key={tip} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                  <p className="text-ink-mid">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How ManeVault Escrow Works */}
        <section className="bg-paper-white section-premium">
          <div className="mx-auto max-w-[800px]">
            <div className="mb-8 text-center">
              <p className="overline mb-3 text-navy">MANEVAULT ESCROW</p>
              <h2 className="text-3xl tracking-tight text-ink-black">
                How your money is protected.
              </h2>
              <p className="text-lead mx-auto mt-3 max-w-2xl text-ink-mid">
                ManeVault holds buyer funds in escrow through Stripe until the
                horse is delivered and the buyer confirms receipt. Neither party
                is exposed.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Buyer deposits funds",
                  desc: "When an offer is accepted, the buyer's payment is held securely in ManeVault escrow — not sent to the seller.",
                },
                {
                  step: "2",
                  title: "Horse is delivered and inspected",
                  desc: "The seller arranges delivery. The buyer has an inspection window to confirm the horse matches the listing.",
                },
                {
                  step: "3",
                  title: "Funds released to seller",
                  desc: "Once the buyer confirms receipt, ManeVault releases payment to the seller. If there's a dispute, our team mediates.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex gap-4 rounded-lg border border-crease-light bg-paper-cream p-5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-heading text-sm font-semibold text-ink-black">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-ink-mid">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-ink-light">
              ManeVault escrow fee: 5% standard, 4% for Elite members. No sale, no fee.
            </p>
          </div>
        </section>

        {/* Report a Problem */}
        <section className="bg-paddock section-premium">
          <div className="mx-auto max-w-[1200px] text-center">
            <h2 className="mb-4 text-3xl tracking-tight text-paper-white">
              See something wrong?
            </h2>
            <p className="text-lead mx-auto mb-8 max-w-2xl text-ink-light">
              If you encounter fraud, misrepresentation, or any safety concern,
              report it immediately. Our team reviews every report within 24-48
              hours.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="btn-inverse" asChild>
                <Link href="/contact">
                  Report a Problem
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-paper-white" asChild>
                <Link href="/contact">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
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
