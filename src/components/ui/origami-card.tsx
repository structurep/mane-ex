import { cn } from "@/lib/utils";

interface OrigamiCardProps {
  /** Show fold corner accent */
  fold?: boolean;
  /** Enable hover elevation */
  hoverable?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Origami card primitive — stacked-paper card with optional fold corner and hover lift.
 * Used as the surface wrapper for listing cards, dashboard panels, and content blocks.
 */
export function OrigamiCard({
  fold = true,
  hoverable = true,
  className,
  children,
}: OrigamiCardProps) {
  return (
    <div
      className={cn(
        "paper-raised relative overflow-hidden",
        fold && "fold-corner",
        hoverable && "transition-elevation hover-lift",
        className
      )}
    >
      {children}
    </div>
  );
}
