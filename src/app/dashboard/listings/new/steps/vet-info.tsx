"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HennekeScoreSelector } from "@/components/marketplace/henneke-score";

type StepProps = {
  data: Record<string, unknown>;
  setField: (field: string, value: unknown) => void;
};

export function StepVetInfo({ data, setField }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="rounded-md bg-blue/5 p-4 text-sm text-blue">
        Complete vet information significantly increases your listing
        completeness score and buyer trust. Buyers filter by documentation level.
      </div>

      {/* Vet Contact */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="vet_name">Veterinarian Name</Label>
          <Input
            id="vet_name"
            value={(data.vet_name as string) || ""}
            onChange={(e) => setField("vet_name", e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="vet_phone">Vet Phone</Label>
          <Input
            id="vet_phone"
            type="tel"
            value={(data.vet_phone as string) || ""}
            onChange={(e) => setField("vet_phone", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="last_vet_check">Last Vet Check</Label>
          <Input
            id="last_vet_check"
            type="date"
            value={(data.last_vet_check as string) || ""}
            onChange={(e) => setField("last_vet_check", e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="coggins_date">Coggins Date</Label>
          <Input
            id="coggins_date"
            type="date"
            value={(data.coggins_date as string) || ""}
            onChange={(e) => setField("coggins_date", e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="dental_date">Last Dental</Label>
          <Input
            id="dental_date"
            type="date"
            value={(data.dental_date as string) || ""}
            onChange={(e) => setField("dental_date", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Henneke Body Condition Score */}
      <HennekeScoreSelector
        value={(data.henneke_score as number) || null}
        onChange={(score) => setField("henneke_score", score)}
      />

      {/* Soundness Attestation */}
      <div>
        <Label htmlFor="soundness_level">Soundness Confidence</Label>
        <select
          id="soundness_level"
          value={(data.soundness_level as string) || ""}
          onChange={(e) => setField("soundness_level", e.target.value)}
          className="mt-1.5 w-full rounded-md border border-crease-light bg-paper-white px-3 py-2 text-sm text-ink-black focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Select soundness level...</option>
          <option value="vet_confirmed_sound">
            Vet-confirmed sound (recent PPE)
          </option>
          <option value="minor_findings">
            Minor findings described in listing
          </option>
          <option value="managed_condition">
            Managed condition — details in health history
          </option>
          <option value="not_assessed">Not recently assessed</option>
        </select>
        <p className="mt-1 text-xs text-ink-light">
          Buyers filter by soundness level. Honesty builds trust and reduces
          disputes.
        </p>
      </div>

      {/* Health Status */}
      <div>
        <Label htmlFor="vaccination_status">Vaccination Status</Label>
        <Input
          id="vaccination_status"
          value={(data.vaccination_status as string) || ""}
          onChange={(e) => setField("vaccination_status", e.target.value)}
          placeholder="e.g. Current on all core vaccinations, spring 2026"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="medications">Current Medications</Label>
        <Input
          id="medications"
          value={(data.medications as string) || ""}
          onChange={(e) => setField("medications", e.target.value)}
          placeholder="List any current medications or supplements"
          className="mt-1.5"
        />
      </div>

      {/* Health History */}
      <div>
        <Label htmlFor="known_health_issues">Known Health Issues</Label>
        <Textarea
          id="known_health_issues"
          value={(data.known_health_issues as string) || ""}
          onChange={(e) => setField("known_health_issues", e.target.value)}
          placeholder="Disclose any known health conditions. 'None known' is a valid answer."
          rows={3}
          className="mt-1.5"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="lameness_history">Lameness History</Label>
          <Textarea
            id="lameness_history"
            value={(data.lameness_history as string) || ""}
            onChange={(e) => setField("lameness_history", e.target.value)}
            placeholder="Any past lameness issues, injections, or soundness concerns"
            rows={3}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="surgical_history">Surgical History</Label>
          <Textarea
            id="surgical_history"
            value={(data.surgical_history as string) || ""}
            onChange={(e) => setField("surgical_history", e.target.value)}
            placeholder="Any surgeries, including arthroscopy, colic surgery, etc."
            rows={3}
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="allergies">Allergies</Label>
        <Input
          id="allergies"
          value={(data.allergies as string) || ""}
          onChange={(e) => setField("allergies", e.target.value)}
          placeholder="List any known allergies"
          className="mt-1.5"
        />
      </div>

      {/* FL Rule 5H */}
      <div>
        <Label htmlFor="recent_medical_treatments">
          Recent Medical Treatments (within 7 days)
        </Label>
        <Textarea
          id="recent_medical_treatments"
          value={(data.recent_medical_treatments as string) || ""}
          onChange={(e) =>
            setField("recent_medical_treatments", e.target.value)
          }
          placeholder="Florida law requires disclosure of medical treatments within 7 days of sale"
          rows={2}
          className="mt-1.5"
        />
        <p className="mt-1 text-xs text-ink-light">
          Required by Florida Rule 5H-26 for FL-based transactions. Recommended
          for all listings.
        </p>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-ink-light">
        Documents provided by seller. ManeExchange has not independently
        verified accuracy, completeness, or authenticity.
      </p>
    </div>
  );
}
