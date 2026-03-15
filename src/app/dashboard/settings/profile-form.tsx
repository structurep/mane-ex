"use client";

import { useActionState, useState, useEffect } from "react";
import { updateProfile } from "@/actions/profiles";
import type { ProfileActionState } from "@/actions/profiles";
import { updateAvatarUrl, updateCoverUrl } from "@/actions/storage";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/avatar-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Heart,
  Save,
  CheckCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";

const DISCIPLINES = [
  "Hunter/Jumper",
  "Dressage",
  "Eventing",
  "Western Pleasure",
  "Reining",
  "Trail",
  "Barrel Racing",
  "Endurance",
  "Polo",
  "Other",
];

const RIDING_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "amateur", label: "Amateur" },
  { value: "junior", label: "Junior" },
  { value: "professional", label: "Professional" },
];

const FACILITY_TYPES = [
  { value: "private_barn", label: "Private Barn" },
  { value: "training_barn", label: "Training Barn" },
  { value: "boarding_barn", label: "Boarding Barn" },
  { value: "unknown", label: "Not Sure" },
];

type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  website_url: string | null;
  instagram_handle: string | null;
  role: string;
  disciplines: string[];
  min_budget: number | null;
  max_budget: number | null;
  riding_level: string | null;
  trainer_reference: string | null;
  facility_type: string | null;
};

const initialState: ProfileActionState = {};

export function ProfileForm({
  profile,
  userEmail,
}: {
  profile: Profile | null;
  userEmail: string;
}) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialState
  );
  const [bioLength, setBioLength] = useState(
    profile?.bio?.length ?? 0
  );

  useEffect(() => {
    if (state.success === true) {
      toast.success("Profile updated");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state.success, state.error]);

  const isBuyer = profile?.role === "buyer";

  return (
    <form action={formAction} className="space-y-6">
      {/* Avatar + Cover Photo */}
      <section className="rounded-lg border-0 bg-paper-cream p-6 shadow-flat">
        <AvatarUpload
          currentAvatarUrl={profile?.avatar_url ?? null}
          currentCoverUrl={profile?.cover_url ?? null}
          userId={profile?.id ?? ""}
          onAvatarChange={async (url) => {
            await updateAvatarUrl(url);
          }}
          onCoverChange={async (url) => {
            await updateCoverUrl(url);
          }}
        />
      </section>

      {/* Success message */}
      {state.success === true && (
        <div className="flex items-center gap-2 rounded-lg border border-forest/30 bg-forest/10 p-4 text-sm text-forest">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <p>Profile updated successfully.</p>
        </div>
      )}

      {/* General error */}
      {state.error && state.success !== true && (
        <div className="rounded-lg border border-red/30 bg-red/10 p-4 text-sm text-red">
          {state.error}
        </div>
      )}

      {/* Section: Profile */}
      <section className="rounded-lg border-0 bg-paper-cream p-6 shadow-flat">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-ink-light" />
          <span className="overline text-ink-light">Profile</span>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              name="display_name"
              defaultValue={profile?.display_name ?? ""}
              placeholder="How you want to appear to others"
              className="mt-1.5"
            />
            {state.fieldErrors?.display_name && (
              <p className="mt-1 text-xs text-red">
                {state.fieldErrors.display_name}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="bio">Bio</Label>
              <span
                className={`text-xs ${
                  bioLength > 500 ? "text-red" : "text-ink-light"
                }`}
              >
                {bioLength}/500
              </span>
            </div>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile?.bio ?? ""}
              placeholder="Tell the community a little about yourself..."
              rows={4}
              maxLength={500}
              onChange={(e) => setBioLength(e.target.value.length)}
              className="mt-1.5"
            />
            {state.fieldErrors?.bio && (
              <p className="mt-1 text-xs text-red">{state.fieldErrors.bio}</p>
            )}
          </div>
        </div>
      </section>

      {/* Section: Location */}
      <section className="rounded-lg border-0 bg-paper-cream p-6 shadow-flat">
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-ink-light" />
          <span className="overline text-ink-light">Location</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="profile-city">City</Label>
            <Input
              id="profile-city"
              name="city"
              defaultValue={profile?.city ?? ""}
              placeholder="Wellington"
              className="mt-1.5"
            />
            {state.fieldErrors?.city && (
              <p className="mt-1 text-xs text-red">{state.fieldErrors.city}</p>
            )}
          </div>
          <div>
            <Label htmlFor="profile-state">State</Label>
            <Input
              id="profile-state"
              name="state"
              defaultValue={profile?.state ?? ""}
              placeholder="FL"
              maxLength={2}
              className="mt-1.5"
            />
            {state.fieldErrors?.state && (
              <p className="mt-1 text-xs text-red">{state.fieldErrors.state}</p>
            )}
          </div>
          <div>
            <Label htmlFor="profile-zip">ZIP Code</Label>
            <Input
              id="profile-zip"
              name="zip"
              defaultValue={profile?.zip ?? ""}
              placeholder="33414"
              className="mt-1.5"
            />
            {state.fieldErrors?.zip && (
              <p className="mt-1 text-xs text-red">{state.fieldErrors.zip}</p>
            )}
          </div>
        </div>
      </section>

      {/* Section: Contact */}
      <section className="rounded-lg border-0 bg-paper-cream p-6 shadow-flat">
        <div className="mb-4 flex items-center gap-2">
          <Phone className="h-4 w-4 text-ink-light" />
          <span className="overline text-ink-light">Contact</span>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="profile-email">
                <Mail className="mr-1 inline h-3 w-3" />
                Email
              </Label>
              <Input
                id="profile-email"
                type="email"
                value={userEmail}
                disabled
                className="mt-1.5 bg-paper-warm text-ink-light"
              />
              <p className="mt-1 text-xs text-ink-light">
                Email is managed through your account and cannot be changed
                here.
              </p>
            </div>
            <div>
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                name="phone"
                type="tel"
                defaultValue={profile?.phone ?? ""}
                placeholder="(555) 123-4567"
                className="mt-1.5"
              />
              {state.fieldErrors?.phone && (
                <p className="mt-1 text-xs text-red">
                  {state.fieldErrors.phone}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section: Social */}
      <section className="rounded-lg border-0 bg-paper-cream p-6 shadow-flat">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-ink-light" />
          <span className="overline text-ink-light">Social</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="profile-website">
              <Globe className="mr-1 inline h-3 w-3" />
              Website
            </Label>
            <Input
              id="profile-website"
              name="website_url"
              type="url"
              defaultValue={profile?.website_url ?? ""}
              placeholder="https://yourwebsite.com"
              className="mt-1.5"
            />
            {state.fieldErrors?.website_url && (
              <p className="mt-1 text-xs text-red">
                {state.fieldErrors.website_url}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="profile-instagram">
              <Instagram className="mr-1 inline h-3 w-3" />
              Instagram
            </Label>
            <Input
              id="profile-instagram"
              name="instagram_handle"
              defaultValue={profile?.instagram_handle ?? ""}
              placeholder="@yourusername"
              className="mt-1.5"
            />
            {state.fieldErrors?.instagram_handle && (
              <p className="mt-1 text-xs text-red">
                {state.fieldErrors.instagram_handle}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Section: Buyer Qualification (only for buyers) */}
      {isBuyer && (
        <section className="rounded-lg border-0 bg-paper-cream p-6 shadow-flat">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-ink-light" />
            <span className="overline text-ink-light">Buyer Profile</span>
          </div>
          <p className="mb-4 text-xs text-ink-mid">
            Complete your buyer profile to earn a qualification badge. Sellers prioritize verified and qualified buyers.
          </p>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="riding_level">Riding Level</Label>
                <select
                  id="riding_level"
                  name="riding_level"
                  defaultValue={profile?.riding_level ?? ""}
                  className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-paper-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select level</option>
                  {RIDING_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="facility_type">Facility Type</Label>
                <select
                  id="facility_type"
                  name="facility_type"
                  defaultValue={profile?.facility_type ?? ""}
                  className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-paper-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select type</option>
                  {FACILITY_TYPES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="trainer_reference">Trainer Reference</Label>
              <Input
                id="trainer_reference"
                name="trainer_reference"
                defaultValue={profile?.trainer_reference ?? ""}
                placeholder="Trainer name and contact (optional)"
                className="mt-1.5"
              />
              <p className="mt-1 text-[10px] text-ink-faint">
                Providing a trainer reference helps verify your experience level.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Section: Buyer Preferences (only for buyers) */}
      {isBuyer && (
        <section className="rounded-lg border-0 bg-paper-cream p-6 shadow-flat">
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-4 w-4 text-ink-light" />
            <span className="overline text-ink-light">Buyer Preferences</span>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Disciplines of Interest</Label>
              <p className="mt-0.5 text-xs text-ink-light">
                Select the disciplines you are looking for.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DISCIPLINES.map((discipline) => {
                  const checked =
                    profile?.disciplines?.includes(discipline) ?? false;
                  return (
                    <label
                      key={discipline}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-crease-light bg-paper-white px-3 py-2 text-sm text-ink-mid transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground"
                    >
                      <input
                        type="checkbox"
                        name="disciplines"
                        value={discipline}
                        defaultChecked={checked}
                        className="sr-only"
                      />
                      {discipline}
                    </label>
                  );
                })}
              </div>
              {state.fieldErrors?.disciplines && (
                <p className="mt-1 text-xs text-red">
                  {state.fieldErrors.disciplines}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="min_budget">Minimum Budget ($)</Label>
                <Input
                  id="min_budget"
                  name="min_budget"
                  type="number"
                  min={0}
                  step={500}
                  defaultValue={profile?.min_budget ?? ""}
                  placeholder="e.g. 5000"
                  className="mt-1.5"
                />
                {state.fieldErrors?.min_budget && (
                  <p className="mt-1 text-xs text-red">
                    {state.fieldErrors.min_budget}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="max_budget">Maximum Budget ($)</Label>
                <Input
                  id="max_budget"
                  name="max_budget"
                  type="number"
                  min={0}
                  step={500}
                  defaultValue={profile?.max_budget ?? ""}
                  placeholder="e.g. 50000"
                  className="mt-1.5"
                />
                {state.fieldErrors?.max_budget && (
                  <p className="mt-1 text-xs text-red">
                    {state.fieldErrors.max_budget}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
