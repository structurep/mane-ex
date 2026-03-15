import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationTier } from "@/lib/listings/verification-tier";

const tierConfig: Record<Exclude<VerificationTier, "none">, { bg: string; text: string; label: string }> = {
  bronze: {
    bg: "bg-amber-700/10",
    text: "text-amber-700",
    label: "HorseProof Bronze",
  },
  silver: {
    bg: "bg-slate-400/10",
    text: "text-slate-500",
    label: "HorseProof Silver",
  },
  gold: {
    bg: "bg-gold/10",
    text: "text-gold",
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
 * HorseProof verification badge.
 * Returns null for "none" tier — unverified listings show nothing.
 */
export function VerificationBadge({ tier, compact = false, className }: VerificationBadgeProps) {
  if (tier === "none") return null;

  const config = tierConfig[tier];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        compact
          ? "px-2 py-0.5 text-[11px]"
          : "px-2.5 py-1 text-xs",
        config.bg,
        config.text,
        className
      )}
    >
      <ShieldCheck className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {config.label}
    </div>
  );
}
