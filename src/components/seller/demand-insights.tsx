import { TrendingUp, Eye, Heart, ThumbsDown, BarChart3, Lightbulb } from "lucide-react";
import type { DemandStats } from "@/lib/match/demand-score";

type DemandInsightsProps = {
  stats: DemandStats;
  className?: string;
};

function getDemandColor(score: number) {
  if (score >= 70) return { bar: "bg-oxblood", text: "text-oxblood", bg: "bg-oxblood/10" };
  if (score >= 40) return { bar: "bg-forest", text: "text-forest", bg: "bg-forest/10" };
  return { bar: "bg-ink-faint", text: "text-ink-mid", bg: "bg-ink-black/5" };
}

/**
 * Seller-facing demand insights card.
 * Shows score, raw stats, and actionable suggestions.
 */
export function DemandInsights({ stats, className }: DemandInsightsProps) {
  const color = getDemandColor(stats.score);

  // Suggestion logic
  const highPasses = stats.passes7d > stats.favorites7d * 2 && stats.views7d > 20;
  const strongInterest = stats.favorites7d > stats.passes7d;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-ink-mid" />
        <h3 className="text-sm font-semibold text-ink-dark">Buyer Demand Insights</h3>
      </div>

      {/* Score bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-mid">Demand Score</span>
          <span className={`text-sm font-bold ${color.text}`}>
            {stats.score} — {stats.label}
          </span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-surface-wash">
          <div
            className={`h-2 rounded-full transition-all ${color.bar}`}
            style={{ width: `${stats.score}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-md bg-surface-wash px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Heart className="h-3 w-3 text-coral" />
            <span className="text-[11px] text-ink-mid">Favorites (7d)</span>
          </div>
          <p className="mt-0.5 text-lg font-bold text-ink-dark">{stats.favorites7d}</p>
        </div>
        <div className="rounded-md bg-surface-wash px-3 py-2">
          <div className="flex items-center gap-1.5">
            <ThumbsDown className="h-3 w-3 text-ink-faint" />
            <span className="text-[11px] text-ink-mid">Passes (7d)</span>
          </div>
          <p className="mt-0.5 text-lg font-bold text-ink-dark">{stats.passes7d}</p>
        </div>
        <div className="rounded-md bg-surface-wash px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3 w-3 text-blue" />
            <span className="text-[11px] text-ink-mid">Views (7d)</span>
          </div>
          <p className="mt-0.5 text-lg font-bold text-ink-dark">{stats.views7d}</p>
        </div>
        <div className="rounded-md bg-surface-wash px-3 py-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-forest" />
            <span className="text-[11px] text-ink-mid">Favorite Rate</span>
          </div>
          <p className="mt-0.5 text-lg font-bold text-ink-dark">{stats.favoriteRate}%</p>
        </div>
      </div>

      {/* Suggestion */}
      {(highPasses || strongInterest) && (
        <div className={`mt-3 flex items-start gap-2 rounded-md px-3 py-2 ${highPasses ? "bg-gold/10" : "bg-forest/10"}`}>
          <Lightbulb className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${highPasses ? "text-gold" : "text-forest"}`} />
          <p className="text-xs text-ink-dark">
            {highPasses
              ? "This listing is getting attention but buyers are passing. Consider adjusting the price or updating media."
              : "Strong buyer interest. You may receive offers soon."}
          </p>
        </div>
      )}

      {/* Footer */}
      <p className="mt-3 text-[10px] text-ink-faint">
        This reflects buyer engagement across ManeExchange in the last 7 days.
      </p>
    </div>
  );
}
