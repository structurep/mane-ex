"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectMenuProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  /** "pill" for inline filter bar, "field" for form fields */
  variant?: "pill" | "field";
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Styled native select with Keeneland tokens.
 * "pill" variant: rounded-full for filter bars.
 * "field" variant: rounded-lg for form contexts.
 */
export function SelectMenu({
  label,
  value,
  onChange,
  children,
  variant = "pill",
  icon,
  className,
}: SelectMenuProps) {
  const isPill = variant === "pill";

  return (
    <div className={cn("relative", className)}>
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "cursor-pointer appearance-none border pr-8 text-ink-dark transition-colors focus:outline-none",
          isPill
            ? "h-9 rounded-full border-crease-light bg-paper-white py-1.5 pl-3.5 text-[13px] font-medium hover:border-ink-light focus:border-ink-black"
            : "h-10 w-full rounded-lg border-crease-light bg-paper-cream px-3 text-sm focus:border-navy focus:ring-1 focus:ring-navy/20",
          icon && (isPill ? "pl-9" : "pl-9")
        )}
      >
        <option value="">{label}</option>
        {children}
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint",
          isPill ? "right-2.5" : "right-2.5"
        )}
      />
    </div>
  );
}
