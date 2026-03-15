"use client";

import {
  MessageCircle,
  Eye,
  CreditCard,
  Stethoscope,
  Scale,
  Truck,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

type OfferStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "countered"
  | "expired"
  | "withdrawn"
  | "in_escrow";

type EscrowStatus =
  | "awaiting_payment"
  | "payment_processing"
  | "funds_held"
  | "delivery_confirmed"
  | "dispute_opened"
  | "funds_released"
  | "funds_refunded";

interface TransactionTimelineProps {
  offerStatus: OfferStatus;
  escrowStatus?: EscrowStatus | null;
  createdAt: string;
  respondedAt?: string | null;
  deliveryConfirmedAt?: string | null;
  autoReleaseAt?: string | null;
  disputeOpenedAt?: string | null;
  disputeReason?: string | null;
  shippingTracking?: string | null;
  expectedDeliveryDate?: string | null;
  isBuyer: boolean;
}

interface Stage {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "completed" | "active" | "upcoming" | "error";
  timestamp?: string | null;
  detail?: string;
}

function resolveStages(props: TransactionTimelineProps): Stage[] {
  const {
    offerStatus,
    escrowStatus,
    createdAt,
    respondedAt,
    deliveryConfirmedAt,
    autoReleaseAt,
    disputeOpenedAt,
    disputeReason,
    shippingTracking,
    expectedDeliveryDate,
    isBuyer,
  } = props;

  // Map combined state to a numeric progress level
  let progress = 0;
  if (offerStatus === "pending" || offerStatus === "countered") progress = 1;
  else if (offerStatus === "accepted") progress = 2;
  else if (offerStatus === "in_escrow") {
    if (!escrowStatus || escrowStatus === "awaiting_payment" || escrowStatus === "payment_processing") progress = 3;
    else if (escrowStatus === "funds_held") progress = 4;
    else if (escrowStatus === "delivery_confirmed") progress = 6;
    else if (escrowStatus === "funds_released") progress = 7;
    else if (escrowStatus === "dispute_opened") progress = -1; // special
    else if (escrowStatus === "funds_refunded") progress = -2; // special
  }

  // Terminal negative states
  if (offerStatus === "rejected" || offerStatus === "expired" || offerStatus === "withdrawn") {
    progress = -3;
  }

  function stageStatus(stageLevel: number): "completed" | "active" | "upcoming" {
    if (progress < 0) return stageLevel <= 1 ? "completed" : "upcoming";
    if (progress > stageLevel) return "completed";
    if (progress === stageLevel) return "active";
    return "upcoming";
  }

  const stages: Stage[] = [
    {
      key: "inquiry",
      label: "Inquiry & Offer",
      description: isBuyer
        ? "You submitted an offer on this listing."
        : "A buyer submitted an offer on your listing.",
      icon: MessageCircle,
      status: stageStatus(1),
      timestamp: createdAt,
    },
    {
      key: "evaluation",
      label: "Evaluation",
      description: isBuyer
        ? "Waiting for the seller to review your offer."
        : "Review the offer and respond — accept, counter, or decline.",
      icon: Eye,
      status: stageStatus(2),
      timestamp: respondedAt,
      detail:
        offerStatus === "countered"
          ? "Counter-offer sent"
          : offerStatus === "accepted"
            ? "Offer accepted"
            : undefined,
    },
    {
      key: "deposit",
      label: "Deposit & Payment",
      description: "Funds are transferred to ManeVault escrow for safekeeping.",
      icon: CreditCard,
      status: stageStatus(3),
      detail:
        escrowStatus === "payment_processing"
          ? "Payment processing..."
          : escrowStatus === "awaiting_payment"
            ? "Awaiting payment"
            : undefined,
    },
    {
      key: "ppe",
      label: "Pre-Purchase Exam",
      description:
        "Schedule a PPE with a licensed vet. Upload results and review findings.",
      icon: Stethoscope,
      status: stageStatus(4),
    },
    {
      key: "contingency",
      label: "Contingency Resolution",
      description:
        "Review PPE results. Proceed, renegotiate, or walk with deposit returned.",
      icon: Scale,
      status: stageStatus(5),
    },
    {
      key: "transport",
      label: "Transport & Delivery",
      description: shippingTracking
        ? `Tracking: ${shippingTracking}`
        : "Coordinate transport. Horse is in transit to buyer.",
      icon: Truck,
      status: stageStatus(6),
      detail: expectedDeliveryDate
        ? `ETA: ${new Date(expectedDeliveryDate).toLocaleDateString()}`
        : undefined,
      timestamp: deliveryConfirmedAt,
    },
    {
      key: "complete",
      label: "Delivery & Trial",
      description:
        "Confirm delivery condition. Optional trial period before final release.",
      icon: CheckCircle,
      status: stageStatus(7),
      timestamp: deliveryConfirmedAt,
      detail: autoReleaseAt
        ? `Auto-release: ${new Date(autoReleaseAt).toLocaleDateString()}`
        : undefined,
    },
  ];

  // Handle dispute state
  if (progress === -1) {
    // Mark everything up to current as completed, add dispute
    stages.forEach((s, i) => {
      if (i <= 3) s.status = "completed";
      else s.status = "upcoming";
    });
    stages.push({
      key: "dispute",
      label: "Dispute Opened",
      description: disputeReason
        ? `Reason: ${disputeReason.substring(0, 120)}`
        : "Funds held pending resolution.",
      icon: AlertTriangle,
      status: "error",
      timestamp: disputeOpenedAt,
    });
  }

  // Handle refund
  if (progress === -2) {
    stages.forEach((s, i) => {
      if (i <= 3) s.status = "completed";
      else s.status = "upcoming";
    });
    stages.push({
      key: "refunded",
      label: "Funds Refunded",
      description: "Transaction cancelled. Funds returned to buyer.",
      icon: XCircle,
      status: "error",
    });
  }

  // Handle rejected/expired/withdrawn
  if (progress === -3) {
    stages[0].status = "completed";
    stages[1].status = "error";
    stages[1].detail =
      offerStatus === "rejected"
        ? "Offer declined"
        : offerStatus === "expired"
          ? "Offer expired"
          : "Offer withdrawn";
    for (let i = 2; i < stages.length; i++) {
      stages[i].status = "upcoming";
    }
  }

  return stages;
}

const statusColors = {
  completed: {
    circle: "bg-forest text-white",
    line: "bg-forest",
    text: "text-ink-black",
  },
  active: {
    circle: "bg-primary text-white ring-4 ring-primary/20",
    line: "bg-crease-light",
    text: "text-ink-black",
  },
  upcoming: {
    circle: "bg-paper-warm text-ink-faint",
    line: "bg-crease-light",
    text: "text-ink-light",
  },
  error: {
    circle: "bg-red-600 text-white",
    line: "bg-red-200",
    text: "text-red-700",
  },
};

export function TransactionTimeline(props: TransactionTimelineProps) {
  const stages = resolveStages(props);

  return (
    <div className="rounded-[var(--radius-card)] border-0 bg-paper-cream p-6 shadow-flat">
      <h3 className="mb-6 font-heading text-base font-semibold text-ink-black">
        Transaction Progress
      </h3>
      <div className="relative">
        {stages.map((stage, i) => {
          const colors = statusColors[stage.status];
          const Icon = stage.icon;
          const isLast = i === stages.length - 1;

          return (
            <div key={stage.key} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Vertical line */}
              {!isLast && (
                <div
                  className={`absolute left-[17px] top-[36px] w-[2px] ${
                    stage.status === "completed"
                      ? statusColors.completed.line
                      : statusColors.upcoming.line
                  }`}
                  style={{ height: "calc(100% - 28px)" }}
                />
              )}

              {/* Circle icon */}
              <div
                className={`relative z-10 flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full transition-all ${colors.circle}`}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className={`text-sm font-semibold ${colors.text}`}
                  >
                    {stage.label}
                  </p>
                  {stage.timestamp && stage.status !== "upcoming" && (
                    <span className="shrink-0 text-xs text-ink-faint">
                      {new Date(stage.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-mid">
                  {stage.description}
                </p>
                {stage.detail && (
                  <span
                    className={`mt-1.5 inline-block rounded-[var(--radius-card)] px-2.5 py-0.5 text-xs font-medium ${
                      stage.status === "active"
                        ? "bg-primary/10 text-primary"
                        : stage.status === "error"
                          ? "bg-red-50 text-red-700"
                          : "bg-forest/10 text-forest"
                    }`}
                  >
                    {stage.detail}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
