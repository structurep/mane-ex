import { cn } from "@/lib/utils";

interface FormSectionProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}

/**
 * Labeled form section with uppercase label and optional hint.
 * Matches the filter sheet pattern used across the browse page.
 */
export function FormSection({
  label,
  children,
  hint,
  className,
}: FormSectionProps) {
  return (
    <section className={cn(className)}>
      <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {hint && (
        <p className="mt-1.5 text-[11px] text-ink-faint">{hint}</p>
      )}
    </section>
  );
}
