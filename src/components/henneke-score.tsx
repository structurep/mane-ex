"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

/* ─── Henneke Body Condition Score (1-9 Scale) ─── */

const scoreDescriptions: Record<
  number,
  { label: string; description: string; flag?: "danger" | "warning" | "ideal" }
> = {
  1: {
    label: "Poor",
    description:
      "Extremely emaciated. No fatty tissue, bone structure easily visible. Spinous processes, ribs, tailhead, and hip joints prominent.",
    flag: "danger",
  },
  2: {
    label: "Very Thin",
    description:
      "Emaciated. Slight fat cover over vertebrae. Spinous processes, ribs, tailhead, and hip joints prominent. Withers, shoulders, and neck structure faintly discernible.",
    flag: "danger",
  },
  3: {
    label: "Thin",
    description:
      "Fat buildup about halfway on spinous processes. Slight fat cover over ribs. Tailhead prominent but individual vertebrae not visible.",
    flag: "warning",
  },
  4: {
    label: "Moderately Thin",
    description:
      "Negative crease along back. Faint outline of ribs discernible. Tailhead prominence depends on conformation. Hip joints not discernible.",
    flag: "ideal",
  },
  5: {
    label: "Moderate",
    description:
      "Back level. Ribs cannot be visually distinguished but can be easily felt. Fat around tailhead beginning to feel spongy. Withers appear rounded, shoulders and neck blend smoothly.",
    flag: "ideal",
  },
  6: {
    label: "Moderately Fleshy",
    description:
      "May have slight crease down back. Fat over ribs feels spongy. Fat around tailhead feels soft. Fat beginning to be deposited along sides of withers, behind shoulders, and along neck.",
    flag: "ideal",
  },
  7: {
    label: "Fleshy",
    description:
      "May have crease down back. Individual ribs can be felt with pressure. Fat between ribs noticeable. Fat around tailhead is soft. Fat deposits along withers, behind shoulders, and along neck.",
    flag: "warning",
  },
  8: {
    label: "Fat",
    description:
      "Crease down back. Difficult to feel ribs. Fat around tailhead very soft. Area along withers filled with fat, behind shoulders filled, noticeable thickening of neck.",
    flag: "warning",
  },
  9: {
    label: "Extremely Fat",
    description:
      "Obvious crease down back. Patchy fat over ribs. Bulging fat around tailhead, along withers, behind shoulders, and along neck. Fat along inner thighs may cause them to rub.",
    flag: "danger",
  },
};

const assessmentAreas = [
  "Neck & Crest",
  "Withers",
  "Behind Shoulder",
  "Ribs",
  "Loin / Back",
  "Tailhead",
];

const flagColors = {
  danger: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-800",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-800",
  },
  ideal: {
    bg: "bg-forest/5",
    border: "border-forest/20",
    text: "text-forest",
    badge: "bg-forest/10 text-forest",
  },
};

/* ─── Interactive Selector (for listing wizard) ─── */

interface HennekeScoreSelectorProps {
  value: number | null;
  onChange: (score: number) => void;
}

export function HennekeScoreSelector({
  value,
  onChange,
}: HennekeScoreSelectorProps) {
  const [showGuide, setShowGuide] = useState(false);
  const selected = value ? scoreDescriptions[value] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-ink-black">
          Body Condition Score (Henneke 1-9)
        </label>
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Info className="h-3 w-3" />
          {showGuide ? "Hide guide" : "What is this?"}
        </button>
      </div>

      {/* Guide panel */}
      {showGuide && (
        <div className="rounded-lg border border-crease-light bg-paper-cream p-4">
          <p className="mb-2 text-xs font-semibold text-ink-dark">
            Henneke Body Condition Scoring System
          </p>
          <p className="mb-3 text-xs text-ink-mid">
            Developed by Dr. Don Henneke (Texas A&M, 1983). The industry
            standard for objectively assessing a horse&apos;s body condition by
            evaluating fat deposits at 6 anatomical points. Used by
            veterinarians, law enforcement, and breed registries.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {assessmentAreas.map((area) => (
              <span
                key={area}
                className="rounded-full bg-paper-warm px-2.5 py-1 text-[10px] font-medium text-ink-mid"
              >
                {area}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-ink-light">
            Ideal range: 4-6. Scores below 3 or above 8 may require
            veterinary attention.
          </p>
        </div>
      )}

      {/* Score selector — visual scale */}
      <div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((score) => {
            const desc = scoreDescriptions[score];
            const isSelected = value === score;
            const isIdeal = score >= 4 && score <= 6;

            return (
              <button
                key={score}
                type="button"
                onClick={() => onChange(score)}
                className={`flex flex-1 flex-col items-center rounded-lg border-2 py-2 transition-all ${
                  isSelected
                    ? desc.flag === "ideal"
                      ? "border-forest bg-forest/10"
                      : desc.flag === "warning"
                        ? "border-amber-400 bg-amber-50"
                        : "border-red-400 bg-red-50"
                    : isIdeal
                      ? "border-crease-light bg-forest/5 hover:border-forest/40"
                      : "border-crease-light bg-paper-white hover:border-ink-faint"
                }`}
                title={`${score} — ${desc.label}`}
              >
                <span
                  className={`text-lg font-bold ${
                    isSelected
                      ? desc.flag === "ideal"
                        ? "text-forest"
                        : desc.flag === "warning"
                          ? "text-amber-700"
                          : "text-red-700"
                      : "text-ink-mid"
                  }`}
                >
                  {score}
                </span>
                <span className="mt-0.5 hidden text-[9px] leading-tight text-ink-light sm:block">
                  {desc.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Ideal range indicator */}
        <div className="mt-1.5 flex items-center justify-center">
          <div className="flex items-center gap-1 text-[10px] text-ink-light">
            <span>1 — Emaciated</span>
            <span className="mx-1">|</span>
            <span className="font-medium text-forest">4-6 Ideal</span>
            <span className="mx-1">|</span>
            <span>9 — Obese</span>
          </div>
        </div>
      </div>

      {/* Selected score detail */}
      {selected && value && (
        <div
          className={`rounded-lg border p-4 ${
            flagColors[selected.flag || "ideal"].bg
          } ${flagColors[selected.flag || "ideal"].border}`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                flagColors[selected.flag || "ideal"].badge
              }`}
            >
              BCS {value} — {selected.label}
            </span>
            {selected.flag === "ideal" && (
              <span className="text-xs text-forest">Within ideal range</span>
            )}
            {selected.flag === "warning" && (
              <span className="text-xs text-amber-600">
                Outside ideal range
              </span>
            )}
            {selected.flag === "danger" && (
              <span className="text-xs text-red-600">
                Requires veterinary attention
              </span>
            )}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-mid">
            {selected.description}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Display Badge (for listing detail page) ─── */

interface HennekeScoreDisplayProps {
  score: number;
  compact?: boolean;
}

export function HennekeScoreDisplay({
  score,
  compact = false,
}: HennekeScoreDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const desc = scoreDescriptions[score];
  if (!desc) return null;

  const colors = flagColors[desc.flag || "ideal"];

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${colors.badge}`}
        title={`Henneke Body Condition Score: ${score}/9 — ${desc.label}`}
      >
        BCS {score}/9
      </span>
    );
  }

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg} p-4`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${colors.badge}`}
          >
            {score}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-black">
              Body Condition: {desc.label}
            </p>
            <p className="text-xs text-ink-mid">
              Henneke Scale — {score}/9
              {desc.flag === "ideal" && " (Ideal range)"}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-ink-light" />
        ) : (
          <ChevronDown className="h-4 w-4 text-ink-light" />
        )}
      </button>
      {expanded && (
        <div className="mt-3 border-t border-crease-light pt-3">
          <p className="text-xs leading-relaxed text-ink-mid">
            {desc.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {assessmentAreas.map((area) => (
              <span
                key={area}
                className="rounded-full bg-paper-white px-2 py-0.5 text-[10px] text-ink-mid"
              >
                {area}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-ink-light">
            Henneke BCS developed by Dr. Don Henneke, Texas A&M University, 1983.
            Assessed at 6 anatomical points.
          </p>
        </div>
      )}
    </div>
  );
}
