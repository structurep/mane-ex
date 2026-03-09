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
  { bg: string; icon: typeof CheckCircle; iconColor: string; titleColor: string; textColor: string }
> = {
  success: {
    bg: "bg-forest/5 border-forest/20",
    icon: CheckCircle,
    iconColor: "text-forest",
    titleColor: "text-forest",
    textColor: "text-forest/80",
  },
  warning: {
    bg: "bg-gold/5 border-gold/20",
    icon: AlertTriangle,
    iconColor: "text-gold",
    titleColor: "text-yellow-800",
    textColor: "text-yellow-700",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: Info,
    iconColor: "text-blue-500",
    titleColor: "text-blue-800",
    textColor: "text-blue-700",
  },
  error: {
    bg: "bg-oxblood/5 border-oxblood/20",
    icon: XCircle,
    iconColor: "text-oxblood",
    titleColor: "text-oxblood",
    textColor: "text-oxblood/80",
  },
};

interface AlertBannerProps {
  variant: AlertVariant;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

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
        "rounded-lg border p-4",
        config.bg,
        className
      )}
    >
      <div className="flex">
        <div className="shrink-0">
          <Icon className={cn("size-5", config.iconColor)} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={cn("text-sm font-medium", config.titleColor)}>
            {title}
          </h3>
          {children && (
            <div className={cn("mt-2 text-sm", config.textColor)}>
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
            className={cn("ml-auto -mr-1 -mt-1 rounded p-1 hover:bg-ink-black/5", config.iconColor)}
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
