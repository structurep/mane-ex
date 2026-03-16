import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "standard" | "bronze" | "sage" | "leather" | "blush" | "dusk";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  fold?: boolean;
  featured?: boolean;
  accent?: boolean;
}

const variantGlass: Record<CardVariant, string> = {
  standard: "glass",
  bronze:   "glass-bronze",
  sage:     "glass-sage",
  leather:  "glass-leather",
  blush:    "glass-blush",
  dusk:     "glass-leather",
};

const accentGradients: Record<CardVariant, string> = {
  standard: "",
  bronze:   "bg-gradient-to-r from-bronze to-bronze-light",
  sage:     "bg-gradient-to-r from-sage to-sage-soft",
  leather:  "bg-gradient-to-r from-leather to-leather-soft",
  blush:    "bg-gradient-to-r from-blush to-blush-soft",
  dusk:     "bg-gradient-to-r from-dusk to-dusk-soft",
};

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "standard", fold = false, featured = false, accent = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          variantGlass[variant],
          "border rounded-xl p-8",
          "transition-all duration-500",
          "hover:-translate-y-1.5 hover:shadow-hovering",
          featured
            ? "border-bronze/20 hover:shadow-bronze-glow"
            : "border-glass hover:border-ink-ghost/20",
          fold && "fold",
          (accent || featured) && "relative overflow-hidden",
          className
        )}
        {...props}
      >
        {(accent || featured) && variant !== "standard" && (
          <div className={cn("accent-bar", accentGradients[variant])} />
        )}
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
export { GlassCard, type GlassCardProps, type CardVariant };
