import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export interface DetailField {
  label: string;
  value: ReactNode;
  span?: 1 | 2;
}

interface DetailGridProps {
  title?: string;
  subtitle?: string;
  fields: DetailField[];
  className?: string;
}

export function DetailGrid({ title, subtitle, fields, className }: DetailGridProps) {
  return (
    <div className={className}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="font-serif text-lg font-semibold text-ink-dark">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 max-w-2xl text-sm text-ink-mid">{subtitle}</p>
          )}
        </div>
      )}
      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-crease-light bg-crease-light sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.label}
            className={cn(
              "bg-paper-white px-4 py-4",
              field.span === 2 && "sm:col-span-2"
            )}
          >
            <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">
              {field.label}
            </dt>
            <dd className="mt-1 text-sm text-ink-dark">{field.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
