import { type SellerBadge, BADGE_DEFINITIONS } from "@/types/scoring";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  FileCheck,
  Zap,
  Crown,
  TrendingUp,
  Star,
  ShieldCheck,
  Gem,
  Activity,
  Heart,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileCheck,
  Zap,
  Crown,
  TrendingUp,
  Star,
  ShieldCheck,
  Gem,
  Activity,
  Heart,
};

type BadgeShowcaseProps = {
  earnedBadges: SellerBadge[];
  /** "grid" shows all 9 with earned/unearned, "inline" shows only earned */
  variant?: "grid" | "inline";
};

export function BadgeShowcase({
  earnedBadges,
  variant = "inline",
}: BadgeShowcaseProps) {
  const earnedSet = new Set(earnedBadges);

  if (variant === "inline") {
    // Show only earned badges as small icons
    const earned = BADGE_DEFINITIONS.filter((b) => earnedSet.has(b.id));
    if (earned.length === 0) return null;

    return (
      <TooltipProvider>
        <div className="flex flex-wrap gap-1.5">
          {earned.map((badge) => {
            const Icon = ICON_MAP[badge.icon];
            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-1 rounded-md bg-gold/10 px-2 py-1">
                    {Icon && <Icon className="h-3 w-3 text-gold" />}
                    <span className="text-xs font-medium text-gold">
                      {badge.label}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-medium">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {badge.description}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  // Grid variant — shows all 9 with earned/unearned status
  return (
    <TooltipProvider>
      <div className="grid grid-cols-3 gap-3">
        {BADGE_DEFINITIONS.map((badge) => {
          const Icon = ICON_MAP[badge.icon];
          const isEarned = earnedSet.has(badge.id);

          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <div
                  className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors ${
                    isEarned
                      ? "border-gold/30 bg-gold/5"
                      : "border-border bg-paper-warm opacity-50"
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`h-6 w-6 ${isEarned ? "text-gold" : "text-ink-faint"}`}
                    />
                  )}
                  <span
                    className={`text-xs font-medium leading-tight ${
                      isEarned ? "text-ink-dark" : "text-ink-light"
                    }`}
                  >
                    {badge.label}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="text-xs font-medium">{badge.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {badge.description}
                </p>
                <p className="mt-1 text-xs text-muted-foreground italic">
                  {isEarned ? "Earned" : badge.criteria}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
