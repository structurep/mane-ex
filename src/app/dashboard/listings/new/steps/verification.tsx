"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/tailwind-plus";

type StepProps = {
  data: Record<string, unknown>;
  setField: (field: string, value: unknown) => void;
};

export function StepVerification({ data, setField }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Verification Badges */}
      <div className="rounded-lg border border-crease-light bg-white p-5">
        <h3 className="text-base font-semibold text-ink-black">
          Verification Badges
        </h3>
        <p className="mt-1 text-sm text-ink-mid">
          Earn trust badges to increase buyer confidence and visibility
        </p>

        <div className="mt-5 space-y-4">
          {/* Current Coggins */}
          <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-crease-light p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-1">
            <input
              type="checkbox"
              checked={data.has_current_coggins === true}
              onChange={(e) =>
                setField("has_current_coggins", e.target.checked)
              }
              aria-describedby="coggins-help"
              className="mt-0.5 h-5 w-5 rounded border-crease-mid text-primary accent-primary"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink-black">
                  Current Coggins
                </span>
                <StatusBadge variant="gold">Recommended</StatusBadge>
              </div>
              <p id="coggins-help" className="mt-0.5 text-xs text-ink-mid">
                Confirm that this horse has a negative Coggins test within the
                last 12 months
              </p>
            </div>
          </label>

          {/* Vet Check Available */}
          <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-crease-light p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-1">
            <input
              type="checkbox"
              checked={data.has_vet_check_available === true}
              onChange={(e) =>
                setField("has_vet_check_available", e.target.checked)
              }
              aria-describedby="vetcheck-help"
              className="mt-0.5 h-5 w-5 rounded border-crease-mid text-primary accent-primary"
            />
            <div>
              <span className="text-sm font-semibold text-ink-black">
                Vet Check Available
              </span>
              <p id="vetcheck-help" className="mt-0.5 text-xs text-ink-mid">
                You have recent veterinary records available for potential buyers
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Known Health Issues */}
      <div className="rounded-lg border border-crease-light bg-white p-5">
        <h3 className="text-base font-semibold text-ink-black">
          Known Health Issues
        </h3>
        <p className="mt-1 text-sm text-ink-mid">
          <span className="text-ink-light">(Optional but encouraged)</span>
          {" "}Disclosing known issues builds trust and prevents disputes
        </p>
        <Textarea
          id="known_health_issues"
          value={(data.known_health_issues as string) || ""}
          onChange={(e) => setField("known_health_issues", e.target.value)}
          placeholder="e.g., No known issues, or describe any maintenance needs..."
          rows={4}
          className="mt-3"
        />
      </div>
    </div>
  );
}
