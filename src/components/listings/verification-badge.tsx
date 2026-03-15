import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationTier } from "@/lib/listings/verification-tier";

const tierConfig: Record<Exclude<VerificationTier, "none">, { border: string; text: string; label: string }> = {
  bronze: {
    border: "border-amber-700/40",
    text: "text-amber-700",
    label: "HorseProof Bronze",
  },
  silver: {
    border: "border-slate-400/40",
    text: "text-slate-500",
    label: "HorseProof Silver",
  },
  gold: {
    border: "border-[var(--accent-gold)]/40",
    text: "text-[var(--accent-gold)]",
    label: "HorseProof Gold",
  },
};

interface VerificationBadgeProps {
  tier: VerificationTier;
  /** Compact mode: icon + tier name only */
  compact?: boolean;
  className?: string;
}

/**
 * HorseProof verification badge — paper-seal style.
 * Returns null for "none" tier.
 */
export function VerificationBadge({ tier, compact = false, className }: VerificationBadgeProps) {
  if (tier === "none") return null;

  const config = tierConfig[tier];

  return (
    <div
      className={cn(
        "badge-seal",
        compact ? "text-[10px]" : "text-[11px]",
        config.border,
        config.text,
        className
      )}
    >
      <ShieldCheck className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {config.label}
    </div>
  );
}
