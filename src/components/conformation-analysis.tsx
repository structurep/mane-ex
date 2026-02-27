"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Camera,
  RotateCw,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Target,
  Ruler,
  ArrowUpRight,
  Info,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ─── Types ─── */

type ConformationArea =
  | "head_neck"
  | "shoulder_withers"
  | "back_loin"
  | "hindquarters"
  | "legs_hooves"
  | "overall_balance";

type AnnotationPoint = {
  id: string;
  x: number; // % from left
  y: number; // % from top
  label: string;
  area: ConformationArea;
  detail: string;
};

type AreaScore = {
  area: ConformationArea;
  label: string;
  score: number;
  maxScore: number;
  notes: string;
  strengths: string[];
  concerns: string[];
};

type DisciplineSuitability = {
  discipline: string;
  score: number;
  reasoning: string;
};

/* ─── Sample Analysis Result ─── */

const SAMPLE_ANNOTATIONS: AnnotationPoint[] = [
  { id: "a1", x: 18, y: 20, label: "Throatlatch", area: "head_neck", detail: "Clean throatlatch allows for excellent flexion" },
  { id: "a2", x: 25, y: 15, label: "Poll", area: "head_neck", detail: "Well-defined poll, good head carriage potential" },
  { id: "a3", x: 35, y: 28, label: "Shoulder Angle", area: "shoulder_withers", detail: "~55° angle — ideal for dressage and jumping" },
  { id: "a4", x: 32, y: 22, label: "Withers", area: "shoulder_withers", detail: "Prominent withers for saddle fit" },
  { id: "a5", x: 50, y: 25, label: "Topline", area: "back_loin", detail: "Strong topline with good muscling" },
  { id: "a6", x: 48, y: 30, label: "Loin Coupling", area: "back_loin", detail: "Short, strong coupling — excellent power transfer" },
  { id: "a7", x: 68, y: 25, label: "Croup Angle", area: "hindquarters", detail: "~30° croup angle — balanced for collection and extension" },
  { id: "a8", x: 72, y: 35, label: "Stifle", area: "hindquarters", detail: "Good angulation for impulsion" },
  { id: "a9", x: 38, y: 72, label: "Front Cannons", area: "legs_hooves", detail: "Straight, proportional bone density" },
  { id: "a10", x: 65, y: 70, label: "Hock Set", area: "legs_hooves", detail: "Well-angled hocks, not too straight or sickled" },
  { id: "a11", x: 40, y: 85, label: "Front Hooves", area: "legs_hooves", detail: "Balanced hoof-pastern axis" },
  { id: "a12", x: 50, y: 45, label: "Heart Girth", area: "overall_balance", detail: "Deep heart girth — excellent cardio capacity" },
];

const SAMPLE_SCORES: AreaScore[] = [
  {
    area: "head_neck",
    label: "Head & Neck",
    score: 8.2,
    maxScore: 10,
    notes: "Clean throatlatch, well-set neck with good length. Slightly narrow jowl.",
    strengths: ["Clean throatlatch", "Good neck length", "Well-defined poll"],
    concerns: ["Slightly narrow jowl"],
  },
  {
    area: "shoulder_withers",
    label: "Shoulder & Withers",
    score: 7.8,
    maxScore: 10,
    notes: "Moderate shoulder angle (~55°). Prominent withers. Good freedom of movement.",
    strengths: ["Prominent withers", "Good shoulder freedom", "Strong muscles"],
    concerns: ["Could be slightly more laid-back for hunter work"],
  },
  {
    area: "back_loin",
    label: "Back & Loin",
    score: 8.5,
    maxScore: 10,
    notes: "Proportional back length, strong loin coupling. Excellent topline muscling.",
    strengths: ["Strong topline", "Short loin coupling", "Good muscling"],
    concerns: [],
  },
  {
    area: "hindquarters",
    label: "Hindquarters",
    score: 9.0,
    maxScore: 10,
    notes: "Well-angled croup, powerful gaskin, excellent stifle angulation.",
    strengths: ["Powerful gaskin", "Good croup angle", "Strong impulsion potential"],
    concerns: [],
  },
  {
    area: "legs_hooves",
    label: "Legs & Hooves",
    score: 7.6,
    maxScore: 10,
    notes: "Straight front limbs, good bone. Slight toeing out on left front.",
    strengths: ["Good bone density", "Well-angled hocks", "Balanced hoof-pastern axis"],
    concerns: ["Slight toe-out LF", "Monitor for uneven wear"],
  },
  {
    area: "overall_balance",
    label: "Overall Balance",
    score: 8.5,
    maxScore: 10,
    notes: "Proportions are above average for breed. Good symmetry front-to-back.",
    strengths: ["Good body proportions", "Deep heart girth", "Front-to-back balance"],
    concerns: [],
  },
];

const SAMPLE_SUITABILITY: DisciplineSuitability[] = [
  { discipline: "Dressage", score: 92, reasoning: "Powerful hindquarters, excellent balance, and topline strength support collection" },
  { discipline: "Jumping", score: 87, reasoning: "Good shoulder angle and strong back enable clean bascule over fences" },
  { discipline: "Eventing", score: 85, reasoning: "Versatile conformation with good endurance build and leg quality" },
  { discipline: "Hunter", score: 78, reasoning: "Good mover with balance, though shoulder could be more laid-back" },
  { discipline: "Western", score: 65, reasoning: "Frame slightly tall for western events, though balanced" },
];

/* ─── Photo Upload Component ─── */

export function ConformationUploader({
  onAnalyze,
}: {
  onAnalyze: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div
        className={`relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-crease-mid bg-paper-cream hover:border-primary/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onAnalyze();
        }}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={() => onAnalyze()}
        />
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-base font-medium text-ink-black">
              Upload a conformation photo
            </p>
            <p className="mt-1 text-sm text-ink-mid">
              Drag & drop or click to select. Best results from a broadside
              standing photo on level ground.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Camera className="mr-1 h-3 w-3" />
              JPG, PNG, HEIC
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Maximize2 className="mr-1 h-3 w-3" />
              Min 1200px wide
            </Badge>
          </div>
        </div>
      </div>

      {/* Photo guide */}
      <div className="rounded-lg bg-paper-warm p-4">
        <p className="mb-2 text-xs font-medium text-ink-dark">
          Photo Guidelines for Best Results
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs text-ink-mid">
          <div className="flex items-start gap-1.5">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-forest" />
            <span>Horse standing square on level ground</span>
          </div>
          <div className="flex items-start gap-1.5">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-forest" />
            <span>Broadside (perpendicular) angle</span>
          </div>
          <div className="flex items-start gap-1.5">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-forest" />
            <span>Good lighting, no harsh shadows</span>
          </div>
          <div className="flex items-start gap-1.5">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-forest" />
            <span>Full body visible (ears to hooves)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Annotated Photo Viewer ─── */

export function AnnotatedPhotoViewer({
  annotations,
  activeArea,
  onAreaSelect,
}: {
  annotations: AnnotationPoint[];
  activeArea: ConformationArea | null;
  onAreaSelect: (area: ConformationArea | null) => void;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  const visibleAnnotations = activeArea
    ? annotations.filter((a) => a.area === activeArea)
    : annotations;

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-paper-warm">
      {/* Placeholder background — simulates a horse photo */}
      <div className="absolute inset-0 bg-gradient-to-br from-paper-warm via-paper-cream to-paper-warm" />

      {/* Proportion guide lines */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Topline */}
        <line x1="20" y1="22" x2="70" y2="22" stroke="rgba(122,30,43,0.2)" strokeWidth="0.3" strokeDasharray="1,1" />
        {/* Underline */}
        <line x1="30" y1="65" x2="65" y2="65" stroke="rgba(122,30,43,0.2)" strokeWidth="0.3" strokeDasharray="1,1" />
        {/* Shoulder angle */}
        <line x1="32" y1="12" x2="38" y2="70" stroke="rgba(59,140,90,0.3)" strokeWidth="0.3" strokeDasharray="1,1" />
        {/* Hip angle */}
        <line x1="65" y1="20" x2="72" y2="68" stroke="rgba(59,140,90,0.3)" strokeWidth="0.3" strokeDasharray="1,1" />
      </svg>

      {/* Annotation points */}
      {visibleAnnotations.map((point) => {
        const isHovered = hoveredPoint === point.id;
        const isActiveArea = activeArea === point.area;

        return (
          <div
            key={point.id}
            className="absolute z-10"
            style={{ left: `${point.x}%`, top: `${point.y}%`, transform: "translate(-50%, -50%)" }}
            onMouseEnter={() => setHoveredPoint(point.id)}
            onMouseLeave={() => setHoveredPoint(null)}
            onClick={() => onAreaSelect(isActiveArea ? null : point.area)}
          >
            {/* Pulse ring */}
            <div
              className={`absolute inset-0 -m-2 rounded-full transition-opacity ${
                isHovered || isActiveArea ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="h-full w-full animate-ping rounded-full bg-primary/20" />
            </div>

            {/* Dot */}
            <div
              className={`relative h-3 w-3 cursor-pointer rounded-full border-2 border-white shadow-md transition-all ${
                isHovered || isActiveArea
                  ? "scale-150 bg-primary"
                  : "bg-primary/70"
              }`}
            />

            {/* Tooltip */}
            {isHovered && (
              <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-black/90 px-2.5 py-1.5 text-xs text-white shadow-lg">
                <p className="font-medium">{point.label}</p>
                <p className="mt-0.5 text-white/70">{point.detail}</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Area filter legend */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
        {[
          { area: "head_neck" as const, label: "Head" },
          { area: "shoulder_withers" as const, label: "Shoulder" },
          { area: "back_loin" as const, label: "Back" },
          { area: "hindquarters" as const, label: "Hind" },
          { area: "legs_hooves" as const, label: "Legs" },
          { area: "overall_balance" as const, label: "Balance" },
        ].map((item) => (
          <button
            key={item.area}
            onClick={() => onAreaSelect(activeArea === item.area ? null : item.area)}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
              activeArea === item.area
                ? "bg-primary text-white"
                : "bg-white/80 text-ink-dark backdrop-blur-sm hover:bg-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Score Detail Panel ─── */

function ScoreDetailPanel({
  score,
  isExpanded,
  onToggle,
  isActive,
  onActivate,
}: {
  score: AreaScore;
  isExpanded: boolean;
  onToggle: () => void;
  isActive: boolean;
  onActivate: () => void;
}) {
  const pct = (score.score / score.maxScore) * 100;
  const barColor =
    score.score >= 8 ? "bg-forest" : score.score >= 6 ? "bg-gold" : "bg-primary";

  return (
    <div
      className={`rounded-lg border transition-all ${
        isActive
          ? "border-primary/30 bg-primary/5 shadow-folded"
          : "border-crease-light bg-paper-white shadow-flat"
      }`}
    >
      <button
        className="flex w-full items-center gap-3 p-4"
        onClick={() => {
          onActivate();
          if (!isExpanded) onToggle();
        }}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink-dark">{score.label}</span>
            <span className="ml-2 text-sm font-bold text-ink-black">
              {score.score.toFixed(1)}
              <span className="font-normal text-ink-light">/{score.maxScore}</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-warm">
            <div
              className={`h-full rounded-full ${barColor} transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-ink-light" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-ink-light" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-crease-light px-4 pb-4 pt-3">
          <p className="text-sm text-ink-mid">{score.notes}</p>

          {score.strengths.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-forest">Strengths</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {score.strengths.map((s, i) => (
                  <Badge key={i} variant="secondary" className="bg-forest/10 text-forest text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {score.concerns.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-primary">Areas to Monitor</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {score.concerns.map((c, i) => (
                  <Badge key={i} variant="secondary" className="bg-primary/10 text-primary text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Discipline Suitability Radar ─── */

export function DisciplineSuitabilityChart({
  disciplines,
}: {
  disciplines: DisciplineSuitability[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-lg border-0 bg-paper-white p-6 shadow-flat">
      <div className="mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-gold" />
        <h3 className="font-heading text-base font-semibold text-ink-black">
          Discipline Suitability
        </h3>
      </div>

      <div className="space-y-3">
        {disciplines.map((d) => {
          const barColor =
            d.score >= 85 ? "bg-forest" : d.score >= 70 ? "bg-gold" : "bg-ink-faint";
          const labelColor =
            d.score >= 85
              ? "text-forest"
              : d.score >= 70
                ? "text-gold"
                : "text-ink-mid";

          return (
            <div key={d.discipline}>
              <button
                className="flex w-full items-center gap-3"
                onClick={() =>
                  setExpanded(expanded === d.discipline ? null : d.discipline)
                }
              >
                <span className="w-20 text-right text-sm text-ink-dark">
                  {d.discipline}
                </span>
                <div className="flex-1">
                  <div className="h-5 overflow-hidden rounded-full bg-paper-warm">
                    <div
                      className={`h-full rounded-full ${barColor} transition-all duration-700`}
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                </div>
                <span className={`w-10 text-right text-sm font-bold ${labelColor}`}>
                  {d.score}%
                </span>
              </button>
              {expanded === d.discipline && (
                <p className="mt-1 pl-[calc(5rem+12px)] text-xs text-ink-mid">
                  {d.reasoning}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-md bg-paper-warm p-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-light" />
        <p className="text-[11px] text-ink-light">
          Suitability scores are based on structural analysis only and do not
          account for training, temperament, or movement quality.
        </p>
      </div>
    </div>
  );
}

/* ─── Breed Standard Comparison ─── */

export function BreedStandardComparison({
  breed,
  scores,
}: {
  breed: string;
  scores: AreaScore[];
}) {
  // Mock breed standard averages
  const breedAverages: Record<string, number[]> = {
    Warmblood: [7.5, 7.8, 7.5, 7.8, 7.0, 7.5],
    Thoroughbred: [7.0, 8.0, 7.0, 8.2, 6.8, 7.2],
    "Quarter Horse": [7.2, 7.0, 7.8, 8.5, 7.5, 7.5],
    default: [7.0, 7.0, 7.0, 7.0, 7.0, 7.0],
  };

  const averages = breedAverages[breed] || breedAverages.default;

  return (
    <div className="rounded-lg border-0 bg-paper-white p-6 shadow-flat">
      <div className="mb-4 flex items-center gap-2">
        <Ruler className="h-5 w-5 text-blue" />
        <h3 className="font-heading text-base font-semibold text-ink-black">
          vs. {breed || "Breed"} Standard
        </h3>
      </div>

      <div className="space-y-3">
        {scores.map((s, i) => {
          const avg = averages[i];
          const diff = s.score - avg;
          const isAbove = diff > 0;

          return (
            <div key={s.area} className="flex items-center gap-3">
              <span className="w-24 text-right text-xs text-ink-mid">
                {s.label}
              </span>
              <div className="flex flex-1 items-center gap-2">
                {/* Avg marker */}
                <div className="relative h-4 flex-1 rounded-full bg-paper-warm">
                  {/* Horse's score */}
                  <div
                    className="absolute top-0 h-full rounded-full bg-primary/70"
                    style={{ width: `${(s.score / 10) * 100}%` }}
                  />
                  {/* Breed avg line */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-ink-dark/50"
                    style={{ left: `${(avg / 10) * 100}%` }}
                  />
                </div>
                <span
                  className={`w-12 text-right text-xs font-medium ${
                    isAbove ? "text-forest" : "text-primary"
                  }`}
                >
                  {isAbove ? "+" : ""}
                  {diff.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-ink-light">
        <span className="flex items-center gap-1">
          <div className="h-2 w-4 rounded-full bg-primary/70" />
          This horse
        </span>
        <span className="flex items-center gap-1">
          <div className="h-3 w-0.5 bg-ink-dark/50" />
          {breed || "Breed"} avg
        </span>
      </div>
    </div>
  );
}

/* ─── Full Analysis View ─── */

export function ConformationAnalysisResult() {
  const [activeArea, setActiveArea] = useState<ConformationArea | null>(null);
  const [expandedScore, setExpandedScore] = useState<ConformationArea | null>(null);

  const overallScore =
    SAMPLE_SCORES.reduce((sum, s) => sum + s.score, 0) / SAMPLE_SCORES.length;

  const gradeLabel =
    overallScore >= 8.5
      ? "Exceptional"
      : overallScore >= 7.5
        ? "Excellent"
        : overallScore >= 6.5
          ? "Good"
          : overallScore >= 5.5
            ? "Fair"
            : "Below Average";

  return (
    <div className="space-y-8">
      {/* Overall Score Card */}
      <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-paper-white to-primary/5 p-6 text-center shadow-lifted">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <p className="overline text-primary">CONFORMATION SCORE</p>
        </div>
        <p className="mt-2 font-serif text-5xl font-bold text-ink-black">
          {overallScore.toFixed(1)}
          <span className="text-2xl font-normal text-ink-light">/10</span>
        </p>
        <p className="mt-1 text-sm font-medium text-forest">{gradeLabel}</p>
        <p className="mt-2 text-xs text-ink-mid">
          Based on 6 structural areas assessed by AI conformation analysis
        </p>
      </div>

      {/* Annotated Photo + Scores */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Photo */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold text-ink-black">
              Annotation Map
            </h3>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              <RotateCw className="h-3 w-3" />
              Reset View
            </Button>
          </div>
          <AnnotatedPhotoViewer
            annotations={SAMPLE_ANNOTATIONS}
            activeArea={activeArea}
            onAreaSelect={setActiveArea}
          />
        </div>

        {/* Scores */}
        <div>
          <h3 className="mb-3 font-heading text-sm font-semibold text-ink-black">
            Area Scores
          </h3>
          <div className="space-y-2">
            {SAMPLE_SCORES.map((s) => (
              <ScoreDetailPanel
                key={s.area}
                score={s}
                isExpanded={expandedScore === s.area}
                onToggle={() =>
                  setExpandedScore(expandedScore === s.area ? null : s.area)
                }
                isActive={activeArea === s.area}
                onActivate={() =>
                  setActiveArea(activeArea === s.area ? null : s.area)
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid: Suitability + Breed Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DisciplineSuitabilityChart disciplines={SAMPLE_SUITABILITY} />
        <BreedStandardComparison breed="Warmblood" scores={SAMPLE_SCORES} />
      </div>

      {/* Comparison CTA */}
      <div className="rounded-lg bg-paper-warm p-6 text-center">
        <h3 className="font-heading text-base font-semibold text-ink-black">
          Compare with another horse
        </h3>
        <p className="mt-1 text-sm text-ink-mid">
          Upload a second photo to see side-by-side conformation scores.
        </p>
        <Button variant="outline" className="mt-4 gap-2">
          <ArrowUpRight className="h-4 w-4" />
          Add Comparison Photo
        </Button>
      </div>
    </div>
  );
}

/* ─── Conformation History (for Passport integration) ─── */

export function ConformationHistory({
  entries,
}: {
  entries: {
    date: string;
    overallScore: number;
    horseName: string;
    assessedBy: string;
  }[];
}) {
  if (entries.length === 0) return null;

  const latest = entries[0];
  const trend =
    entries.length >= 2
      ? entries[0].overallScore > entries[1].overallScore
        ? "improving"
        : entries[0].overallScore < entries[1].overallScore
          ? "declining"
          : "stable"
      : "stable";

  return (
    <div className="space-y-3">
      {/* Current */}
      <div className="flex items-center gap-4 rounded-md bg-paper-warm p-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <span className="text-lg font-bold text-primary">
            {latest.overallScore.toFixed(1)}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-ink-dark">
            Current Conformation Score
          </p>
          <p className="text-xs text-ink-mid">
            Assessed {latest.date} by {latest.assessedBy}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={`ml-auto text-xs ${
            trend === "improving"
              ? "bg-forest/10 text-forest"
              : trend === "declining"
                ? "bg-primary/10 text-primary"
                : "bg-paper-warm text-ink-mid"
          }`}
        >
          {trend === "improving" ? "↑ Improving" : trend === "declining" ? "↓ Declining" : "→ Stable"}
        </Badge>
      </div>

      {/* History */}
      {entries.length > 1 && (
        <div className="space-y-1">
          {entries.slice(1).map((entry, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-1.5 text-xs text-ink-mid">
              <span>{entry.date}</span>
              <span className="font-medium text-ink-dark">
                {entry.overallScore.toFixed(1)}/10
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
