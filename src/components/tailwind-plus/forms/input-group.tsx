"use client";

import { cn } from "@/lib/utils";

interface InputGroupProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  /** Prefix text or icon (e.g. "$") */
  prefix?: React.ReactNode;
  /** Suffix text or icon (e.g. "hh") */
  suffix?: React.ReactNode;
  /** "pill" for inline filter bar, "field" for form fields */
  variant?: "pill" | "field";
}

/**
 * Input with optional prefix/suffix adornments.
 * Pill variant for compact filter bars, field variant for forms.
 */
export function InputGroup({
  prefix,
  suffix,
  variant = "field",
  className,
  ...props
}: InputGroupProps) {
  const isPill = variant === "pill";

  return (
    <div className="relative">
      {prefix && (
        <span
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint",
            isPill ? "text-xs" : "text-xs"
          )}
        >
          {prefix}
        </span>
      )}
      <input
        {...props}
        className={cn(
          "border text-ink-dark transition-colors focus:outline-none",
          isPill
            ? "h-9 rounded-full border-crease-light bg-paper-white text-[13px] placeholder:text-ink-faint"
            : "h-10 w-full rounded-lg border-crease-light bg-paper-cream text-sm focus:border-navy focus:ring-1 focus:ring-navy/20",
          prefix ? (isPill ? "pl-7" : "pl-7") : isPill ? "pl-3" : "px-3",
          suffix ? "pr-10" : isPill ? "pr-3" : "pr-3",
          isPill && "w-[88px] text-center",
          className
        )}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint">
          {suffix}
        </span>
      )}
    </div>
  );
}
