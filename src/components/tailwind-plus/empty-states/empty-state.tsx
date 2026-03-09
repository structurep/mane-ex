import { cn } from "@/lib/utils";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("px-6 py-14 text-center", className)}>
      <div className="mx-auto mb-3 flex size-12 items-center justify-center text-ink-faint">
        {icon}
      </div>
      <h3 className="font-serif text-lg font-semibold text-ink-dark">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-mid">{description}</p>
      {actionLabel && (
        <div className="mt-5">
          {actionHref ? (
            <Button size="sm" asChild>
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
