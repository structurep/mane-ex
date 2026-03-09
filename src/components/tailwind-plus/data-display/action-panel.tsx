import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ActionPanelItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  accent?: string;
}

interface ActionPanelProps {
  items: ActionPanelItem[];
  /** Grid columns. Defaults to 4 on sm+, 2 on mobile */
  columns?: 2 | 3 | 4;
  className?: string;
}

const colClasses = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
} as const;

/**
 * Grid of quick-action link cards with icon + label.
 * Used on dashboard for navigation shortcuts.
 */
export function ActionPanel({
  items,
  columns = 4,
  className,
}: ActionPanelProps) {
  return (
    <div className={cn("grid gap-3", colClasses[columns], className)}>
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex items-center gap-3 rounded-lg bg-paper-cream px-4 py-3.5 shadow-flat transition-all hover:shadow-folded"
        >
          <span className={item.accent ?? "text-ink-mid"}>{item.icon}</span>
          <span className="text-sm font-medium text-ink-dark">
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
