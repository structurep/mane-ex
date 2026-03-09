import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export interface IconDetailItem {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  bold?: boolean;
}

interface IconDetailListProps {
  items: IconDetailItem[];
  className?: string;
}

/**
 * Vertical list of icon + label + value rows with dividers.
 * Used for structured attribute display (horse details, seller info, pricing).
 */
export function IconDetailList({ items, className }: IconDetailListProps) {
  return (
    <div className={cn("divide-y divide-crease-light", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-4 py-3">
          <span className="h-4 w-4 shrink-0 text-ink-faint">{item.icon}</span>
          <span className="w-28 shrink-0 text-sm text-ink-light">
            {item.label}
          </span>
          <span
            className={cn(
              "text-sm",
              item.bold
                ? "font-semibold text-ink-black"
                : "font-medium text-ink-dark"
            )}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
