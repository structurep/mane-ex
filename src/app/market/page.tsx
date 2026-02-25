"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Clock,
  Activity,
  ArrowRight,
  Minus,
  MapPin,
} from "lucide-react";

type TimePeriod = "7d" | "30d" | "90d" | "1yr";

const statsByPeriod: Record<
  TimePeriod,
  {
    avgPrice: string;
    avgPriceTrend: number;
    medianPrice: string;
    medianPriceTrend: number;
    avgDays: string;
    avgDaysTrend: number;
    activeListings: string;
    activeListingsTrend: number;
  }
> = {
  "7d": {
    avgPrice: "$46,200",
    avgPriceTrend: 1.8,
    medianPrice: "$37,500",
    medianPriceTrend: 0.9,
    avgDays: "36",
    avgDaysTrend: -3.2,
    activeListings: "834",
    activeListingsTrend: 4.1,
  },
  "30d": {
    avgPrice: "$47,500",
    avgPriceTrend: 5.2,
    medianPrice: "$38,000",
    medianPriceTrend: 3.1,
    avgDays: "34",
    avgDaysTrend: -8.4,
    activeListings: "847",
    activeListingsTrend: 12.3,
  },
  "90d": {
    avgPrice: "$48,900",
    avgPriceTrend: 7.6,
    medianPrice: "$39,200",
    medianPriceTrend: 5.4,
    avgDays: "31",
    avgDaysTrend: -12.1,
    activeListings: "891",
    activeListingsTrend: 18.7,
  },
  "1yr": {
    avgPrice: "$45,800",
    avgPriceTrend: 3.4,
    medianPrice: "$36,500",
    medianPriceTrend: 2.8,
    avgDays: "38",
    avgDaysTrend: -5.7,
    activeListings: "762",
    activeListingsTrend: 24.5,
  },
};

const disciplineData = [
  {
    discipline: "Hunter/Jumper",
    avgPrice: 62500,
    medianPrice: 52000,
    listings: 312,
    trend: 8.2,
  },
  {
    discipline: "Dressage",
    avgPrice: 55000,
    medianPrice: 45000,
    listings: 198,
    trend: 5.7,
  },
  {
    discipline: "Eventing",
    avgPrice: 42000,
    medianPrice: 35000,
    listings: 145,
    trend: 3.1,
  },
  {
    discipline: "Equitation",
    avgPrice: 58000,
    medianPrice: 48000,
    listings: 89,
    trend: 12.4,
  },
  {
    discipline: "Western/Reining",
    avgPrice: 35000,
    medianPrice: 28000,
    listings: 67,
    trend: -2.3,
  },
  {
    discipline: "Breeding",
    avgPrice: 25000,
    medianPrice: 18000,
    listings: 36,
    trend: 1.8,
  },
];

const trendCards = [
  {
    title: "Equitation Rising",
    description:
      "Equitation horses are up 12.4% this quarter, driven by A-circuit demand in Wellington and Thermal.",
    color: "border-l-forest",
    icon: TrendingUp,
    iconColor: "text-forest",
  },
  {
    title: "Getting Stacked",
    description:
      "Hunter/Jumper inventory is up 15% but demand is keeping pace. Prices remain firm above $50K.",
    color: "border-l-gold",
    icon: BarChart3,
    iconColor: "text-gold",
  },
  {
    title: "Best Time to Buy",
    description:
      "Eventing horses are seeing the slowest price growth. Buyers have more negotiating power in this segment.",
    color: "border-l-blue",
    icon: DollarSign,
    iconColor: "text-blue",
  },
];

function TrendIndicator({
  value,
  invertColor = false,
}: {
  value: number;
  invertColor?: boolean;
}) {
  const isPositive = value >= 0;
  // For "days on market", a negative trend (fewer days) is good
  const colorClass = invertColor
    ? isPositive
      ? "text-red"
      : "text-forest"
    : isPositive
      ? "text-forest"
      : "text-red";

  const Icon = isPositive ? TrendingUp : value === 0 ? Minus : TrendingDown;

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${colorClass}`}>
      <Icon className="h-3 w-3" />
      {isPositive ? "+" : ""}
      {value}% vs prev period
    </span>
  );
}

export default function MarketIntelligencePage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30d");
  const stats = statsByPeriod[timePeriod];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="with-grain bg-gradient-hero px-4 pt-24 pb-12 md:px-8 md:pt-36 md:pb-16">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-3 text-gold">MARKET INTELLIGENCE</p>
            <h1 className="mb-4 text-4xl tracking-tight text-ink-black md:text-5xl">
              Know the market.
            </h1>
            <p className="text-lead mx-auto max-w-2xl text-ink-mid">
              Real-time pricing data, demand trends, and market insights from
              the ManeExchange marketplace.
            </p>

            {/* Time Period Selector */}
            <div className="mx-auto mt-10 mb-8 flex gap-1 rounded-lg bg-paper-warm p-1 max-w-xs">
              {(["7d", "30d", "90d", "1yr"] as TimePeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    timePeriod === period
                      ? "bg-paper-white text-ink-black shadow-flat"
                      : "text-ink-mid hover:text-ink-black"
                  }`}
                >
                  {period === "1yr" ? "1 Year" : period}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stat Cards */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border-0 bg-paper-white p-5 shadow-flat">
                <div className="flex items-center gap-2 text-sm text-ink-mid">
                  <DollarSign className="h-4 w-4" />
                  Avg. Price
                </div>
                <p className="mt-2 font-serif text-2xl font-bold text-ink-black">
                  {stats.avgPrice}
                </p>
                <p className="mt-1">
                  <TrendIndicator value={stats.avgPriceTrend} />
                </p>
              </div>

              <div className="rounded-lg border-0 bg-paper-white p-5 shadow-flat">
                <div className="flex items-center gap-2 text-sm text-ink-mid">
                  <DollarSign className="h-4 w-4" />
                  Median Price
                </div>
                <p className="mt-2 font-serif text-2xl font-bold text-ink-black">
                  {stats.medianPrice}
                </p>
                <p className="mt-1">
                  <TrendIndicator value={stats.medianPriceTrend} />
                </p>
              </div>

              <div className="rounded-lg border-0 bg-paper-white p-5 shadow-flat">
                <div className="flex items-center gap-2 text-sm text-ink-mid">
                  <Clock className="h-4 w-4" />
                  Avg. Days on Market
                </div>
                <p className="mt-2 font-serif text-2xl font-bold text-ink-black">
                  {stats.avgDays}
                </p>
                <p className="mt-1">
                  <TrendIndicator
                    value={stats.avgDaysTrend}
                    invertColor={true}
                  />
                </p>
              </div>

              <div className="rounded-lg border-0 bg-paper-white p-5 shadow-flat">
                <div className="flex items-center gap-2 text-sm text-ink-mid">
                  <Activity className="h-4 w-4" />
                  Active Listings
                </div>
                <p className="mt-2 font-serif text-2xl font-bold text-ink-black">
                  {stats.activeListings}
                </p>
                <p className="mt-1">
                  <TrendIndicator value={stats.activeListingsTrend} />
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Price by Discipline Table */}
        <section className="bg-paper-white section-premium">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-6 font-serif text-2xl font-semibold tracking-tight text-ink-black">
              Average Price by Discipline
            </h2>
            <div className="rounded-lg border-0 overflow-hidden shadow-flat">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-crease-light bg-paper-cream">
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-mid">
                      Discipline
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-ink-mid">
                      Avg. Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-ink-mid hidden sm:table-cell">
                      Median
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-ink-mid hidden sm:table-cell">
                      Listings
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-ink-mid">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {disciplineData.map((row) => (
                    <tr
                      key={row.discipline}
                      className="border-b border-crease-light last:border-0"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-ink-black">
                        {row.discipline}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-ink-black">
                        ${row.avgPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-ink-mid hidden sm:table-cell">
                        ${row.medianPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-ink-mid hidden sm:table-cell">
                        {row.listings}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-sm ${
                            row.trend >= 0 ? "text-forest" : "text-red"
                          }`}
                        >
                          {row.trend >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {row.trend >= 0 ? "+" : ""}
                          {row.trend}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Trend Callout Cards */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-6 font-serif text-2xl font-semibold tracking-tight text-ink-black">
              Market Trends
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {trendCards.map((card) => (
                <div
                  key={card.title}
                  className={`rounded-lg border-0 ${card.color} border-l-4 bg-paper-white p-5 shadow-flat`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                    <h3 className="font-medium text-ink-black">{card.title}</h3>
                  </div>
                  <p className="text-sm text-ink-mid">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Regional Demand Map Placeholder */}
        <section className="bg-paper-white section-premium">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-6 font-serif text-2xl font-semibold tracking-tight text-ink-black">
              Demand by Region
            </h2>
            <div className="rounded-lg border-0 bg-paper-cream p-12 text-center shadow-flat">
              <MapPin className="mx-auto mb-3 h-8 w-8 text-ink-light" />
              <h3 className="font-medium text-ink-black">
                Regional Demand Map
              </h3>
              <p className="mt-1 text-sm text-ink-mid">
                Interactive demand visualization coming soon.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-paddock section-premium">
          <div className="mx-auto max-w-[1200px] text-center">
            <h2 className="mb-4 text-3xl tracking-tight text-paper-white">
              Ready to buy or sell?
            </h2>
            <p className="text-lead mx-auto mb-8 max-w-lg text-ink-light">
              Use market intelligence to make smarter decisions. Browse active
              listings or list your horse at the right price.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href="/browse">
                  View Current Offerings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard/listings/new">List Your Horse</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
