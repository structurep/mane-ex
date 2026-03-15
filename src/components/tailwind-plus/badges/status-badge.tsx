import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "gray"
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "saddle"
  | "forest"
  | "gold";

const variantStyles: Record<BadgeVariant, string> = {
  gray: "border-[var(--ink-faint)]/30 text-[var(--ink-mid)]",
  red: "border-red-400/30 text-red-700",
  yellow: "border-yellow-400/30 text-yellow-800",
  green: "border-[var(--accent-green)]/30 text-[var(--accent-green)]",
  blue: "border-[var(--accent-blue)]/30 text-[var(--accent-blue)]",
  indigo: "border-indigo-400/30 text-indigo-700",
  purple: "border-purple-400/30 text-purple-700",
  pink: "border-pink-400/30 text-pink-700",
  saddle: "border-[var(--accent-saddle)]/30 text-[var(--accent-saddle)]",
  forest: "border-[var(--accent-green)]/30 text-[var(--accent-green)]",
  gold: "border-[var(--accent-gold)]/30 text-[var(--accent-gold)]",
};

const dotStyles: Record<BadgeVariant, string> = {
  gray: "fill-[var(--ink-faint)]",
  red: "fill-red-500",
  yellow: "fill-yellow-500",
  green: "fill-[var(--accent-green)]",
  blue: "fill-[var(--accent-blue)]",
  indigo: "fill-indigo-500",
  purple: "fill-purple-500",
  pink: "fill-pink-500",
  saddle: "fill-[var(--accent-saddle)]",
  forest: "fill-[var(--accent-green)]",
  gold: "fill-[var(--accent-gold)]",
};

interface StatusBadgeProps {
  label?: string;
  children?: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
  onRemove?: () => void;
}

/**
 * Status badge — Origami seal style with thin border, no background fill.
 */
export function StatusBadge({
  label,
  children,
  variant = "gray",
  dot = true,
  className,
  onRemove,
}: StatusBadgeProps) {
  const content = children ?? label;
  return (
    <span
      className={cn(
        "badge-seal",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <svg
          viewBox="0 0 6 6"
          aria-hidden="true"
          className={cn("size-1.5", dotStyles[variant])}
        >
          <circle r={3} cx={3} cy={3} />
        </svg>
      )}
      {content}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="-mr-0.5 ml-0.5 inline-flex size-4 items-center justify-center rounded-[var(--radius-paper)] hover:bg-[var(--ink-black)]/10"
        >
          <span className="sr-only">Remove {label || ""}</span>
          <svg viewBox="0 0 14 14" className="size-3 stroke-current stroke-[1.5]">
            <path d="M4 4l6 6m0-6l-6 6" />
          </svg>
        </button>
      )}
    </span>
  );
}
