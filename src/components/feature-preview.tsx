import { type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FeaturePreviewProps {
  icon: ReactNode;
  title: string;
  description: string;
  /** What will be available when this feature launches */
  capabilities?: string[];
  /** Link to a related feature that works today */
  actionLabel?: string;
  actionHref?: string;
}

/**
 * Standardized "coming soon" component for features that are planned
 * but not yet backed by real data or workflows.
 *
 * Use this instead of ad-hoc empty states for public-facing feature
 * preview pages. For dashboard empty states (no data yet but feature
 * is live), use EmptyState from tailwind-plus instead.
 */
export function FeaturePreview({
  icon,
  title,
  description,
  capabilities,
  actionLabel,
  actionHref,
}: FeaturePreviewProps) {
  return (
    <div className="rounded-lg border border-dashed border-crease-mid bg-paper-cream px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-paper-warm text-ink-faint">
        {icon}
      </div>
      <h3 className="font-serif text-xl font-semibold text-ink-dark">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-mid">
        {description}
      </p>

      {capabilities && capabilities.length > 0 && (
        <ul className="mx-auto mt-5 max-w-sm space-y-1.5 text-left text-sm text-ink-mid">
          {capabilities.map((cap) => (
            <li key={cap} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              {cap}
            </li>
          ))}
        </ul>
      )}

      {actionLabel && actionHref && (
        <div className="mt-6">
          <Button size="sm" variant="outline" asChild>
            <Link href={actionHref}>
              {actionLabel}
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
