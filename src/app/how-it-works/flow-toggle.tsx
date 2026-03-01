"use client";

import { useState } from "react";
import {
  BarChart3,
  Search,
  Shield,
  CreditCard,
  Bookmark,
  Calendar,
  FileCheck,
  MessageCircle,
  TrendingUp,
  Users,
} from "lucide-react";

const buyerBenefits = [
  {
    icon: BarChart3,
    title: "Mane Score",
    description:
      "See exactly how thoroughly a seller has documented their horse. Higher score = more transparency.",
  },
  {
    icon: Search,
    title: "ISO Posts",
    description:
      "Describe your dream horse and let matching sellers come to you automatically.",
  },
  {
    icon: Shield,
    title: "ManeVault Protection",
    description:
      "Your funds are held securely until the horse arrives and passes your inspection.",
  },
  {
    icon: CreditCard,
    title: "Real Prices",
    description:
      "Every listing has a clear asking price. See price history and get drop alerts.",
  },
  {
    icon: Bookmark,
    title: "Save & Compare",
    description:
      "Build your Dream Barn, compare horses side-by-side on real criteria.",
  },
  {
    icon: Calendar,
    title: "Easy Scheduling",
    description:
      "Book trial rides and barn visits directly through the platform.",
  },
];

const sellerBenefits = [
  {
    icon: BarChart3,
    title: "Mane Score",
    description:
      "Build trust with buyers by documenting your horse thoroughly. Higher scores sell faster.",
  },
  {
    icon: FileCheck,
    title: "Posts Dashboard",
    description:
      "Manage all your listings, track views, inquiries, and performance from one place.",
  },
  {
    icon: Shield,
    title: "ManeVault",
    description:
      "Secure escrow payments. Ship knowing the funds are there. No more bounced checks.",
  },
  {
    icon: MessageCircle,
    title: "ISO Matching",
    description:
      "Get matched to buyers actively looking for horses like yours.",
  },
  {
    icon: TrendingUp,
    title: "Analytics",
    description:
      "See who's viewing your listings, where traffic comes from, and what converts.",
  },
  {
    icon: Users,
    title: "Qualified Leads",
    description:
      "Every inquiry includes the buyer's profile, experience level, and budget.",
  },
];

export function FlowToggle() {
  const [role, setRole] = useState<"buyer" | "seller">("buyer");

  const benefits = role === "buyer" ? buyerBenefits : sellerBenefits;
  const heading =
    role === "buyer" ? "Benefits for Buyers" : "Benefits for Sellers";
  const subtitle =
    role === "buyer"
      ? "Find your perfect horse faster with tools designed for serious buyers."
      : "Sell smarter with tools that attract qualified buyers and close deals faster.";

  return (
    <div>
      {/* Sticky path toggle */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <span className="text-sm text-ink-mid">Choose your path</span>
        <div className="flex gap-1 rounded-full bg-paddock p-1">
          <button
            onClick={() => setRole("buyer")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              role === "buyer"
                ? "bg-white text-paddock"
                : "text-white/70 hover:text-white"
            }`}
          >
            I&apos;m a Buyer
          </button>
          <button
            onClick={() => setRole("seller")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              role === "seller"
                ? "bg-white text-paddock"
                : "text-white/70 hover:text-white"
            }`}
          >
            I&apos;m a Seller
          </button>
        </div>
      </div>

      {/* Section heading */}
      <h2 className="mb-3 font-serif text-3xl text-ink-black md:text-4xl">
        {heading}
      </h2>
      <p className="mb-10 max-w-xl text-ink-mid">{subtitle}</p>

      {/* Benefits Grid — 2x3 */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className="rounded-2xl border border-crease-light bg-paper-white p-6 transition-elevation hover:shadow-folded"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 font-heading text-base font-semibold text-ink-black">
                {benefit.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-mid">
                {benefit.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
