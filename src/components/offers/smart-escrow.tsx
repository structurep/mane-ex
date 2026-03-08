"use client";

import { useState } from "react";
import {
  Shield,
  Check,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  FileCheck,
  Stethoscope,
  Eye,
  Truck,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Info,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ─── Types ─── */

type MilestoneStatus = "locked" | "active" | "completed" | "disputed" | "skipped";

type EscrowMilestone = {
  id: string;
  order: number;
  name: string;
  description: string;
  percentRelease: number; // % of total released at this milestone
  status: MilestoneStatus;
  completedAt?: string;
  dueBy?: string;
  conditions: string[];
  requiresApproval: "buyer" | "seller" | "both" | "auto";
};

type EscrowSummary = {
  totalAmount: number;
  releasedAmount: number;
  heldAmount: number;
  milestones: EscrowMilestone[];
  buyerProtection: string[];
  sellerProtection: string[];
};

/* ─── Sample Data ─── */

const SAMPLE_ESCROW: EscrowSummary = {
  totalAmount: 6500000, // $65,000 in cents
  releasedAmount: 1950000, // $19,500
  heldAmount: 4550000, // $45,500
  milestones: [
    {
      id: "m1",
      order: 1,
      name: "Offer Accepted",
      description: "Buyer's funds are deposited into ManeVault escrow.",
      percentRelease: 0,
      status: "completed",
      completedAt: "Feb 22, 2026",
      conditions: ["Full payment deposited", "Both parties confirm terms"],
      requiresApproval: "auto",
    },
    {
      id: "m2",
      order: 2,
      name: "Pre-Purchase Exam",
      description: "Independent veterinary examination by buyer's chosen vet.",
      percentRelease: 0,
      status: "completed",
      completedAt: "Feb 25, 2026",
      conditions: [
        "PPE scheduled within 7 days of deposit",
        "Buyer selects veterinarian",
        "Results uploaded to Document Vault",
        "Buyer approves or triggers dispute",
      ],
      requiresApproval: "buyer",
    },
    {
      id: "m3",
      order: 3,
      name: "Trial Period",
      description: "5-day on-site trial at buyer's facility or agreed location.",
      percentRelease: 30,
      status: "active",
      dueBy: "Mar 5, 2026",
      conditions: [
        "Horse delivered to trial location",
        "5-day minimum trial period",
        "Buyer confirms horse is as represented",
        "30% released to seller on approval",
      ],
      requiresApproval: "buyer",
    },
    {
      id: "m4",
      order: 4,
      name: "Final Transfer",
      description: "Ownership documents transferred, remaining funds released.",
      percentRelease: 70,
      status: "locked",
      conditions: [
        "Bill of Sale signed by both parties",
        "Registration transfer initiated",
        "Coggins and health certificate verified",
        "Insurance proof (if required)",
        "70% released to seller",
      ],
      requiresApproval: "both",
    },
  ],
  buyerProtection: [
    "Full refund if PPE reveals undisclosed issues",
    "Return option during 5-day trial",
    "7-day dispute window after final transfer",
    "Mediation available for all milestone disputes",
  ],
  sellerProtection: [
    "Funds secured before horse leaves property",
    "30% early release after trial approval",
    "Timeline enforcement — buyer must act within deadlines",
    "Protection against false dispute claims",
  ],
};

/* ─── Milestone Card ─── */

function MilestoneCard({
  milestone,
  totalAmount,
  isLast,
}: {
  milestone: EscrowMilestone;
  totalAmount: number;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(milestone.status === "active");

  const statusIcons: Record<MilestoneStatus, React.ReactNode> = {
    completed: <Check className="h-4 w-4 text-white" />,
    active: <Clock className="h-4 w-4 text-white" />,
    locked: <Lock className="h-4 w-4 text-ink-light" />,
    disputed: <AlertTriangle className="h-4 w-4 text-white" />,
    skipped: <ArrowRight className="h-4 w-4 text-ink-light" />,
  };

  const statusColors: Record<MilestoneStatus, string> = {
    completed: "bg-forest",
    active: "bg-gold",
    locked: "bg-paper-warm",
    disputed: "bg-primary",
    skipped: "bg-paper-warm",
  };

  const statusLabels: Record<MilestoneStatus, string> = {
    completed: "Complete",
    active: "In Progress",
    locked: "Upcoming",
    disputed: "Disputed",
    skipped: "Skipped",
  };

  const releaseAmount = Math.round(
    (milestone.percentRelease / 100) * totalAmount
  );

  const milestoneIcons: Record<string, React.ReactNode> = {
    "Offer Accepted": <DollarSign className="h-4 w-4" />,
    "Pre-Purchase Exam": <Stethoscope className="h-4 w-4" />,
    "Trial Period": <Eye className="h-4 w-4" />,
    "Final Transfer": <FileCheck className="h-4 w-4" />,
    Shipping: <Truck className="h-4 w-4" />,
  };

  return (
    <div className="relative">
      {/* Timeline connector */}
      {!isLast && (
        <div
          className={`absolute left-5 top-10 h-full w-0.5 ${
            milestone.status === "completed" ? "bg-forest" : "bg-crease-light"
          }`}
        />
      )}

      <div className="flex gap-4">
        {/* Status indicator */}
        <div
          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            statusColors[milestone.status]
          } ${milestone.status === "active" ? "ring-4 ring-gold/20" : ""}`}
        >
          {statusIcons[milestone.status]}
        </div>

        {/* Content */}
        <div className="flex-1 pb-8">
          <button
            className="flex w-full items-start justify-between text-left"
            onClick={() => setExpanded(!expanded)}
          >
            <div>
              <div className="flex items-center gap-2">
                <h4
                  className={`text-sm font-medium ${
                    milestone.status === "locked"
                      ? "text-ink-light"
                      : "text-ink-black"
                  }`}
                >
                  {milestone.name}
                </h4>
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${
                    milestone.status === "completed"
                      ? "bg-forest/10 text-forest"
                      : milestone.status === "active"
                        ? "bg-gold/10 text-gold"
                        : milestone.status === "disputed"
                          ? "bg-primary/10 text-primary"
                          : "bg-paper-warm text-ink-light"
                  }`}
                >
                  {statusLabels[milestone.status]}
                </Badge>
              </div>
              <p
                className={`mt-0.5 text-xs ${
                  milestone.status === "locked"
                    ? "text-ink-faint"
                    : "text-ink-mid"
                }`}
              >
                {milestone.description}
              </p>
              {milestone.completedAt && (
                <p className="mt-0.5 text-[10px] text-ink-light">
                  Completed {milestone.completedAt}
                </p>
              )}
              {milestone.dueBy && milestone.status === "active" && (
                <p className="mt-0.5 text-[10px] text-gold">
                  Due by {milestone.dueBy}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {milestone.percentRelease > 0 && (
                <div className="text-right">
                  <p
                    className={`text-xs font-medium ${
                      milestone.status === "completed"
                        ? "text-forest"
                        : "text-ink-mid"
                    }`}
                  >
                    {milestone.status === "completed" ? (
                      <Unlock className="mr-1 inline h-3 w-3" />
                    ) : (
                      <Lock className="mr-1 inline h-3 w-3" />
                    )}
                    {milestone.percentRelease}%
                  </p>
                  <p className="text-[10px] text-ink-faint">
                    ${(releaseAmount / 100).toLocaleString()}
                  </p>
                </div>
              )}
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-ink-light" />
              ) : (
                <ChevronDown className="h-4 w-4 text-ink-light" />
              )}
            </div>
          </button>

          {/* Expanded conditions */}
          {expanded && (
            <div className="mt-3 rounded-md bg-paper-cream p-3">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-light">
                Conditions
              </p>
              <div className="space-y-1.5">
                {milestone.conditions.map((condition, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div
                      className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border ${
                        milestone.status === "completed"
                          ? "border-forest bg-forest"
                          : "border-crease-mid bg-paper-white"
                      }`}
                    >
                      {milestone.status === "completed" && (
                        <Check className="h-full w-full p-0.5 text-white" />
                      )}
                    </div>
                    <span
                      className={`text-xs ${
                        milestone.status === "completed"
                          ? "text-ink-mid line-through"
                          : "text-ink-dark"
                      }`}
                    >
                      {condition}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-2 text-[10px] text-ink-light">
                Requires approval from:{" "}
                <span className="font-medium">
                  {milestone.requiresApproval === "both"
                    ? "Both parties"
                    : milestone.requiresApproval === "auto"
                      ? "Automatic"
                      : milestone.requiresApproval.charAt(0).toUpperCase() +
                        milestone.requiresApproval.slice(1)}
                </span>
              </p>

              {/* Action buttons for active milestone */}
              {milestone.status === "active" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="flex-1 gap-1.5">
                    <Check className="h-3.5 w-3.5" />
                    Approve Milestone
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-primary"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Dispute
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Fund Distribution Visual ─── */

function FundDistribution({ escrow }: { escrow: EscrowSummary }) {
  const releasedPct =
    (escrow.releasedAmount / escrow.totalAmount) * 100;
  const heldPct = (escrow.heldAmount / escrow.totalAmount) * 100;

  return (
    <div className="rounded-lg border-0 bg-paper-white p-5 shadow-flat">
      <div className="mb-3 flex items-center gap-2">
        <Shield className="h-5 w-5 text-forest" />
        <h3 className="font-heading text-sm font-semibold text-ink-black">
          Fund Distribution
        </h3>
      </div>

      {/* Visual bar */}
      <div className="mb-3 flex h-6 overflow-hidden rounded-full">
        <div
          className="flex items-center justify-center bg-forest text-[10px] font-medium text-white"
          style={{ width: `${releasedPct}%` }}
        >
          {releasedPct > 15 && "Released"}
        </div>
        <div
          className="flex items-center justify-center bg-gold/30 text-[10px] font-medium text-gold"
          style={{ width: `${heldPct}%` }}
        >
          In Escrow
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="font-serif text-lg font-bold text-ink-black">
            ${(escrow.totalAmount / 100).toLocaleString()}
          </p>
          <p className="text-[10px] text-ink-light">Total</p>
        </div>
        <div className="text-center">
          <p className="font-serif text-lg font-bold text-forest">
            ${(escrow.releasedAmount / 100).toLocaleString()}
          </p>
          <p className="text-[10px] text-ink-light">Released</p>
        </div>
        <div className="text-center">
          <p className="font-serif text-lg font-bold text-gold">
            ${(escrow.heldAmount / 100).toLocaleString()}
          </p>
          <p className="text-[10px] text-ink-light">Held</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Protection Summary ─── */

function ProtectionSummary({
  buyerProtection,
  sellerProtection,
}: {
  buyerProtection: string[];
  sellerProtection: string[];
}) {
  const [view, setView] = useState<"buyer" | "seller">("buyer");

  return (
    <div className="rounded-lg border-0 bg-paper-white p-5 shadow-flat">
      <div className="mb-3 flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="font-heading text-sm font-semibold text-ink-black">
          Protection Guarantees
        </h3>
      </div>

      {/* Toggle */}
      <div className="mb-3 flex rounded-md bg-paper-warm p-0.5">
        <button
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            view === "buyer"
              ? "bg-paper-white text-ink-black shadow-flat"
              : "text-ink-mid"
          }`}
          onClick={() => setView("buyer")}
        >
          Buyer
        </button>
        <button
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            view === "seller"
              ? "bg-paper-white text-ink-black shadow-flat"
              : "text-ink-mid"
          }`}
          onClick={() => setView("seller")}
        >
          Seller
        </button>
      </div>

      <div className="space-y-2">
        {(view === "buyer" ? buyerProtection : sellerProtection).map(
          (item, i) => (
            <div key={i} className="flex items-start gap-2">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest" />
              <span className="text-xs text-ink-mid">{item}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ─── Main Export: Smart Escrow Dashboard ─── */

export function SmartEscrowDashboard() {
  return (
    <div className="space-y-6">
      {/* Milestone Timeline */}
      <div className="rounded-lg border-0 bg-paper-white p-6 shadow-flat">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-forest" />
            <h3 className="font-heading text-base font-semibold text-ink-black">
              Smart Escrow Milestones
            </h3>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <MessageCircle className="h-3.5 w-3.5" />
            Contact Support
          </Button>
        </div>

        <div>
          {SAMPLE_ESCROW.milestones.map((milestone, i) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              totalAmount={SAMPLE_ESCROW.totalAmount}
              isLast={i === SAMPLE_ESCROW.milestones.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Side panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FundDistribution escrow={SAMPLE_ESCROW} />
        <ProtectionSummary
          buyerProtection={SAMPLE_ESCROW.buyerProtection}
          sellerProtection={SAMPLE_ESCROW.sellerProtection}
        />
      </div>

      {/* Dispute mediation CTA */}
      <div className="rounded-lg bg-paper-warm p-5 text-center">
        <h3 className="font-heading text-base font-semibold text-ink-black">
          Need to resolve something?
        </h3>
        <p className="mt-1 text-sm text-ink-mid">
          ManeExchange offers professional mediation for milestone disputes.
          Our team includes equine attorneys and industry experts.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" className="gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" />
            Start Mediation
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-ink-mid">
            <Info className="h-3.5 w-3.5" />
            How Disputes Work
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Compact Milestone Preview (for offer detail page) ─── */

export function EscrowMilestonePreview({
  milestones,
}: {
  milestones?: { name: string; status: MilestoneStatus; percentRelease: number }[];
}) {
  const steps = milestones || [
    { name: "Deposit", status: "completed" as const, percentRelease: 0 },
    { name: "PPE", status: "completed" as const, percentRelease: 0 },
    { name: "Trial", status: "active" as const, percentRelease: 30 },
    { name: "Transfer", status: "locked" as const, percentRelease: 70 },
  ];

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1">
          <div
            className={`flex h-6 items-center gap-1 rounded-full px-2 text-[10px] font-medium ${
              step.status === "completed"
                ? "bg-forest/10 text-forest"
                : step.status === "active"
                  ? "bg-gold/10 text-gold"
                  : "bg-paper-warm text-ink-faint"
            }`}
          >
            {step.status === "completed" && <Check className="h-2.5 w-2.5" />}
            {step.status === "active" && <Clock className="h-2.5 w-2.5" />}
            {step.status === "locked" && <Lock className="h-2.5 w-2.5" />}
            {step.name}
            {step.percentRelease > 0 && ` (${step.percentRelease}%)`}
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-3 ${
                step.status === "completed" ? "bg-forest" : "bg-crease-light"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
