import { MANE_SCORE_DISCLAIMER, type ScoreGrade, GRADE_LABELS } from "@/types/scoring";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart3 } from "lucide-react";

type ManeScoreBadgeProps = {
  score: number;
  grade: ScoreGrade;
  /** "compact" for listing detail sidebar, "full" for seller profile page */
  variant?: "compact" | "full";
};

export function ManeScoreBadge({
  score,
  grade,
  variant = "compact",
}: ManeScoreBadgeProps) {
  const gradeInfo = GRADE_LABELS[grade];

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-gold/10 px-2 py-1">
              <BarChart3 className="h-3 w-3 text-gold" />
              <span className="text-xs font-semibold text-gold">
                {score}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[240px]">
            <p className="text-xs font-medium">
              Mane Score: {score}/1,000 ({gradeInfo.label})
            </p>
            <p className="mt-1 text-xs text-ink-light">
              {MANE_SCORE_DISCLAIMER}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full variant — used on seller profile and analytics
  const percentage = Math.min((score / 1000) * 100, 100);

  return (
    <div className="rounded-lg border border-crease-light bg-paper-cream p-4 shadow-flat">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gold" />
          <span className="text-sm font-medium text-ink-dark">Mane Score</span>
        </div>
        <span className={`text-sm font-semibold ${gradeInfo.color}`}>
          {gradeInfo.label}
        </span>
      </div>

      <p className="mt-2 text-3xl font-bold text-ink-black">
        {score.toLocaleString()}
        <span className="text-lg font-normal text-ink-light">/1,000</span>
      </p>

      {/* Progress bar */}
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper-warm">
        <div
          className="h-full rounded-full bg-gold transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-ink-light">
        {MANE_SCORE_DISCLAIMER}
      </p>
    </div>
  );
}
