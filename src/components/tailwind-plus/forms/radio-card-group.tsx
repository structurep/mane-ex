"use client";

import { cn } from "@/lib/utils";

export interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface RadioCardGroupProps {
  options: RadioCardOption[];
  value: string;
  onChange: (value: string) => void;
  /** Number of columns. Defaults to options.length (capped at 4) */
  columns?: 2 | 3 | 4;
  className?: string;
}

const colClasses = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
} as const;

/**
 * Grid of selectable cards with radio-button semantics.
 * Used for gender filters, onboarding role selection, region pickers.
 */
export function RadioCardGroup({
  options,
  value,
  onChange,
  columns,
  className,
}: RadioCardGroupProps) {
  const cols = columns ?? (Math.min(options.length, 4) as 2 | 3 | 4);

  return (
    <div
      className={cn("grid gap-2", colClasses[cols], className)}
      role="radiogroup"
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(selected ? "" : opt.value)}
            className={cn(
              "rounded-lg border px-3 py-3 text-center text-sm font-medium transition-all",
              selected
                ? "border-navy bg-navy/5 text-navy ring-1 ring-navy/20"
                : "border-crease-light bg-paper-cream text-ink-mid hover:border-ink-light hover:text-ink-dark"
            )}
          >
            {opt.icon && (
              <div className="mb-1.5 flex justify-center">{opt.icon}</div>
            )}
            {opt.label}
            {opt.description && (
              <p className="mt-1 text-xs font-normal text-ink-faint">
                {opt.description}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
