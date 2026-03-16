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
  match: "bg-gold text-warmwhite",
  horseproof: "bg-bronze text-warmwhite",
  demand: "bg-bronze text-warmwhite",
  hot: "bg-bronze text-warmwhite",
  verified: "bg-ink text-warmwhite",
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
    match: "text-gold",
    horseproof: "text-bronze",
    demand: "text-bronze",
    hot: "text-bronze",
    verified: "text-ink",
  };

  return (
    <span className={cn("badge-seal", sealStyles[variant], className)}>
      {children}
    </span>
  );
}
