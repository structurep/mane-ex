import { TrendingUp, Eye, Heart, ThumbsDown, BarChart3, Lightbulb, DollarSign } from "lucide-react";
import type { DemandStats } from "@/lib/match/demand-score";

type DemandInsightsProps = {
  stats: DemandStats;
  className?: string;
};

function getDemandColor(score: number) {
  if (score >= 70) return { bar: "bg-oxblood", text: "text-oxblood" };
  if (score >= 40) return { bar: "bg-forest", text: "text-forest" };
  return { bar: "bg-ink-faint", text: "text-ink-mid" };
}

function getPriceColor(position: string | null | undefined) {
  if (position === "Below Market") return { text: "text-forest", bg: "bg-forest/10" };
  if (position === "Above Market") return { text: "text-gold", bg: "bg-gold/10" };
  return { text: "text-ink-mid", bg: "bg-ink-black/5" };
}

/**
 * Seller-facing demand insights card.
 * Shows score, raw stats, price positioning, and actionable suggestions.
 */
export function DemandInsights({ stats, className }: DemandInsightsProps) {
  const color = getDemandColor(stats.score);
  const priceColor = getPriceColor(stats.pricePosition);

  // Suggestion logic — price-aware
  const highPassesAboveMarket =
    stats.passes7d > stats.favorites7d * 2 && stats.pricePosition === "Above Market";
  const highPassesGeneral =
    stats.passes7d > stats.favorites7d * 2 && stats.views7d > 20 && !highPassesAboveMarket;
  const strongInterestBelowMarket =
    stats.favorites7d > stats.passes7d && stats.pricePosition === "Below Market";
  const strongInterestGeneral =
    stats.favorites7d > stats.passes7d && !strongInterestBelowMarket;

  const suggestion = highPassesAboveMarket
    ? { msg: "Buyers are engaging but frequently passing. Your price appears above comparable listings.", variant: "gold" as const }
    : highPassesGeneral
      ? { msg: "This listing is getting attention but buyers are passing. Consider adjusting the price or updating media.", variant: "gold" as const }
      : strongInterestBelowMarket
        ? { msg: "Strong buyer interest. Your price may be below comparable listings.", variant: "forest" as const }
        : strongInterestGeneral
          ? { msg: "Strong buyer interest. You may receive offers soon.", variant: "forest" as const }
          : null;

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

      {/* Price positioning */}
      {stats.pricePosition && stats.pricePercentile != null && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <DollarSign className={`h-3.5 w-3.5 ${priceColor.text}`} />
            <span className="text-xs text-ink-mid">Price Position</span>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${priceColor.bg} ${priceColor.text}`}>
            {stats.pricePosition} ({stats.pricePercentile}th percentile)
          </span>
        </div>
      )}

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
      {suggestion && (
        <div className={`mt-3 flex items-start gap-2 rounded-md px-3 py-2 ${suggestion.variant === "gold" ? "bg-gold/10" : "bg-forest/10"}`}>
          <Lightbulb className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${suggestion.variant === "gold" ? "text-gold" : "text-forest"}`} />
          <p className="text-xs text-ink-dark">{suggestion.msg}</p>
        </div>
      )}

      {/* Footer */}
      <p className="mt-3 text-[10px] text-ink-faint">
        This reflects buyer engagement across ManeExchange in the last 7 days.
      </p>
    </div>
  );
}
