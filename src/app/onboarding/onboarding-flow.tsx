"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingStep, completeOnboarding } from "@/actions/onboarding";
import { WelcomeStep } from "./steps/welcome";
import { ProfileSetupStep } from "./steps/profile-setup";
import { LocationStep } from "./steps/location";
import { BarnConnectStep } from "./steps/barn-connect";
import { CompleteStep } from "./steps/complete";

const STEPS = ["welcome", "profile", "location", "barn", "complete"] as const;
type Step = (typeof STEPS)[number];

export type OnboardingData = {
  display_name: string;
  avatar_url: string;
  cover_url: string;
  bio: string;
  city: string;
  state: string;
  zip: string;
  role: string;
};

export function OnboardingFlow({
  userId,
  initialData,
}: {
  userId: string;
  initialData: OnboardingData;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [data, setData] = useState<OnboardingData>(initialData);
  const [saving, setSaving] = useState(false);

  const currentIndex = STEPS.indexOf(step);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  async function handleNext(updates?: Partial<OnboardingData>) {
    if (updates) {
      const newData = { ...data, ...updates };
      setData(newData);

      // Persist to DB
      setSaving(true);
      await saveOnboardingStep(updates);
      setSaving(false);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < STEPS.length) {
      setStep(STEPS[nextIndex]);
    }
  }

  function handleBack() {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setStep(STEPS[prevIndex]);
    }
  }

  async function handleComplete() {
    setSaving(true);
    await completeOnboarding();
    setSaving(false);
    router.push("/dashboard");
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-ink-light">
          <span>Step {currentIndex + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-warm">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      {step === "welcome" && (
        <WelcomeStep
          role={data.role}
          onNext={(role) => handleNext({ role })}
        />
      )}
      {step === "profile" && (
        <ProfileSetupStep
          userId={userId}
          data={data}
          saving={saving}
          onNext={(updates) => handleNext(updates)}
          onBack={handleBack}
        />
      )}
      {step === "location" && (
        <LocationStep
          data={data}
          saving={saving}
          onNext={(updates) => handleNext(updates)}
          onBack={handleBack}
        />
      )}
      {step === "barn" && (
        <BarnConnectStep
          onNext={() => handleNext()}
          onBack={handleBack}
        />
      )}
      {step === "complete" && (
        <CompleteStep
          data={data}
          saving={saving}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
