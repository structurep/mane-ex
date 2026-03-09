import { cn } from "@/lib/utils";

type BadgeVariant =
  | "gray"
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "oxblood"
  | "forest"
  | "gold";

const variantStyles: Record<BadgeVariant, string> = {
  gray: "bg-ink-black/5 text-ink-mid",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-800",
  green: "bg-forest/10 text-forest",
  blue: "bg-blue-100 text-blue-700",
  indigo: "bg-indigo-100 text-indigo-700",
  purple: "bg-purple-100 text-purple-700",
  pink: "bg-pink-100 text-pink-700",
  oxblood: "bg-oxblood/10 text-oxblood",
  forest: "bg-forest/10 text-forest",
  gold: "bg-gold/10 text-gold",
};

const dotStyles: Record<BadgeVariant, string> = {
  gray: "fill-ink-faint",
  red: "fill-red-500",
  yellow: "fill-yellow-500",
  green: "fill-forest",
  blue: "fill-blue-500",
  indigo: "fill-indigo-500",
  purple: "fill-purple-500",
  pink: "fill-pink-500",
  oxblood: "fill-oxblood",
  forest: "fill-forest",
  gold: "fill-gold",
};

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
  onRemove?: () => void;
}

export function StatusBadge({
  label,
  variant = "gray",
  dot = true,
  className,
  onRemove,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium",
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
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="-mr-0.5 ml-0.5 inline-flex size-4 items-center justify-center rounded-full hover:bg-ink-black/10"
        >
          <span className="sr-only">Remove {label}</span>
          <svg viewBox="0 0 14 14" className="size-3 stroke-current stroke-[1.5]">
            <path d="M4 4l6 6m0-6l-6 6" />
          </svg>
        </button>
      )}
    </span>
  );
}
