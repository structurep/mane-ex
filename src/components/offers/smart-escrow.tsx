"use client";

import { Check, Clock, Lock } from "lucide-react";

type MilestoneStatus = "locked" | "active" | "completed" | "disputed" | "skipped";

/**
 * Compact milestone progress indicator for escrow transactions.
 * Accepts real milestones from the escrow record, or shows default
 * placeholder milestones when none are provided.
 */
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
            className={`flex h-6 items-center gap-1 rounded-[var(--radius-card)] px-2 text-[10px] font-medium ${
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
