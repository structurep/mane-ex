"use client";

import { useState } from "react";
import {
  UserCheck,
  Camera,
  Search,
  MessageCircle,
  FileCheck,
  Lock,
  CheckCircle2,
  Shield,
} from "lucide-react";

const sellerSteps = [
  {
    icon: UserCheck,
    title: "Create Your Profile",
    description:
      "Verify your identity and set up your farm page. Stripe handles KYC — we never store your sensitive documents.",
  },
  {
    icon: Camera,
    title: "List Your Horse",
    description:
      "Our 7-step wizard walks you through everything: details, vet records, show history, media, and pricing. State-specific disclosures are built in.",
  },
  {
    icon: MessageCircle,
    title: "Connect with Buyers",
    description:
      "Receive inquiries, schedule trials, and negotiate offers — all within the platform. Your response time contributes to your Mane Score.",
  },
  {
    icon: Lock,
    title: "Accept & Escrow",
    description:
      "When you accept an offer, the buyer's payment is held in ManeVault escrow. Ship the horse knowing the funds are secured.",
  },
  {
    icon: CheckCircle2,
    title: "Get Paid",
    description:
      "After the buyer confirms delivery and the dispute window closes, funds transfer to your bank account. Simple.",
  },
];

const buyerSteps = [
  {
    icon: Search,
    title: "Browse & Discover",
    description:
      "Search verified listings by discipline, price, location, and more. Save horses to your Dream Barn. Get alerts on price drops.",
  },
  {
    icon: FileCheck,
    title: "Review Documentation",
    description:
      "Every listing has a completeness score. Review vet records, show history, and ownership documentation — all in one place.",
  },
  {
    icon: MessageCircle,
    title: "Connect & Visit",
    description:
      "Message sellers directly. Book trial rides. Plan multi-barn tours. Share listings with your trainer.",
  },
  {
    icon: Lock,
    title: "Make an Offer",
    description:
      "When you're ready, make an offer. Your payment is held in ManeVault escrow until you receive and inspect the horse.",
  },
  {
    icon: Shield,
    title: "Buy with Confidence",
    description:
      "You have 5 days to inspect the horse after delivery. ManeGuard covers non-delivery, misrepresentation, and undisclosed health issues.",
  },
];

export function FlowToggle() {
  const [role, setRole] = useState<"buyer" | "seller">("buyer");

  const steps = role === "buyer" ? buyerSteps : sellerSteps;
  const overlineText =
    role === "buyer" ? "BUYING A HORSE" : "SELLING A HORSE";
  const heading =
    role === "buyer"
      ? "Buy with full transparency."
      : "A structured sale process.";

  return (
    <div>
      {/* Toggle */}
      <div className="mx-auto mb-12 flex max-w-xs gap-1 rounded-lg bg-paper-warm p-1">
        <button
          onClick={() => setRole("buyer")}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
            role === "buyer"
              ? "bg-paper-white text-ink-black shadow-flat"
              : "text-ink-mid hover:text-ink-black"
          }`}
        >
          I&apos;m Buying
        </button>
        <button
          onClick={() => setRole("seller")}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
            role === "seller"
              ? "bg-paper-white text-ink-black shadow-flat"
              : "text-ink-mid hover:text-ink-black"
          }`}
        >
          I&apos;m Selling
        </button>
      </div>

      {/* Section heading */}
      <p
        className={`overline mb-3 ${role === "buyer" ? "text-blue" : "text-primary"}`}
      >
        {overlineText}
      </p>
      <h2 className="mb-12 text-3xl text-ink-black md:text-4xl">{heading}</h2>

      {/* Steps */}
      <div className="stagger-children space-y-6">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="animate-fade-up flex gap-6 rounded-lg bg-paper-white p-6 shadow-flat transition-elevation hover:shadow-folded"
          >
            <div className="flex shrink-0 flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  role === "buyer" ? "bg-blue-light" : "bg-forest-light"
                }`}
              >
                <step.icon
                  className={`h-5 w-5 ${
                    role === "buyer" ? "text-blue" : "text-primary"
                  }`}
                />
              </div>
              {i < steps.length - 1 && (
                <div className="mt-2 h-full w-px bg-crease-light" />
              )}
            </div>
            <div>
              <p className="overline mb-1 text-ink-light">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mb-1 text-lg font-medium text-ink-black">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-mid">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
