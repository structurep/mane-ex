"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import type { OnboardingData } from "../onboarding-flow";

export function LocationStep({
  data,
  saving,
  onNext,
  onBack,
}: {
  data: OnboardingData;
  saving: boolean;
  onNext: (updates: Partial<OnboardingData>) => void;
  onBack: () => void;
}) {
  const [city, setCity] = useState(data.city);
  const [state, setState] = useState(data.state);
  const [zip, setZip] = useState(data.zip);

  function handleSubmit() {
    onNext({
      city: city.trim(),
      state: state.trim().toUpperCase(),
      zip: zip.trim(),
    });
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2.5">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink-black">
            Where are you located?
          </h1>
          <p className="mt-0.5 text-sm text-ink-mid">
            Helps match you with nearby listings and barns.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <Label htmlFor="onboard-city">City</Label>
          <Input
            id="onboard-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Wellington"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="onboard-state">State</Label>
          <Input
            id="onboard-state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="FL"
            maxLength={2}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="onboard-zip">ZIP Code</Label>
          <Input
            id="onboard-zip"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="33414"
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
