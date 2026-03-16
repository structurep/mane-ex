import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title: string;
  icon?: string;
}

const variantConfig: Record<AlertVariant, { bg: string; bar: string; title: string; icon: string }> = {
  info: {
    bg:    "bg-bronze/[0.04]",
    bar:   "bg-bronze",
    title: "text-bronze-deep",
    icon:  "◇",
  },
  success: {
    bg:    "bg-sage/[0.04]",
    bar:   "bg-sage",
    title: "text-sage",
    icon:  "○",
  },
  warning: {
    bg:    "bg-leather/[0.04]",
    bar:   "bg-leather",
    title: "text-leather",
    icon:  "△",
  },
  error: {
    bg:    "bg-[#B07070]/[0.04]",
    bar:   "bg-[#B07070]",
    title: "text-[#B07070]",
    icon:  "✕",
  },
};

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", title, icon, children, ...props }, ref) => {
    const config = variantConfig[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "glass border border-glass rounded-xl p-6 relative overflow-hidden",
          config.bg,
          className
        )}
        {...props}
      >
        <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", config.bar)} />
        <p className={cn("text-sm font-semibold mb-1 flex items-center gap-2", config.title)}>
          {icon || config.icon} {title}
        </p>
        <div className="text-sm text-ink-mid pl-6 leading-relaxed">
          {children}
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";
export { Alert, type AlertProps, type AlertVariant };
