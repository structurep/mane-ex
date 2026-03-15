import { cn } from "@/lib/utils";

type PaperVariant = "flat" | "raised" | "folded";

interface PaperSurfaceProps {
  variant?: PaperVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<PaperVariant, string> = {
  flat: "paper-flat",
  raised: "paper-raised",
  folded: "paper-folded fold-corner",
};

/**
 * Paper surface primitive — the foundational container for the Origami design system.
 * Variants: flat (subtle), raised (stacked paper), folded (with diagonal corner crease).
 */
export function PaperSurface({
  variant = "flat",
  className,
  children,
}: PaperSurfaceProps) {
  return (
    <div className={cn(variantStyles[variant], className)}>
      {children}
    </div>
  );
}
