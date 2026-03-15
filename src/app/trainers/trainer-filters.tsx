"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Stethoscope,
  ClipboardCheck,
  Video,
  GraduationCap,
  Search,
  Waypoints,
} from "lucide-react";

type Props = {
  params: Record<string, string | undefined>;
};

const serviceFilters = [
  { value: "ppe_supervision", label: "Pre-Purchase Eval", icon: Stethoscope },
  { value: "trial_ride", label: "Trial Rides", icon: Waypoints },
  { value: "training_assessment", label: "Assessments", icon: ClipboardCheck },
  { value: "horse_shopping", label: "Horse Shopping", icon: Search },
  { value: "video_evaluation", label: "Video Eval", icon: Video },
  { value: "lesson", label: "Lessons", icon: GraduationCap },
];

const disciplineFilters = [
  "Hunter/Jumper",
  "Dressage",
  "Eventing",
  "Western",
  "Reining",
  "Equitation",
];

export function TrainerDirectoryFilters({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (value) {
        sp.set(key, value);
      } else {
        sp.delete(key);
      }
      router.push(`/trainers?${sp.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-4">
      {/* Service type pills */}
      <div>
        <p className="mb-2 text-xs font-medium text-ink-light">
          Filter by service
        </p>
        <div className="flex flex-wrap gap-2">
          {serviceFilters.map((svc) => {
            const isActive = params.service === svc.value;
            const Icon = svc.icon;
            return (
              <button
                key={svc.value}
                type="button"
                onClick={() =>
                  updateFilter("service", isActive ? "" : svc.value)
                }
                className={`flex items-center gap-1.5 rounded-[var(--radius-card)] px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-ink-black text-paper-white"
                    : "bg-paper-white text-ink-mid shadow-flat hover:bg-paper-warm"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {svc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discipline pills */}
      <div>
        <p className="mb-2 text-xs font-medium text-ink-light">
          Filter by discipline
        </p>
        <div className="flex flex-wrap gap-1.5">
          {disciplineFilters.map((d) => {
            const isActive = params.discipline === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() =>
                  updateFilter("discipline", isActive ? "" : d)
                }
                className={`rounded-[var(--radius-card)] px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-ink-black text-paper-white"
                    : "bg-paper-white text-ink-mid shadow-flat hover:bg-paper-warm"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
