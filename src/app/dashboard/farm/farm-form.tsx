"use client";

import { useActionState } from "react";
import { createFarm, updateFarm } from "@/actions/farms";
import type { FarmActionState } from "@/actions/farms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Store,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Calendar,
  Save,
  CheckCircle,
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

type Farm = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  instagram_handle: string | null;
  disciplines: string[];
  year_established: number | null;
  number_of_stalls: number | null;
};

const initialState: FarmActionState = {};

export function FarmForm({ farm }: { farm: Farm | null }) {
  const action = farm ? updateFarm : createFarm;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden farm ID for updates */}
      {farm && <input type="hidden" name="farmId" value={farm.id} />}

      {/* Success message */}
      {state.success === true && (
        <div className="flex items-center gap-2 rounded-lg border border-forest/30 bg-forest/10 p-4 text-sm text-forest">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <p>
            {farm
              ? "Farm page updated successfully."
              : "Farm page created successfully!"}
          </p>
        </div>
      )}

      {/* General error */}
      {state.error && state.success !== true && (
        <div className="rounded-lg border border-red/30 bg-red/10 p-4 text-sm text-red">
          {state.error}
        </div>
      )}

      {/* Section: Farm Details */}
      <section className="rounded-lg border-0 bg-paper-cream p-6 shadow-flat">
        <div className="mb-4 flex items-center gap-2">
          <Store className="h-4 w-4 text-ink-light" />
          <span className="overline text-ink-light">Farm Details</span>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">
              Farm Name <span className="text-red">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={farm?.name ?? ""}
              placeholder="e.g. Rolling Hills Farm"
              required
              className="mt-1.5"
            />
            {state.fieldErrors?.name && (
              <p className="mt-1 text-xs text-red">{state.fieldErrors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={farm?.description ?? ""}
              placeholder="Tell buyers about your farm, your program, and what makes it special..."
              rows={4}
              className="mt-1.5"
            />
            {state.fieldErrors?.description && (
              <p className="mt-1 text-xs text-red">
                {state.fieldErrors.description}
              </p>
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

        <div className="space-y-4">
          <div>
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={farm?.address ?? ""}
              placeholder="123 Farm Road"
              className="mt-1.5"
            />
            {state.fieldErrors?.address && (
              <p className="mt-1 text-xs text-red">
                {state.fieldErrors.address}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                defaultValue={farm?.city ?? ""}
                placeholder="Wellington"
                className="mt-1.5"
              />
              {state.fieldErrors?.city && (
                <p className="mt-1 text-xs text-red">
                  {state.fieldErrors.city}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                defaultValue={farm?.state ?? ""}
                placeholder="FL"
                maxLength={2}
                className="mt-1.5"
              />
              {state.fieldErrors?.state && (
                <p className="mt-1 text-xs text-red">
                  {state.fieldErrors.state}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                name="zip"
                defaultValue={farm?.zip ?? ""}
                placeholder="33414"
                className="mt-1.5"
              />
              {state.fieldErrors?.zip && (
                <p className="mt-1 text-xs text-red">
                  {state.fieldErrors.zip}
                </p>
              )}
            </div>
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
              <Label htmlFor="farm-phone">Phone</Label>
              <Input
                id="farm-phone"
                name="phone"
                type="tel"
                defaultValue={farm?.phone ?? ""}
                placeholder="(555) 123-4567"
                className="mt-1.5"
              />
              {state.fieldErrors?.phone && (
                <p className="mt-1 text-xs text-red">
                  {state.fieldErrors.phone}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="farm-email">Email</Label>
              <Input
                id="farm-email"
                name="email"
                type="email"
                defaultValue={farm?.email ?? ""}
                placeholder="info@rollinghillsfarm.com"
                className="mt-1.5"
              />
              {state.fieldErrors?.email && (
                <p className="mt-1 text-xs text-red">
                  {state.fieldErrors.email}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="farm-website">
                <Globe className="mr-1 inline h-3 w-3" />
                Website
              </Label>
              <Input
                id="farm-website"
                name="website_url"
                type="url"
                defaultValue={farm?.website_url ?? ""}
                placeholder="https://rollinghillsfarm.com"
                className="mt-1.5"
              />
              {state.fieldErrors?.website_url && (
                <p className="mt-1 text-xs text-red">
                  {state.fieldErrors.website_url}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="farm-instagram">
                <Instagram className="mr-1 inline h-3 w-3" />
                Instagram
              </Label>
              <Input
                id="farm-instagram"
                name="instagram_handle"
                defaultValue={farm?.instagram_handle ?? ""}
                placeholder="@rollinghillsfarm"
                className="mt-1.5"
              />
              {state.fieldErrors?.instagram_handle && (
                <p className="mt-1 text-xs text-red">
                  {state.fieldErrors.instagram_handle}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section: Details */}
      <section className="rounded-lg border-0 bg-paper-cream p-6 shadow-flat">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-ink-light" />
          <span className="overline text-ink-light">Details</span>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="year_established">Year Established</Label>
              <Input
                id="year_established"
                name="year_established"
                type="number"
                min={1800}
                max={2026}
                defaultValue={farm?.year_established ?? ""}
                placeholder="e.g. 2005"
                className="mt-1.5"
              />
              {state.fieldErrors?.year_established && (
                <p className="mt-1 text-xs text-red">
                  {state.fieldErrors.year_established}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="number_of_stalls">Number of Stalls</Label>
              <Input
                id="number_of_stalls"
                name="number_of_stalls"
                type="number"
                min={0}
                defaultValue={farm?.number_of_stalls ?? ""}
                placeholder="e.g. 24"
                className="mt-1.5"
              />
              {state.fieldErrors?.number_of_stalls && (
                <p className="mt-1 text-xs text-red">
                  {state.fieldErrors.number_of_stalls}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Disciplines</Label>
            <p className="mt-0.5 text-xs text-ink-light">
              Select all disciplines your farm specializes in.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DISCIPLINES.map((discipline) => {
                const checked =
                  farm?.disciplines?.includes(discipline) ?? false;
                return (
                  <label
                    key={discipline}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-crease-light bg-paper-white px-3 py-2 text-sm text-ink-mid transition-colors has-[:checked]:border-ink-black has-[:checked]:bg-ink-black has-[:checked]:text-paper-white"
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
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
            <>Saving...</>
          ) : farm ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Store className="mr-2 h-4 w-4" />
              Create Farm Page
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
