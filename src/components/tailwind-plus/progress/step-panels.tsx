"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type StepStatus = "complete" | "current" | "upcoming";

export interface Step {
  id: string;
  name: string;
  status: StepStatus;
  href?: string;
}

interface StepPanelsProps {
  steps: Step[];
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export function StepPanels({ steps, onStepClick, className }: StepPanelsProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol
        role="list"
        className="divide-y divide-crease-light rounded-lg border border-crease-light md:flex md:divide-y-0"
      >
        {steps.map((step, stepIdx) => (
          <li key={step.id} className="relative md:flex md:flex-1">
            <button
              type="button"
              onClick={() => onStepClick?.(step.id)}
              disabled={!onStepClick}
              className={cn(
                "group flex w-full items-center text-left",
                onStepClick && "cursor-pointer"
              )}
              aria-current={step.status === "current" ? "step" : undefined}
            >
              <span className="flex items-center px-5 py-3.5 text-sm font-medium">
                {step.status === "complete" ? (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-saddle group-hover:bg-saddle/80">
                    <Check className="size-4 text-paper-white" />
                  </span>
                ) : step.status === "current" ? (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-saddle">
                    <span className="text-[13px] font-semibold text-saddle">{step.id}</span>
                  </span>
                ) : (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-crease-mid group-hover:border-crease-dark">
                    <span className="text-[13px] text-ink-faint group-hover:text-ink-mid">
                      {step.id}
                    </span>
                  </span>
                )}
                <span
                  className={cn(
                    "ml-3 text-sm font-medium",
                    step.status === "complete" && "text-ink-dark",
                    step.status === "current" && "text-saddle",
                    step.status === "upcoming" &&
                      "text-ink-faint group-hover:text-ink-mid"
                  )}
                >
                  {step.name}
                </span>
              </span>
            </button>

            {stepIdx !== steps.length - 1 && (
              <div
                aria-hidden="true"
                className="absolute top-0 right-0 hidden h-full w-5 md:block"
              >
                <svg
                  fill="none"
                  viewBox="0 0 22 80"
                  preserveAspectRatio="none"
                  className="size-full text-crease-light"
                >
                  <path
                    d="M0 -2L20 40L0 82"
                    stroke="currentcolor"
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
