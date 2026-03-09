"use client";

import { useActionState } from "react";
import { upsertTrainerProfile, type TrainerActionState } from "@/actions/trainers";
import type { TrainerProfile } from "@/types/trainers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertBanner } from "@/components/tailwind-plus";

const DISCIPLINES = [
  "Dressage", "Hunter/Jumper", "Eventing", "Western Pleasure",
  "Reining", "Barrel Racing", "Trail", "Endurance",
  "Driving", "Natural Horsemanship", "Gaited", "Other",
];

const CERTIFICATIONS = [
  "USDF Certified", "USEF Licensed", "BHS Certified", "CHA Certified",
  "PATH International", "ARIA Certified", "Parelli Natural Horsemanship",
  "AQHA Professional Horseman",
];

export function TrainerProfileForm({ profile }: { profile: TrainerProfile | null }) {
  const [state, formAction, isPending] = useActionState<TrainerActionState, FormData>(
    upsertTrainerProfile,
    {}
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <AlertBanner variant="error" title="Error">
          {state.error}
        </AlertBanner>
      )}
      {state.success && (
        <AlertBanner variant="success" title="Saved">
          Your trainer profile has been updated.
        </AlertBanner>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            name="headline"
            defaultValue={profile?.headline ?? ""}
            placeholder="e.g., USDF Gold Medalist & Dressage Trainer"
            maxLength={200}
          />
          {state.fieldErrors?.headline && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.headline}</p>
          )}
        </div>

        <div>
          <Label htmlFor="years_experience">Years of Experience</Label>
          <Input
            id="years_experience"
            name="years_experience"
            type="number"
            defaultValue={profile?.years_experience ?? ""}
            min={0}
            max={80}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile?.bio ?? ""}
          rows={4}
          maxLength={3000}
          placeholder="Tell potential clients about your experience, training philosophy, and specialties..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="location_city">City</Label>
          <Input
            id="location_city"
            name="location_city"
            defaultValue={profile?.location_city ?? ""}
            placeholder="e.g., Lexington"
          />
        </div>
        <div>
          <Label htmlFor="location_state">State</Label>
          <Input
            id="location_state"
            name="location_state"
            defaultValue={profile?.location_state ?? ""}
            placeholder="e.g., Kentucky"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="service_radius_miles">Service Radius (miles)</Label>
          <Input
            id="service_radius_miles"
            name="service_radius_miles"
            type="number"
            defaultValue={profile?.service_radius_miles ?? ""}
            min={0}
            max={500}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile?.phone ?? ""}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="website_url">Website</Label>
        <Input
          id="website_url"
          name="website_url"
          type="url"
          defaultValue={profile?.website_url ?? ""}
          placeholder="https://yoursite.com"
        />
      </div>

      {/* Disciplines */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-dark">Disciplines</legend>
        <div className="flex flex-wrap gap-2">
          {DISCIPLINES.map((d) => (
            <label key={d} className="flex items-center gap-1.5 text-sm text-ink-mid">
              <input
                type="checkbox"
                name="disciplines"
                value={d}
                defaultChecked={profile?.disciplines.includes(d)}
                className="rounded border-crease-mid"
              />
              {d}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Certifications */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-dark">Certifications</legend>
        <div className="flex flex-wrap gap-2">
          {CERTIFICATIONS.map((c) => (
            <label key={c} className="flex items-center gap-1.5 text-sm text-ink-mid">
              <input
                type="checkbox"
                name="certifications"
                value={c}
                defaultChecked={profile?.certifications.includes(c)}
                className="rounded border-crease-mid"
              />
              {c}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Accepting clients toggle */}
      <label className="flex items-center gap-2 text-sm text-ink-mid">
        <input
          type="hidden"
          name="accepting_clients"
          value="false"
        />
        <input
          type="checkbox"
          name="accepting_clients"
          value="true"
          defaultChecked={profile?.accepting_clients ?? true}
          className="rounded border-crease-mid"
        />
        Currently accepting new clients
      </label>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : profile ? "Save Changes" : "Create Profile"}
        </Button>
      </div>
    </form>
  );
}
