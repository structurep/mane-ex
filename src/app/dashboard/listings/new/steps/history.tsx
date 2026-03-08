"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RegistryLookup, type RegistryRecord } from "@/components/registry-lookup";

type StepProps = {
  data: Record<string, unknown>;
  setField: (field: string, value: unknown) => void;
};

const suitableOptions = [
  "Beginner", "Novice Rider", "Intermediate", "Advanced",
  "Professional", "Junior Rider", "Adult Amateur", "Timid Rider",
];

const goodWithOptions = [
  "Kids", "Beginners", "Other Horses", "Dogs",
  "Trail Riding", "Trailering", "Clipping", "Bathing",
];

export function StepHistory({ data, setField }: StepProps) {
  const selectedSuitable = ((data.suitable_for as string) || "").split(",").filter(Boolean);
  const selectedGoodWith = ((data.good_with as string) || "").split(",").filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Registry Verification */}
      <RegistryLookup
        records={(data.registry_records as RegistryRecord[]) || []}
        onChange={(records) => setField("registry_records", records)}
      />

      <div className="crease-divider" />

      {/* Ownership */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="years_with_current_owner">
            Years with Current Owner
          </Label>
          <Input
            id="years_with_current_owner"
            type="number"
            min="0"
            value={(data.years_with_current_owner as string) || ""}
            onChange={(e) =>
              setField("years_with_current_owner", e.target.value)
            }
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="number_of_previous_owners">
            Number of Previous Owners
          </Label>
          <Input
            id="number_of_previous_owners"
            type="number"
            min="0"
            value={(data.number_of_previous_owners as string) || ""}
            onChange={(e) =>
              setField("number_of_previous_owners", e.target.value)
            }
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Reason for Sale */}
      <div>
        <Label htmlFor="reason_for_sale">Reason for Sale</Label>
        <Textarea
          id="reason_for_sale"
          value={(data.reason_for_sale as string) || ""}
          onChange={(e) => setField("reason_for_sale", e.target.value)}
          placeholder="Be honest — buyers value transparency. Common reasons: rider outgrew, owner relocating, downsizing barn..."
          rows={3}
          className="mt-1.5"
        />
      </div>

      {/* Training History */}
      <div>
        <Label htmlFor="training_history">Training History</Label>
        <Textarea
          id="training_history"
          value={(data.training_history as string) || ""}
          onChange={(e) => setField("training_history", e.target.value)}
          placeholder="Describe training background, notable trainers, and current program..."
          rows={4}
          className="mt-1.5"
        />
      </div>

      {/* Temperament */}
      <div>
        <Label htmlFor="temperament">Temperament</Label>
        <Textarea
          id="temperament"
          value={(data.temperament as string) || ""}
          onChange={(e) => setField("temperament", e.target.value)}
          placeholder="Describe personality, behavior under saddle, and in the barn. Is this horse hot, quiet, forward, lazy?"
          rows={3}
          className="mt-1.5"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">
          Description <span className="text-red">*</span>{" "}
          <span className="text-xs font-normal text-ink-light">(minimum 100 characters)</span>
        </Label>
        <Textarea
          id="description"
          value={(data.description as string) || ""}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Describe your horse's training, accomplishments, personality, and what makes them special..."
          rows={5}
          className="mt-1.5"
        />
        <p className={`mt-1 text-xs ${((data.description as string) || "").length >= 100 ? "text-forest" : "text-ink-light"}`}>
          {((data.description as string) || "").length}/100 characters minimum
        </p>
      </div>

      {/* Vices */}
      <div>
        <Label htmlFor="vices">Vices or Behavioral Notes</Label>
        <Textarea
          id="vices"
          value={(data.vices as string) || ""}
          onChange={(e) => setField("vices", e.target.value)}
          placeholder="e.g. Cribs, weaves, spooky in new environments. 'None known' is a valid answer."
          rows={2}
          className="mt-1.5"
        />
      </div>

      {/* Suitable For */}
      <div>
        <Label>Suitable For</Label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {suitableOptions.map((opt) => (
            <label key={opt} className="cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSuitable.includes(opt)}
                onChange={() => {
                  const updated = selectedSuitable.includes(opt)
                    ? selectedSuitable.filter((x) => x !== opt)
                    : [...selectedSuitable, opt];
                  setField("suitable_for", updated.join(","));
                }}
                className="peer sr-only"
              />
              <span className="block rounded-full border border-crease-light px-3 py-1.5 text-xs font-medium text-ink-mid transition-colors peer-checked:border-forest peer-checked:bg-forest/10 peer-checked:text-forest peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1">
                {opt}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Good With */}
      <div>
        <Label>Good With</Label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {goodWithOptions.map((opt) => (
            <label key={opt} className="cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGoodWith.includes(opt)}
                onChange={() => {
                  const updated = selectedGoodWith.includes(opt)
                    ? selectedGoodWith.filter((x) => x !== opt)
                    : [...selectedGoodWith, opt];
                  setField("good_with", updated.join(","));
                }}
                className="peer sr-only"
              />
              <span className="block rounded-full border border-crease-light px-3 py-1.5 text-xs font-medium text-ink-mid transition-colors peer-checked:border-forest peer-checked:bg-forest/10 peer-checked:text-forest peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1">
                {opt}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
