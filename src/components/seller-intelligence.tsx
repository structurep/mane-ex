"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  DollarSign,
  BarChart3,
  Target,
  Lightbulb,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronDown,
  ChevronUp,
  Zap,
  Users,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ─── Types ─── */

type PricingInsight = {
  suggestedLow: number;
  suggestedHigh: number;
  currentPrice: number;
  percentile: number; // Where current price falls in market
  priceHistory: { date: string; avgPrice: number }[];
  comps: {
    name: string;
    price: number;
    daysOnMarket: number;
    sold: boolean;
    similarity: number;
  }[];
};

type DemandSignal = {
  label: string;
  value: number;
  trend: "up" | "down" | "flat";
  detail: string;
};

type CompetitivePosition = {
  metric: string;
  yours: number;
  marketAvg: number;
  topDecile: number;
  unit: string;
};

type ActionItem = {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  timeToImplement: string;
};

/* ─── Sample Data ─── */

const SAMPLE_PRICING: PricingInsight = {
  suggestedLow: 55000,
  suggestedHigh: 72000,
  currentPrice: 65000,
  percentile: 68,
  priceHistory: [
    { date: "Sep", avgPrice: 58000 },
    { date: "Oct", avgPrice: 61000 },
    { date: "Nov", avgPrice: 63000 },
    { date: "Dec", avgPrice: 60000 },
    { date: "Jan", avgPrice: 65000 },
    { date: "Feb", avgPrice: 67000 },
  ],
  comps: [
    { name: "Similar Warmblood A", price: 62000, daysOnMarket: 23, sold: true, similarity: 92 },
    { name: "Similar Warmblood B", price: 68000, daysOnMarket: 45, sold: true, similarity: 88 },
    { name: "Similar Warmblood C", price: 71000, daysOnMarket: 12, sold: false, similarity: 85 },
    { name: "Similar Warmblood D", price: 58000, daysOnMarket: 8, sold: true, similarity: 82 },
    { name: "Similar Warmblood E", price: 75000, daysOnMarket: 67, sold: false, similarity: 78 },
  ],
};

const SAMPLE_DEMAND: DemandSignal[] = [
  { label: "ISO Posts Matching", value: 14, trend: "up", detail: "14 active buyer requests match this horse's profile (+3 this week)" },
  { label: "Saved by Buyers", value: 28, trend: "up", detail: "28 unique users have saved this listing (top 15% of active listings)" },
  { label: "Avg. View Duration", value: 42, trend: "flat", detail: "42 seconds average — above platform average of 28 seconds" },
  { label: "Inquiry Rate", value: 8.2, trend: "down", detail: "8.2% of viewers inquire — slightly below your previous listing (9.1%)" },
];

const SAMPLE_POSITION: CompetitivePosition[] = [
  { metric: "Photo Count", yours: 12, marketAvg: 6, topDecile: 15, unit: "photos" },
  { metric: "Description Length", yours: 450, marketAvg: 180, topDecile: 500, unit: "words" },
  { metric: "Response Time", yours: 2, marketAvg: 18, topDecile: 1, unit: "hours" },
  { metric: "Mane Score", yours: 845, marketAvg: 620, topDecile: 900, unit: "pts" },
  { metric: "Completeness", yours: 92, marketAvg: 64, topDecile: 95, unit: "%" },
  { metric: "Price Competitiveness", yours: 68, marketAvg: 50, topDecile: 85, unit: "percentile" },
];

const SAMPLE_ACTIONS: ActionItem[] = [
  {
    id: "a1",
    priority: "high",
    title: "Add Video Content",
    description: "Listings with video get 3.2x more inquiries. Upload at least one flatwork and one jumping video.",
    impact: "+3.2x inquiries",
    timeToImplement: "30 min",
  },
  {
    id: "a2",
    priority: "high",
    title: "Upload PPE Report",
    description: "Buyers are 67% more likely to make an offer when a recent PPE is available. Your last vet check was 4 months ago.",
    impact: "+67% offer rate",
    timeToImplement: "Request from vet",
  },
  {
    id: "a3",
    priority: "medium",
    title: "Add Show Record Details",
    description: "Include specific competition results (heights, divisions, placings). Generic 'show experience' performs 41% worse.",
    impact: "+41% credibility",
    timeToImplement: "15 min",
  },
  {
    id: "a4",
    priority: "medium",
    title: "Consider Price Adjustment",
    description: "Comps suggest $62K-$68K is the sweet spot for fastest sale in your category. You're at $65K — well-positioned.",
    impact: "Optimal pricing",
    timeToImplement: "5 min",
  },
  {
    id: "a5",
    priority: "low",
    title: "Update Photos for Season",
    description: "Your photos are from December. Fresh spring photos in good lighting typically boost engagement 25%.",
    impact: "+25% engagement",
    timeToImplement: "1 hour",
  },
];

/* ─── Pricing Intelligence Panel ─── */

function PricingIntelligence({ data }: { data: PricingInsight }) {
  const [showComps, setShowComps] = useState(false);

  const inRange =
    data.currentPrice >= data.suggestedLow &&
    data.currentPrice <= data.suggestedHigh;

  return (
    <div className="rounded-lg border-0 bg-paper-white p-6 shadow-flat">
      <div className="mb-4 flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-forest" />
        <h3 className="font-heading text-base font-semibold text-ink-black">
          Pricing Intelligence
        </h3>
      </div>

      {/* Price range visualization */}
      <div className="mb-4 rounded-md bg-paper-cream p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-ink-light">Suggested Range</p>
            <p className="font-serif text-lg font-bold text-ink-black">
              ${data.suggestedLow.toLocaleString()} – $
              {data.suggestedHigh.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-light">Your Price</p>
            <p className={`font-serif text-lg font-bold ${inRange ? "text-forest" : "text-primary"}`}>
              ${data.currentPrice.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Visual range bar */}
        <div className="mt-3">
          <div className="relative h-3 rounded-full bg-paper-warm">
            {/* Suggested range */}
            <div
              className="absolute top-0 h-full rounded-full bg-forest/20"
              style={{
                left: `${(data.suggestedLow / data.suggestedHigh / 1.2) * 100}%`,
                width: `${((data.suggestedHigh - data.suggestedLow) / (data.suggestedHigh * 1.2)) * 100}%`,
              }}
            />
            {/* Current price marker */}
            <div
              className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ${
                inRange ? "bg-forest" : "bg-primary"
              }`}
              style={{
                left: `${(data.currentPrice / (data.suggestedHigh * 1.2)) * 100}%`,
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-ink-faint">
            <span>${data.suggestedLow.toLocaleString()}</span>
            <span>${data.suggestedHigh.toLocaleString()}</span>
          </div>
        </div>

        <p className="mt-2 text-xs text-ink-mid">
          {inRange
            ? `Your price is at the ${data.percentile}th percentile — competitively positioned.`
            : data.currentPrice < data.suggestedLow
              ? "Your price is below the suggested range. You may be leaving value on the table."
              : "Your price is above the suggested range. Consider adjusting for faster sale."}
        </p>
      </div>

      {/* Mini price trend */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-ink-dark">
          Market Price Trend (6 months)
        </p>
        <div className="flex items-end gap-1 h-16">
          {data.priceHistory.map((point, i) => {
            const maxPrice = Math.max(...data.priceHistory.map((p) => p.avgPrice));
            const minPrice = Math.min(...data.priceHistory.map((p) => p.avgPrice));
            const range = maxPrice - minPrice || 1;
            const height = ((point.avgPrice - minPrice) / range) * 80 + 20;

            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
                <span className="text-[8px] text-ink-faint">
                  ${Math.round(point.avgPrice / 1000)}K
                </span>
                <div
                  className="w-full rounded-t-sm bg-forest/30"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[9px] text-ink-light">{point.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comps */}
      <button
        className="flex w-full items-center justify-between text-xs text-ink-light hover:text-ink-mid"
        onClick={() => setShowComps(!showComps)}
      >
        <span>
          {data.comps.length} comparable sales
        </span>
        {showComps ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {showComps && (
        <div className="mt-2 space-y-1">
          {data.comps.map((comp, i) => (
            <div key={i} className="flex items-center justify-between rounded-md bg-paper-cream p-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-ink-dark">{comp.name}</span>
                <Badge variant="secondary" className="text-[9px]">
                  {comp.similarity}% similar
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-ink-mid">{comp.daysOnMarket}d</span>
                <span className={`font-medium ${comp.sold ? "text-forest" : "text-ink-mid"}`}>
                  ${comp.price.toLocaleString()}
                  {comp.sold && " ✓"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Demand Signals ─── */

function DemandSignalsPanel({ signals }: { signals: DemandSignal[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const trendIcon = {
    up: <ArrowUpRight className="h-3.5 w-3.5 text-forest" />,
    down: <ArrowDownRight className="h-3.5 w-3.5 text-primary" />,
    flat: <Minus className="h-3.5 w-3.5 text-ink-light" />,
  };

  return (
    <div className="rounded-lg border-0 bg-paper-white p-6 shadow-flat">
      <div className="mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-gold" />
        <h3 className="font-heading text-base font-semibold text-ink-black">
          Demand Signals
        </h3>
      </div>

      <div className="space-y-2">
        {signals.map((signal) => (
          <div key={signal.label}>
            <button
              className="flex w-full items-center justify-between rounded-md bg-paper-cream p-3 transition-colors hover:bg-paper-warm"
              onClick={() =>
                setExpanded(expanded === signal.label ? null : signal.label)
              }
            >
              <div className="flex items-center gap-2">
                {trendIcon[signal.trend]}
                <span className="text-sm text-ink-dark">{signal.label}</span>
              </div>
              <span className="font-serif text-base font-bold text-ink-black">
                {signal.value}
                {signal.label.includes("Rate") ? "%" : ""}
                {signal.label.includes("Duration") ? "s" : ""}
              </span>
            </button>
            {expanded === signal.label && (
              <p className="px-3 py-1.5 text-xs text-ink-mid">
                {signal.detail}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Competitive Position ─── */

function CompetitivePositionPanel({
  positions,
}: {
  positions: CompetitivePosition[];
}) {
  return (
    <div className="rounded-lg border-0 bg-paper-white p-6 shadow-flat">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue" />
        <h3 className="font-heading text-base font-semibold text-ink-black">
          Competitive Position
        </h3>
      </div>

      <div className="space-y-3">
        {positions.map((pos) => {
          const isAboveAvg = pos.yours > pos.marketAvg;
          const isTopDecile = pos.yours >= pos.topDecile;

          return (
            <div key={pos.metric}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-dark">{pos.metric}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${isTopDecile ? "text-forest" : isAboveAvg ? "text-gold" : "text-primary"}`}>
                    {pos.yours} {pos.unit}
                  </span>
                  {isTopDecile && (
                    <Badge variant="secondary" className="bg-forest/10 text-forest text-[9px]">
                      Top 10%
                    </Badge>
                  )}
                </div>
              </div>
              <div className="mt-1 relative h-2 rounded-full bg-paper-warm">
                {/* Your position */}
                <div
                  className={`h-full rounded-full ${isTopDecile ? "bg-forest" : isAboveAvg ? "bg-gold" : "bg-primary/50"}`}
                  style={{
                    width: `${Math.min((pos.yours / pos.topDecile) * 100, 100)}%`,
                  }}
                />
                {/* Market avg marker */}
                <div
                  className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-ink-dark/40"
                  style={{ left: `${(pos.marketAvg / pos.topDecile) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-ink-light">
        <span className="flex items-center gap-1">
          <div className="h-2 w-4 rounded-full bg-forest" /> Your listing
        </span>
        <span className="flex items-center gap-1">
          <div className="h-3 w-0.5 bg-ink-dark/40" /> Market avg
        </span>
      </div>
    </div>
  );
}

/* ─── Action Items ─── */

function ActionItemsPanel({ actions }: { actions: ActionItem[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const priorityColors: Record<string, string> = {
    high: "border-l-primary bg-primary/5",
    medium: "border-l-gold bg-gold/5",
    low: "border-l-blue bg-blue/5",
  };

  const priorityLabels: Record<string, string> = {
    high: "High Impact",
    medium: "Medium Impact",
    low: "Quick Win",
  };

  const visibleActions = actions.filter((a) => !dismissed.has(a.id));

  return (
    <div className="rounded-lg border-0 bg-paper-white p-6 shadow-flat">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-gold" />
        <h3 className="font-heading text-base font-semibold text-ink-black">
          Action Items
        </h3>
        <Badge variant="secondary" className="text-xs">
          {visibleActions.length} remaining
        </Badge>
      </div>

      <div className="space-y-2">
        {visibleActions.map((action) => (
          <div
            key={action.id}
            className={`rounded-md border-l-4 p-3 ${priorityColors[action.priority]}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink-dark">
                    {action.title}
                  </span>
                  <Badge variant="secondary" className="text-[9px]">
                    {priorityLabels[action.priority]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-ink-mid">
                  {action.description}
                </p>
                <div className="mt-2 flex items-center gap-3 text-[10px] text-ink-light">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-forest" />
                    {action.impact}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {action.timeToImplement}
                  </span>
                </div>
              </div>
              <button
                className="shrink-0 text-xs text-ink-faint hover:text-ink-mid"
                onClick={() =>
                  setDismissed((prev) => new Set([...prev, action.id]))
                }
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Export: Full Seller Intelligence Dashboard ─── */

export function SellerIntelligenceDashboard({
  listingName,
}: {
  listingName?: string;
}) {
  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { icon: Eye, label: "Views (7d)", value: "127", trend: "+18%", positive: true },
          { icon: Users, label: "Inquiries (7d)", value: "8", trend: "+3", positive: true },
          { icon: TrendingUp, label: "Saves", value: "28", trend: "+5", positive: true },
          { icon: Clock, label: "Days Listed", value: "12", trend: "", positive: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border-0 bg-paper-white p-4 shadow-flat"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="h-4 w-4 text-ink-light" />
              {stat.trend && (
                <span
                  className={`text-xs font-medium ${
                    stat.positive ? "text-forest" : "text-primary"
                  }`}
                >
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="mt-2 font-serif text-2xl font-bold text-ink-black">
              {stat.value}
            </p>
            <p className="text-xs text-ink-light">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PricingIntelligence data={SAMPLE_PRICING} />
        <DemandSignalsPanel signals={SAMPLE_DEMAND} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CompetitivePositionPanel positions={SAMPLE_POSITION} />
        <ActionItemsPanel actions={SAMPLE_ACTIONS} />
      </div>

      {/* Footer insight */}
      <div className="flex items-start gap-3 rounded-lg bg-paper-warm p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-light" />
        <div className="text-xs text-ink-mid">
          <p className="font-medium text-ink-dark">About Seller Intelligence</p>
          <p className="mt-1">
            Market data is derived from anonymized platform activity and should be
            used as directional guidance, not as financial advice. Pricing
            recommendations are based on comparable listings and may not reflect
            individual horse value factors like training, temperament, or bloodlines.
          </p>
        </div>
      </div>
    </div>
  );
}
