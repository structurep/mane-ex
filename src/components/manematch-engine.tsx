"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Brain,
  ThumbsUp,
  ThumbsDown,
  Heart,
  ChevronDown,
  ChevronUp,
  Sliders,
  RefreshCw,
  Target,
  TrendingUp,
  Eye,
  MapPin,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ─── Types ─── */

type MatchFactor = {
  factor: string;
  weight: number; // 0-1
  matchScore: number; // 0-100
  explanation: string;
};

type MatchedHorse = {
  id: string;
  slug: string;
  name: string;
  breed: string;
  age: number;
  height: string;
  price: number;
  location: string;
  discipline: string[];
  overallMatch: number;
  factors: MatchFactor[];
  whyMatch: string;
  dealbreakers: string[];
};

type UserPreference = {
  id: string;
  label: string;
  value: string;
  importance: "must_have" | "nice_to_have" | "flexible";
  learned: boolean; // Was this inferred from behavior?
};

/* ─── Sample Data ─── */

const SAMPLE_PREFERENCES: UserPreference[] = [
  { id: "p1", label: "Discipline", value: "Hunter/Jumper", importance: "must_have", learned: false },
  { id: "p2", label: "Price Range", value: "$30,000 – $75,000", importance: "must_have", learned: false },
  { id: "p3", label: "Age", value: "6–12 years", importance: "nice_to_have", learned: false },
  { id: "p4", label: "Height", value: "16.0hh+", importance: "nice_to_have", learned: true },
  { id: "p5", label: "Location", value: "East Coast", importance: "flexible", learned: false },
  { id: "p6", label: "Color Preference", value: "Bay, Dark Bay", importance: "flexible", learned: true },
  { id: "p7", label: "Registry", value: "KWPN, Holsteiner, Hanoverian", importance: "nice_to_have", learned: true },
];

const SAMPLE_MATCHES: MatchedHorse[] = [
  {
    id: "m1",
    slug: "midnight-storm",
    name: "Midnight Storm",
    breed: "KWPN",
    age: 8,
    height: "16.2hh",
    price: 65000,
    location: "Wellington, FL",
    discipline: ["Hunter/Jumper"],
    overallMatch: 96,
    whyMatch: "Ideal age for competition, strong hunter/jumper bloodlines, within budget, and located in your preferred region. This horse's conformation scores align with your preference for athletic, balanced movers.",
    dealbreakers: [],
    factors: [
      { factor: "Discipline", weight: 0.25, matchScore: 100, explanation: "Competed at 3'6\" hunters — exact discipline match" },
      { factor: "Price", weight: 0.20, matchScore: 95, explanation: "$65K is within your $30K-$75K range (87th percentile)" },
      { factor: "Age & Experience", weight: 0.15, matchScore: 98, explanation: "8yo with show miles — ideal experience level" },
      { factor: "Location", weight: 0.10, matchScore: 100, explanation: "Wellington, FL — East Coast preferred region" },
      { factor: "Conformation", weight: 0.15, matchScore: 92, explanation: "8.3/10 overall — above your saved horses' average" },
      { factor: "Bloodlines", weight: 0.10, matchScore: 95, explanation: "Contender sire line — proven in sport" },
      { factor: "Behavior Fit", weight: 0.05, matchScore: 88, explanation: "Similar to horses you've saved and viewed 3+ times" },
    ],
  },
  {
    id: "m2",
    slug: "golden-promise",
    name: "Golden Promise",
    breed: "Hanoverian",
    age: 10,
    height: "16.1hh",
    price: 48000,
    location: "Ocala, FL",
    discipline: ["Hunter/Jumper", "Equitation"],
    overallMatch: 93,
    whyMatch: "Strong equitation prospect with hunter/jumper experience. Excellent price-to-quality ratio. Show record matches your browsing pattern for experienced, safe horses.",
    dealbreakers: [],
    factors: [
      { factor: "Discipline", weight: 0.25, matchScore: 95, explanation: "Hunter/Jumper + Equitation — bonus discipline" },
      { factor: "Price", weight: 0.20, matchScore: 100, explanation: "$48K — sweet spot of your range" },
      { factor: "Age & Experience", weight: 0.15, matchScore: 90, explanation: "10yo — experienced but years of competing left" },
      { factor: "Location", weight: 0.10, matchScore: 95, explanation: "Ocala, FL — short drive from Wellington" },
      { factor: "Conformation", weight: 0.15, matchScore: 88, explanation: "7.9/10 overall — solid conformation" },
      { factor: "Bloodlines", weight: 0.10, matchScore: 85, explanation: "Hanoverian premium — strong sport horse genetics" },
      { factor: "Behavior Fit", weight: 0.05, matchScore: 90, explanation: "You've viewed similar listings 5+ times" },
    ],
  },
  {
    id: "m3",
    slug: "sapphire-blue",
    name: "Sapphire Blue",
    breed: "Thoroughbred",
    age: 7,
    height: "16.3hh",
    price: 35000,
    location: "Aiken, SC",
    discipline: ["Eventing", "Hunter/Jumper"],
    overallMatch: 87,
    whyMatch: "Versatile Thoroughbred with hunter/jumper capability. Great value proposition — lower price point with high athletic potential. Slightly outside your primary discipline focus.",
    dealbreakers: ["Primary discipline is Eventing (not Hunter/Jumper)"],
    factors: [
      { factor: "Discipline", weight: 0.25, matchScore: 75, explanation: "Primary: Eventing, but does Hunter/Jumper" },
      { factor: "Price", weight: 0.20, matchScore: 100, explanation: "$35K — well within budget, strong value" },
      { factor: "Age & Experience", weight: 0.15, matchScore: 95, explanation: "7yo — prime career years ahead" },
      { factor: "Location", weight: 0.10, matchScore: 85, explanation: "Aiken, SC — East Coast, 4hr from Wellington" },
      { factor: "Conformation", weight: 0.15, matchScore: 82, explanation: "8.0/10 — excellent TB conformation" },
      { factor: "Bloodlines", weight: 0.10, matchScore: 78, explanation: "TB — quality racing bloodlines adapted to sport" },
      { factor: "Behavior Fit", weight: 0.05, matchScore: 80, explanation: "Similar body type to your Dream Barn picks" },
    ],
  },
];

/* ─── Match Card Component ─── */

function MatchCard({
  horse,
  onFeedback,
}: {
  horse: MatchedHorse;
  onFeedback: (id: string, type: "interested" | "not_interested" | "save") => void;
}) {
  const [showFactors, setShowFactors] = useState(false);

  const matchColor =
    horse.overallMatch >= 90
      ? "text-forest"
      : horse.overallMatch >= 80
        ? "text-gold"
        : "text-ink-mid";

  const matchBg =
    horse.overallMatch >= 90
      ? "bg-forest"
      : horse.overallMatch >= 80
        ? "bg-gold"
        : "bg-ink-faint";

  return (
    <div className="rounded-lg border-0 bg-paper-white shadow-flat transition-elevation hover-lift hover:shadow-lifted">
      {/* Header */}
      <div className="flex items-start justify-between p-5">
        <div className="flex items-start gap-4">
          {/* Match ring */}
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
            <svg className="absolute inset-0" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-paper-warm"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${(horse.overallMatch / 100) * 150.8} 150.8`}
                strokeLinecap="round"
                className={matchColor}
                transform="rotate(-90 28 28)"
              />
            </svg>
            <span className={`text-sm font-bold ${matchColor}`}>
              {horse.overallMatch}%
            </span>
          </div>

          <div>
            <Link
              href={`/horses/${horse.slug}`}
              className="text-base font-medium text-ink-black hover:text-primary"
            >
              {horse.name}
            </Link>
            <p className="mt-0.5 text-sm text-ink-mid">
              {horse.breed} · {horse.age}yo · {horse.height}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-ink-light">
              <MapPin className="h-3 w-3" />
              {horse.location}
            </div>
          </div>
        </div>

        <p className="font-serif text-lg font-bold text-ink-black">
          ${horse.price.toLocaleString()}
        </p>
      </div>

      {/* Why this matches */}
      <div className="border-t border-crease-light px-5 py-3">
        <div className="flex items-start gap-2">
          <Brain className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div>
            <p className="text-xs font-medium text-gold">Why this matches</p>
            <p className="mt-0.5 text-sm text-ink-mid">{horse.whyMatch}</p>
          </div>
        </div>

        {horse.dealbreakers.length > 0 && (
          <div className="mt-2 flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-medium text-primary">Things to consider</p>
              {horse.dealbreakers.map((d, i) => (
                <p key={i} className="mt-0.5 text-xs text-ink-mid">{d}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Factor breakdown (expandable) */}
      <div className="border-t border-crease-light">
        <button
          className="flex w-full items-center justify-between px-5 py-2 text-xs text-ink-light hover:text-ink-mid"
          onClick={() => setShowFactors(!showFactors)}
        >
          <span className="flex items-center gap-1">
            <Sliders className="h-3 w-3" />
            Match Factor Breakdown
          </span>
          {showFactors ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>

        {showFactors && (
          <div className="space-y-2 px-5 pb-4">
            {horse.factors.map((f) => (
              <div key={f.factor}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-dark">
                    {f.factor}
                    <span className="ml-1 text-ink-faint">
                      ({Math.round(f.weight * 100)}%)
                    </span>
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      f.matchScore >= 90
                        ? "text-forest"
                        : f.matchScore >= 70
                          ? "text-gold"
                          : "text-primary"
                    }`}
                  >
                    {f.matchScore}%
                  </span>
                </div>
                <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-paper-warm">
                  <div
                    className={`h-full rounded-full ${matchBg} transition-all duration-500`}
                    style={{ width: `${f.matchScore}%` }}
                  />
                </div>
                <p className="mt-0.5 text-[10px] text-ink-light">
                  {f.explanation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-crease-light px-5 py-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => onFeedback(horse.id, "not_interested")}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          Not for me
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => onFeedback(horse.id, "save")}
        >
          <Heart className="h-3.5 w-3.5" />
          Save
        </Button>
        <Button size="sm" className="flex-1 gap-1.5" asChild>
          <Link href={`/horses/${horse.slug}`}>
            <Eye className="h-3.5 w-3.5" />
            View
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ─── Preference Learning Panel ─── */

function PreferenceLearningPanel({
  preferences,
}: {
  preferences: UserPreference[];
}) {
  const importanceColors: Record<string, string> = {
    must_have: "bg-primary/10 text-primary",
    nice_to_have: "bg-gold/10 text-gold",
    flexible: "bg-paper-warm text-ink-mid",
  };

  const importanceLabels: Record<string, string> = {
    must_have: "Must Have",
    nice_to_have: "Nice to Have",
    flexible: "Flexible",
  };

  return (
    <div className="rounded-lg border-0 bg-paper-white p-5 shadow-flat">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-gold" />
          <h3 className="font-heading text-sm font-semibold text-ink-black">
            Your Preferences
          </h3>
        </div>
        <Button variant="ghost" size="sm" className="gap-1 text-xs">
          <Sliders className="h-3 w-3" />
          Edit
        </Button>
      </div>

      <div className="space-y-2">
        {preferences.map((pref) => (
          <div
            key={pref.id}
            className="flex items-center justify-between rounded-md bg-paper-cream p-2.5"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-ink-dark">
                  {pref.label}
                </span>
                {pref.learned && (
                  <Badge variant="secondary" className="bg-gold/10 text-gold text-[9px] px-1.5">
                    <Sparkles className="mr-0.5 h-2.5 w-2.5" />
                    Learned
                  </Badge>
                )}
              </div>
              <p className="text-xs text-ink-mid">{pref.value}</p>
            </div>
            <Badge
              variant="secondary"
              className={`text-[10px] ${importanceColors[pref.importance]}`}
            >
              {importanceLabels[pref.importance]}
            </Badge>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-md bg-paper-warm p-2.5">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
        <p className="text-[11px] text-ink-mid">
          ManeMatch learns from your browsing, saves, and feedback. Items marked
          &quot;Learned&quot; were inferred from your behavior.
        </p>
      </div>
    </div>
  );
}

/* ─── Match Stats ─── */

function MatchStats() {
  return (
    <div className="rounded-lg border-0 bg-paper-white p-5 shadow-flat">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-forest" />
        <h3 className="font-heading text-sm font-semibold text-ink-black">
          Match Activity
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md bg-paper-cream p-3 text-center">
          <p className="font-serif text-2xl font-bold text-ink-black">47</p>
          <p className="text-[10px] text-ink-light">Horses Analyzed</p>
        </div>
        <div className="rounded-md bg-paper-cream p-3 text-center">
          <p className="font-serif text-2xl font-bold text-forest">12</p>
          <p className="text-[10px] text-ink-light">Strong Matches</p>
        </div>
        <div className="rounded-md bg-paper-cream p-3 text-center">
          <p className="font-serif text-2xl font-bold text-gold">89%</p>
          <p className="text-[10px] text-ink-light">Accuracy Rate</p>
        </div>
        <div className="rounded-md bg-paper-cream p-3 text-center">
          <p className="font-serif text-2xl font-bold text-blue">3</p>
          <p className="text-[10px] text-ink-light">New This Week</p>
        </div>
      </div>
    </div>
  );
}

/* ─── ISO Auto-Match ─── */

export function ISOAutoMatch({
  isoTitle,
  matchCount,
  topMatches,
}: {
  isoTitle: string;
  matchCount: number;
  topMatches: { name: string; matchPercent: number; slug: string }[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-gold/20 bg-gold/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-gold" />
          <span className="text-sm font-medium text-ink-dark">
            {matchCount} listing{matchCount !== 1 ? "s" : ""} match your ISO
          </span>
        </div>
        <button
          className="text-xs text-gold hover:underline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide" : "Show"} matches
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2">
          {topMatches.map((m, i) => (
            <Link
              key={i}
              href={`/horses/${m.slug}`}
              className="flex items-center justify-between rounded-md bg-paper-white p-2 text-sm transition-colors hover:bg-paper-warm"
            >
              <span className="font-medium text-ink-dark">{m.name}</span>
              <Badge variant="secondary" className="bg-gold/10 text-gold text-xs">
                {m.matchPercent}% match
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Export: Full ManeMatch Dashboard ─── */

export function ManeMatchDashboard() {
  const [matches, setMatches] = useState(SAMPLE_MATCHES);
  const [dismissedCount, setDismissedCount] = useState(0);

  const handleFeedback = (
    id: string,
    type: "interested" | "not_interested" | "save"
  ) => {
    if (type === "not_interested") {
      setMatches((prev) => prev.filter((m) => m.id !== id));
      setDismissedCount((c) => c + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <h2 className="font-heading text-lg font-semibold text-ink-black">
              Your Matches
            </h2>
            <Badge variant="secondary" className="bg-forest/10 text-forest text-xs">
              {matches.length} active
            </Badge>
          </div>
          <p className="mt-1 text-sm text-ink-mid">
            Updated continuously as new listings are added
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Match cards */}
        <div className="space-y-4 lg:col-span-2">
          {matches.map((horse) => (
            <MatchCard
              key={horse.id}
              horse={horse}
              onFeedback={handleFeedback}
            />
          ))}

          {matches.length === 0 && (
            <div className="rounded-lg bg-paper-white p-12 text-center shadow-flat">
              <ThumbsUp className="mx-auto mb-4 h-10 w-10 text-ink-faint" />
              <p className="font-heading text-lg font-medium text-ink-black">
                All caught up!
              </p>
              <p className="mt-1 text-sm text-ink-mid">
                You&apos;ve reviewed all current matches. We&apos;ll notify you
                when new horses match your preferences.
              </p>
            </div>
          )}

          {dismissedCount > 0 && (
            <p className="text-center text-xs text-ink-light">
              {dismissedCount} horse{dismissedCount !== 1 ? "s" : ""} dismissed
              — ManeMatch is learning from your feedback
            </p>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <PreferenceLearningPanel preferences={SAMPLE_PREFERENCES} />
          <MatchStats />
        </div>
      </div>
    </div>
  );
}
