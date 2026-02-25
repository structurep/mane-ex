"use client";

import { useReducer, useActionState } from "react";
import { createListing, type ListingActionState } from "@/actions/listings";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WIZARD_STEPS } from "@/types/listings";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { StepBasicInfo } from "./steps/basic-info";
import { StepFarmLife } from "./steps/farm-life";
import { StepShowInfo } from "./steps/show-info";
import { StepVetInfo } from "./steps/vet-info";
import { StepMedia } from "./steps/media";
import { StepHistory } from "./steps/history";
import { StepPricing } from "./steps/pricing";

type WizardState = {
  step: number;
  data: Record<string, unknown>;
};

type WizardAction =
  | { type: "SET_STEP"; step: number }
  | { type: "SET_FIELD"; field: string; value: unknown }
  | { type: "SET_FIELDS"; fields: Record<string, unknown> };

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_FIELD":
      return { ...state, data: { ...state.data, [action.field]: action.value } };
    case "SET_FIELDS":
      return { ...state, data: { ...state.data, ...action.fields } };
    default:
      return state;
  }
}

export function ListingWizard() {
  const [state, dispatch] = useReducer(wizardReducer, {
    step: 0,
    data: {},
  });

  const [actionState, submitAction, isPending] = useActionState<ListingActionState, FormData>(
    createListing,
    {}
  );

  const currentStep = WIZARD_STEPS[state.step];
  const progress = ((state.step + 1) / WIZARD_STEPS.length) * 100;
  const isLastStep = state.step === WIZARD_STEPS.length - 1;

  const setField = (field: string, value: unknown) => {
    dispatch({ type: "SET_FIELD", field, value });
  };

  const stepProps = { data: state.data, setField };

  const steps = [
    <StepBasicInfo key="basic" {...stepProps} />,
    <StepFarmLife key="farm" {...stepProps} />,
    <StepShowInfo key="show" {...stepProps} />,
    <StepVetInfo key="vet" {...stepProps} />,
    <StepMedia key="media" {...stepProps} />,
    <StepHistory key="history" {...stepProps} />,
    <StepPricing key="pricing" {...stepProps} />,
  ];

  return (
    <div className="rounded-lg border-0 bg-paper-cream shadow-folded">
      {/* Step navigation */}
      <div className="border-b border-crease-light px-6 pt-4 pb-3">
        <div className="mb-3 flex items-center gap-2 overflow-x-auto">
          {WIZARD_STEPS.map((ws, i) => (
            <button
              key={ws.key}
              type="button"
              onClick={() => dispatch({ type: "SET_STEP", step: i })}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                i === state.step
                  ? "bg-primary text-primary-foreground"
                  : i < state.step
                    ? "bg-forest/10 text-forest"
                    : "bg-paper-warm text-ink-light"
              }`}
            >
              {ws.number}. {ws.label}
            </button>
          ))}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Step content */}
      <form
        action={submitAction}
        className="p-6"
      >
        {/* Hidden fields for all wizard data */}
        {Object.entries(state.data).map(([key, value]) => {
          if (Array.isArray(value)) {
            return value.map((v, i) => (
              <input key={`${key}-${i}`} type="hidden" name={key} value={String(v)} />
            ));
          }
          if (typeof value === "boolean") {
            return <input key={key} type="hidden" name={key} value={String(value)} />;
          }
          if (value != null && value !== "") {
            return <input key={key} type="hidden" name={key} value={String(value)} />;
          }
          return null;
        })}

        <div className="mb-4">
          <h2 className="font-heading text-lg font-semibold text-ink-black">
            {currentStep.label}
          </h2>
          <p className="text-sm text-ink-mid">
            {stepDescriptions[state.step]}
          </p>
        </div>

        {/* Error display */}
        {actionState.error && state.step === WIZARD_STEPS.length - 1 && (
          <div className="mb-4 rounded-md bg-red-light p-3 text-sm text-red">
            {actionState.error}
          </div>
        )}

        {/* Current step */}
        {steps[state.step]}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-crease-light pt-4">
          <Button
            type="button"
            variant="ghost"
            disabled={state.step === 0}
            onClick={() =>
              dispatch({ type: "SET_STEP", step: state.step - 1 })
            }
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>

          {isLastStep ? (
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Listing"}
              <Send className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() =>
                dispatch({ type: "SET_STEP", step: state.step + 1 })
              }
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

const stepDescriptions = [
  "Start with the basics — name, breed, age, height. This is what buyers see first.",
  "Where does this horse live? Daily care details build buyer confidence.",
  "Show history and discipline experience. Performance horses sell faster with documented records.",
  "Vet info and health history. Transparency here drives trust and higher completeness scores.",
  "Photos and videos are the #1 factor in listing engagement. Lead with your best shot.",
  "Ownership history, temperament, and suitability. Help buyers picture this horse in their barn.",
  "Set your price and warranty terms. Compliance disclosures are handled automatically.",
];
