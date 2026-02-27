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
  Calculator,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ─── Types ─── */

type TimePeriod = "7d" | "30d" | "90d" | "1yr";

/* ─── Sample Data ─── */

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
  { discipline: "Hunter/Jumper", avgPrice: 62500, medianPrice: 52000, listings: 312, trend: 8.2 },
  { discipline: "Dressage", avgPrice: 55000, medianPrice: 45000, listings: 198, trend: 5.7 },
  { discipline: "Eventing", avgPrice: 42000, medianPrice: 35000, listings: 145, trend: 3.1 },
  { discipline: "Equitation", avgPrice: 58000, medianPrice: 48000, listings: 89, trend: 12.4 },
  { discipline: "Western/Reining", avgPrice: 35000, medianPrice: 28000, listings: 67, trend: -2.3 },
  { discipline: "Breeding", avgPrice: 25000, medianPrice: 18000, listings: 36, trend: 1.8 },
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

/* ─── Breed × Age Price Matrix ─── */

const breedAgeMatrix = [
  {
    breed: "Thoroughbred",
    ranges: [
      { age: "3-5", low: 15000, high: 45000 },
      { age: "6-9", low: 25000, high: 85000 },
      { age: "10-14", low: 15000, high: 55000 },
      { age: "15+", low: 5000, high: 25000 },
    ],
  },
  {
    breed: "Warmblood",
    ranges: [
      { age: "3-5", low: 25000, high: 75000 },
      { age: "6-9", low: 40000, high: 125000 },
      { age: "10-14", low: 30000, high: 85000 },
      { age: "15+", low: 10000, high: 40000 },
    ],
  },
  {
    breed: "Hanoverian",
    ranges: [
      { age: "3-5", low: 30000, high: 85000 },
      { age: "6-9", low: 45000, high: 150000 },
      { age: "10-14", low: 35000, high: 95000 },
      { age: "15+", low: 12000, high: 45000 },
    ],
  },
  {
    breed: "Quarter Horse",
    ranges: [
      { age: "3-5", low: 8000, high: 25000 },
      { age: "6-9", low: 12000, high: 45000 },
      { age: "10-14", low: 8000, high: 30000 },
      { age: "15+", low: 3000, high: 15000 },
    ],
  },
  {
    breed: "Holsteiner",
    ranges: [
      { age: "3-5", low: 35000, high: 95000 },
      { age: "6-9", low: 50000, high: 175000 },
      { age: "10-14", low: 35000, high: 100000 },
      { age: "15+", low: 15000, high: 50000 },
    ],
  },
  {
    breed: "Dutch Warmblood",
    ranges: [
      { age: "3-5", low: 30000, high: 90000 },
      { age: "6-9", low: 45000, high: 160000 },
      { age: "10-14", low: 30000, high: 90000 },
      { age: "15+", low: 12000, high: 45000 },
    ],
  },
];

/* ─── Recent Comps (Anonymized) ─── */

const recentComps = [
  {
    id: "c1",
    breed: "Warmblood",
    age: 7,
    discipline: "Hunter/Jumper",
    region: "Southeast",
    price: 6500000,
    daysOnMarket: 18,
    date: "2026-02-24",
  },
  {
    id: "c2",
    breed: "Hanoverian",
    age: 5,
    discipline: "Dressage",
    region: "Northeast",
    price: 8500000,
    daysOnMarket: 42,
    date: "2026-02-22",
  },
  {
    id: "c3",
    breed: "Thoroughbred",
    age: 9,
    discipline: "Eventing",
    region: "Southeast",
    price: 3500000,
    daysOnMarket: 12,
    date: "2026-02-21",
  },
  {
    id: "c4",
    breed: "Quarter Horse",
    age: 6,
    discipline: "Western/Reining",
    region: "Southwest",
    price: 2200000,
    daysOnMarket: 28,
    date: "2026-02-20",
  },
  {
    id: "c5",
    breed: "Dutch Warmblood",
    age: 8,
    discipline: "Hunter/Jumper",
    region: "Northeast",
    price: 12500000,
    daysOnMarket: 7,
    date: "2026-02-19",
  },
  {
    id: "c6",
    breed: "Holsteiner",
    age: 4,
    discipline: "Show Jumping",
    region: "Midwest",
    price: 9500000,
    daysOnMarket: 34,
    date: "2026-02-18",
  },
  {
    id: "c7",
    breed: "Warmblood",
    age: 11,
    discipline: "Equitation",
    region: "Southeast",
    price: 5500000,
    daysOnMarket: 22,
    date: "2026-02-17",
  },
  {
    id: "c8",
    breed: "Thoroughbred",
    age: 6,
    discipline: "Hunter",
    region: "West",
    price: 4200000,
    daysOnMarket: 15,
    date: "2026-02-16",
  },
];

/* ─── Price Estimator Options ─── */

const estimatorBreeds = [
  "Thoroughbred", "Warmblood", "Hanoverian", "Quarter Horse",
  "Holsteiner", "Dutch Warmblood", "Oldenburg", "Trakehner",
];

const estimatorDisciplines = [
  "Hunter/Jumper", "Dressage", "Eventing", "Equitation",
  "Western/Reining", "Trail",
];

const estimatorRegions = [
  "Southeast", "Northeast", "Midwest", "West", "Southwest",
];

/* ─── Helpers ─── */

function TrendIndicator({
  value,
  invertColor = false,
}: {
  value: number;
  invertColor?: boolean;
}) {
  const isPositive = value >= 0;
  const colorClass = invertColor
    ? isPositive ? "text-red" : "text-forest"
    : isPositive ? "text-forest" : "text-red";

  const Icon = isPositive ? TrendingUp : value === 0 ? Minus : TrendingDown;

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${colorClass}`}>
      <Icon className="h-3 w-3" />
      {isPositive ? "+" : ""}{value}% vs prev period
    </span>
  );
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toLocaleString()}`;
}

function daysSinceStr(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

/* ─── Price Estimator Component ─── */

function PriceEstimator() {
  const [breed, setBreed] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [age, setAge] = useState("");
  const [region, setRegion] = useState("");
  const [result, setResult] = useState<{ low: number; high: number; median: number } | null>(null);

  function estimate() {
    // Simple heuristic based on breed + discipline + age
    let baseLow = 20000;
    let baseHigh = 60000;

    // Breed multiplier
    const breedMult: Record<string, number> = {
      "Hanoverian": 1.6, "Holsteiner": 1.7, "Dutch Warmblood": 1.5,
      "Warmblood": 1.3, "Oldenburg": 1.4, "Trakehner": 1.3,
      "Thoroughbred": 1.0, "Quarter Horse": 0.7,
    };
    const bm = breedMult[breed] || 1.0;

    // Discipline multiplier
    const discMult: Record<string, number> = {
      "Hunter/Jumper": 1.3, "Dressage": 1.2, "Equitation": 1.25,
      "Eventing": 1.0, "Western/Reining": 0.8, "Trail": 0.6,
    };
    const dm = discMult[discipline] || 1.0;

    // Age curve (peak value 6-9)
    const ageNum = parseInt(age) || 7;
    let am = 1.0;
    if (ageNum < 4) am = 0.7;
    else if (ageNum <= 5) am = 0.9;
    else if (ageNum <= 9) am = 1.0;
    else if (ageNum <= 14) am = 0.8;
    else am = 0.5;

    // Region premium
    const regionMult: Record<string, number> = {
      "Southeast": 1.1, "Northeast": 1.15, "West": 1.05,
      "Midwest": 0.95, "Southwest": 0.9,
    };
    const rm = regionMult[region] || 1.0;

    const low = Math.round(baseLow * bm * dm * am * rm / 100) * 100;
    const high = Math.round(baseHigh * bm * dm * am * rm / 100) * 100;
    const median = Math.round((low + high) / 2 / 100) * 100;

    setResult({ low, high, median });
  }

  return (
    <div className="rounded-lg border-0 bg-paper-white p-6 shadow-flat">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-primary" />
        <h3 className="font-heading text-lg font-semibold text-ink-black">
          Price Estimator
        </h3>
      </div>
      <p className="mb-4 text-sm text-ink-mid">
        Get an estimated price range based on breed, discipline, age, and region.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          className="rounded-md border border-border bg-paper-white px-3 py-2 text-sm"
        >
          <option value="">Select Breed</option>
          {estimatorBreeds.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <select
          value={discipline}
          onChange={(e) => setDiscipline(e.target.value)}
          className="rounded-md border border-border bg-paper-white px-3 py-2 text-sm"
        >
          <option value="">Select Discipline</option>
          {estimatorDisciplines.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="rounded-md border border-border bg-paper-white px-3 py-2 text-sm"
        >
          <option value="">Select Age</option>
          <option value="3">3-5 years</option>
          <option value="7">6-9 years</option>
          <option value="12">10-14 years</option>
          <option value="16">15+ years</option>
        </select>

        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-md border border-border bg-paper-white px-3 py-2 text-sm"
        >
          <option value="">Select Region</option>
          {estimatorRegions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <Button
        className="mt-4 w-full"
        onClick={estimate}
        disabled={!breed || !discipline || !age}
      >
        Estimate Price Range
      </Button>

      {result && (
        <div className="mt-4 rounded-lg bg-paper-cream p-4">
          <p className="text-xs font-medium text-ink-light mb-2">
            ESTIMATED RANGE
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-ink-black">
              ${result.low.toLocaleString()} – ${result.high.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-mid">
            Median: <span className="font-medium text-ink-black">${result.median.toLocaleString()}</span>
          </p>
          <p className="mt-2 text-[10px] text-ink-light">
            Based on anonymized ManeExchange transaction data. Actual prices
            vary based on training level, show record, conformation, and
            individual factors.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Page ─── */

export default function MarketIntelligencePage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30d");
  const [showAllComps, setShowAllComps] = useState(false);
  const stats = statsByPeriod[timePeriod];
  const visibleComps = showAllComps ? recentComps : recentComps.slice(0, 4);

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
              Real-time pricing data, anonymized comps, and market insights from
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
                  <TrendIndicator value={stats.avgDaysTrend} invertColor />
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

        {/* Price Estimator + Breed × Age Matrix — side by side on desktop */}
        <section className="bg-paper-white section-premium">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-6 font-serif text-2xl font-semibold tracking-tight text-ink-black">
              Price Guide
            </h2>

            <div className="grid gap-6 lg:grid-cols-5">
              {/* Price Estimator — 2 cols */}
              <div className="lg:col-span-2">
                <PriceEstimator />
              </div>

              {/* Breed × Age Matrix — 3 cols */}
              <div className="lg:col-span-3">
                <div className="rounded-lg border-0 overflow-hidden shadow-flat">
                  <div className="bg-paper-cream px-4 py-3">
                    <h3 className="font-heading text-sm font-semibold text-ink-black">
                      Price Ranges by Breed &amp; Age
                    </h3>
                    <p className="text-[10px] text-ink-light mt-0.5">
                      Based on anonymized ManeExchange transaction data
                    </p>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-crease-light">
                        <th className="px-3 py-2 text-left text-[10px] font-medium text-ink-mid">
                          Breed
                        </th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium text-ink-mid">
                          3-5 yrs
                        </th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium text-ink-mid">
                          6-9 yrs
                        </th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium text-ink-mid hidden sm:table-cell">
                          10-14 yrs
                        </th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium text-ink-mid hidden sm:table-cell">
                          15+ yrs
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {breedAgeMatrix.map((row) => (
                        <tr
                          key={row.breed}
                          className="border-b border-crease-light last:border-0"
                        >
                          <td className="px-3 py-2 text-xs font-medium text-ink-black">
                            {row.breed}
                          </td>
                          {row.ranges.map((r, i) => (
                            <td
                              key={r.age}
                              className={`px-3 py-2 text-right text-xs text-ink-mid ${i >= 2 ? "hidden sm:table-cell" : ""}`}
                            >
                              ${(r.low / 1000).toFixed(0)}K–${(r.high / 1000).toFixed(0)}K
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Price by Discipline Table */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-6 font-serif text-2xl font-semibold tracking-tight text-ink-black">
              Average Price by Discipline
            </h2>
            <div className="rounded-lg border-0 overflow-hidden shadow-flat bg-paper-white">
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

        {/* Recent Comps (Anonymized) */}
        <section className="bg-paper-white section-premium">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
                  Recent Comps
                </h2>
                <p className="mt-1 text-sm text-ink-mid">
                  Anonymized recent sales — names and specific details omitted
                </p>
              </div>
              <Link
                href="/just-sold"
                className="text-sm font-medium text-primary hover:underline"
              >
                View Just Sold →
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {visibleComps.map((comp) => (
                <div
                  key={comp.id}
                  className="flex items-center gap-4 rounded-lg border-0 bg-paper-cream p-4 shadow-flat"
                >
                  {/* Price */}
                  <div className="shrink-0">
                    <p className="font-serif text-lg font-bold text-ink-black">
                      {formatPrice(comp.price)}
                    </p>
                    <p className="text-[10px] text-ink-light">
                      {daysSinceStr(comp.date)}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-black">
                      {comp.breed} · {comp.age}yo
                    </p>
                    <p className="text-xs text-ink-mid">
                      {comp.discipline} · {comp.region}
                    </p>
                  </div>

                  {/* Days on market */}
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-ink-black">
                      {comp.daysOnMarket}d
                    </p>
                    <p className="text-[10px] text-ink-light">on market</p>
                  </div>
                </div>
              ))}
            </div>

            {recentComps.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllComps(!showAllComps)}
                className="mt-4 flex w-full items-center justify-center gap-1 rounded-md px-4 py-2 text-sm font-medium text-ink-mid hover:text-ink-black"
              >
                {showAllComps ? (
                  <>Show Less <ChevronUp className="h-3.5 w-3.5" /></>
                ) : (
                  <>Show More ({recentComps.length - 4} more) <ChevronDown className="h-3.5 w-3.5" /></>
                )}
              </button>
            )}
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
