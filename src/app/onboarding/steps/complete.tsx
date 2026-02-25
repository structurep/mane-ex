"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import type { OnboardingData } from "../onboarding-flow";

export function CompleteStep({
  data,
  saving,
  onComplete,
}: {
  data: OnboardingData;
  saving: boolean;
  onComplete: () => void;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-forest/10">
        <CheckCircle className="h-8 w-8 text-forest" />
      </div>

      <h1 className="font-serif text-3xl font-bold text-ink-black">
        You are all set!
      </h1>
      <p className="mx-auto mt-2 max-w-md text-ink-mid">
        Your profile is ready. Start browsing horses, connecting with barns,
        or listing your first horse.
      </p>

      {/* Summary */}
      <div className="mx-auto mt-8 max-w-sm rounded-lg bg-paper-cream p-5 text-left shadow-flat">
        <div className="space-y-3">
          {data.avatar_url && (
            <div className="flex items-center gap-3">
              <img
                src={data.avatar_url}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-ink-black">
                  {data.display_name}
                </p>
                <p className="text-xs capitalize text-ink-light">
                  {data.role}
                </p>
              </div>
            </div>
          )}
          {!data.avatar_url && data.display_name && (
            <div>
              <p className="text-sm font-medium text-ink-black">
                {data.display_name}
              </p>
              <p className="text-xs capitalize text-ink-light">{data.role}</p>
            </div>
          )}
          {(data.city || data.state) && (
            <p className="text-xs text-ink-light">
              {[data.city, data.state].filter(Boolean).join(", ")}
              {data.zip ? ` ${data.zip}` : ""}
            </p>
          )}
          {data.bio && (
            <p className="text-xs text-ink-mid line-clamp-2">{data.bio}</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Button size="lg" onClick={onComplete} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="mr-2 h-4 w-4" />
          )}
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
