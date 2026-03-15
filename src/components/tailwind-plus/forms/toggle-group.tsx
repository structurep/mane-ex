"use client";

import { cn } from "@/lib/utils";

export interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  /** Columns. Defaults to options.length */
  columns?: number;
  /** Visual style for selected items */
  selectedStyle?: "solid" | "outline";
  /** Optional function to control per-option color */
  optionClassName?: (value: string, selected: boolean) => string;
  className?: string;
}

/**
 * Row/grid of toggleable option buttons.
 * Used for BCS scale, sort options, Henneke scores.
 */
export function ToggleGroup({
  options,
  value,
  onChange,
  columns,
  selectedStyle = "outline",
  optionClassName,
  className,
}: ToggleGroupProps) {
  const gridCols = columns ?? options.length;

  return (
    <div
      className={cn("flex gap-1.5", className)}
      style={
        gridCols <= 9
          ? undefined
          : { display: "grid", gridTemplateColumns: `repeat(${gridCols}, 1fr)` }
      }
    >
      {options.map((opt) => {
        const selected = value === opt.value;

        const customClass = optionClassName?.(opt.value, selected);
        const defaultClass =
          selectedStyle === "solid"
            ? selected
              ? "bg-saddle text-paper-white shadow-sm"
              : "bg-paper-cream text-ink-light hover:bg-paper-warm hover:text-ink-mid"
            : selected
              ? "border-saddle bg-saddle/5 text-saddle ring-1 ring-saddle/20"
              : "border-crease-light bg-paper-cream text-ink-mid hover:border-ink-light";

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(selected ? "" : opt.value)}
            className={cn(
              "flex h-9 flex-1 items-center justify-center rounded-md text-[13px] font-medium transition-all",
              selectedStyle === "outline" && "border",
              customClass ?? defaultClass
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
