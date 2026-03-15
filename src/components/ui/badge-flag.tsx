import { cn } from "@/lib/utils";

type BadgeFlagVariant = "match" | "horseproof" | "demand" | "hot" | "verified";
type BadgeFlagPosition = "left" | "right";

interface BadgeFlagProps {
  variant: BadgeFlagVariant;
  position?: BadgeFlagPosition;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeFlagVariant, string> = {
  match: "bg-[var(--accent-gold)] text-[var(--paper-surface)]",
  horseproof: "bg-[var(--accent-navy)] text-[var(--paper-surface)]",
  demand: "bg-[var(--accent-navy)] text-[var(--paper-surface)]",
  hot: "bg-[var(--accent-navy)] text-[var(--paper-surface)]",
  verified: "bg-[var(--ink-black)] text-[var(--paper-surface)]",
};

/**
 * Corner flag badge — clip-path triangular accent for card overlays.
 *
 * Variants: match (gold), horseproof (green), demand (red), hot (red), verified (black).
 * Position: left (default) or right.
 */
export function BadgeFlag({
  variant,
  position = "left",
  className,
  children,
}: BadgeFlagProps) {
  return (
    <span
      className={cn(
        position === "left" ? "badge-flag" : "badge-flag-right",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Seal badge — inline stamp-style badge with thin border.
 */
export function BadgeSeal({
  variant,
  className,
  children,
}: Omit<BadgeFlagProps, "position">) {
  const sealStyles: Record<BadgeFlagVariant, string> = {
    match: "text-[var(--accent-gold)]",
    horseproof: "text-[var(--accent-navy)]",
    demand: "text-[var(--accent-navy)]",
    hot: "text-[var(--accent-navy)]",
    verified: "text-[var(--ink-black)]",
  };

  return (
    <span className={cn("badge-seal", sealStyles[variant], className)}>
      {children}
    </span>
  );
}
