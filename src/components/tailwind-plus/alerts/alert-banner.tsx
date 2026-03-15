import { cn } from "@/lib/utils";
import { type ReactNode } from "react";
import {
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
} from "lucide-react";

type AlertVariant = "success" | "warning" | "info" | "error";

const variantConfig: Record<
  AlertVariant,
  { border: string; bg: string; icon: typeof CheckCircle; iconColor: string; titleColor: string; textColor: string }
> = {
  success: {
    border: "border-l-[var(--accent-green)]",
    bg: "bg-[var(--accent-green-soft)]",
    icon: CheckCircle,
    iconColor: "text-[var(--accent-green)]",
    titleColor: "text-[var(--accent-green)]",
    textColor: "text-[var(--ink-mid)]",
  },
  warning: {
    border: "border-l-[var(--accent-gold)]",
    bg: "bg-[var(--accent-gold-soft)]",
    icon: AlertTriangle,
    iconColor: "text-[var(--accent-gold)]",
    titleColor: "text-[var(--ink-dark)]",
    textColor: "text-[var(--ink-mid)]",
  },
  info: {
    border: "border-l-[var(--accent-blue)]",
    bg: "bg-[var(--accent-blue-soft)]",
    icon: Info,
    iconColor: "text-[var(--accent-blue)]",
    titleColor: "text-[var(--ink-dark)]",
    textColor: "text-[var(--ink-mid)]",
  },
  error: {
    border: "border-l-[var(--accent-red)]",
    bg: "bg-[var(--accent-red-soft)]",
    icon: XCircle,
    iconColor: "text-[var(--accent-red)]",
    titleColor: "text-[var(--accent-red)]",
    textColor: "text-[var(--ink-mid)]",
  },
};

export interface AlertBannerProps {
  variant: AlertVariant;
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Alert banner — Origami style with left accent border and paper surface.
 */
export function AlertBanner({
  variant,
  title,
  children,
  actions,
  onDismiss,
  className,
}: AlertBannerProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "paper-flat border-l-2 p-4",
        config.border,
        config.bg,
        className
      )}
    >
      <div className="flex">
        <div className="shrink-0">
          <Icon className={cn("size-5", config.iconColor)} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={cn("text-sm font-semibold", config.titleColor)}>
              {title}
            </h3>
          )}
          {children && (
            <div className={cn(title ? "mt-1.5" : "", "text-sm", config.textColor)}>
              {children}
            </div>
          )}
          {actions && (
            <div className="mt-3 flex gap-3">{actions}</div>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={cn("ml-auto -mr-1 -mt-1 rounded-[var(--radius-paper)] p-1 hover:bg-[var(--ink-black)]/5", config.iconColor)}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
