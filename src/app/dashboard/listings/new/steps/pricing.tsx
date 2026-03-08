"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, DollarSign, Heart, CalendarDays, Gavel } from "lucide-react";

type StepProps = {
  data: Record<string, unknown>;
  setField: (field: string, value: unknown) => void;
};

const listingTypes = [
  { value: "fixed_price", label: "Fixed Price", icon: DollarSign },
  { value: "price_on_inquiry", label: "Price on Inquiry", icon: Heart },
  { value: "for_lease", label: "For Lease", icon: CalendarDays },
  { value: "auction", label: "Auction", icon: Gavel },
];

const sellerRoles = [
  { value: "owner", label: "Owner" },
  { value: "trainer", label: "Trainer" },
  { value: "agent", label: "Agent" },
  { value: "dealer", label: "Dealer" },
];

const contactPreferences = [
  { value: "email_only", label: "Email Only" },
  { value: "phone_only", label: "Phone Only" },
  { value: "email_and_phone", label: "Email & Phone" },
];

const warrantyOptions = [
  {
    value: "as_is",
    label: "AS IS",
    description:
      "Horse is sold without any warranties. Buyer accepts full responsibility.",
  },
  {
    value: "sound_at_sale",
    label: "Sound at Time of Sale",
    description:
      "Seller warrants the horse is sound at the time of sale. Does not cover future conditions.",
  },
  {
    value: "sound_for_use",
    label: "Sound for Intended Use",
    description:
      "Seller warrants the horse is sound for the specific discipline and level described in the listing.",
  },
];

export function StepPricing({ data, setField }: StepProps) {
  const sellerState = (data.location_state as string) || (data.seller_state as string) || "";
  const isComplianceState = ["FL", "CA", "KY"].includes(sellerState);

  return (
    <div className="space-y-8">
      {/* Listing Type cards */}
      <div className="rounded-lg border border-crease-light bg-white p-5">
        <h3 className="mb-1 text-base font-semibold text-ink-black">Pricing</h3>
        <Label className="mt-3">Listing Type</Label>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {listingTypes.map((lt) => {
            const Icon = lt.icon;
            const selected = (data.listing_type || "fixed_price") === lt.value;
            return (
              <label
                key={lt.value}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 px-3 py-4 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-1 ${
                  selected
                    ? "border-ink-black bg-ink-black text-white"
                    : "border-crease-light bg-white text-ink-mid hover:border-crease-mid"
                }`}
              >
                <input
                  type="radio"
                  name="listing-type"
                  value={lt.value}
                  checked={selected}
                  onChange={() => {
                    setField("listing_type", lt.value);
                    if (lt.value === "price_on_inquiry") setField("price_display", "contact");
                    else if (lt.value === "for_lease") setField("lease_available", true);
                    else setField("price_display", "exact");
                  }}
                  className="sr-only"
                />
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{lt.label}</span>
              </label>
            );
          })}
        </div>

        {/* Asking Price — shown for fixed_price and auction */}
        {((data.listing_type || "fixed_price") === "fixed_price" ||
          (data.listing_type || "fixed_price") === "auction") && (
          <div className="mt-4">
            <Label htmlFor="price">
              Asking Price <span className="text-red" aria-label="required">*</span>
            </Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light">
                $
              </span>
              <Input
                id="price"
                type="number"
                min="0"
                step="100"
                required
                value={(data.price as string) || ""}
                onChange={(e) => setField("price", e.target.value)}
                placeholder="0"
                className="pl-7"
              />
            </div>
          </div>
        )}

        {/* Negotiable */}
        <label className="mt-4 flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.price_negotiable !== false}
            onChange={(e) => setField("price_negotiable", e.target.checked)}
            className="h-4 w-4 rounded border-crease-light text-primary accent-primary"
          />
          <span className="text-sm text-ink-dark">Price is negotiable</span>
        </label>
      </div>

      {/* Seller Information */}
      <div className="rounded-lg border border-crease-light bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-ink-black">Seller Information</h3>

        {/* Seller Role */}
        <div>
          <Label>You are the...</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {sellerRoles.map((role) => (
              <label key={role.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="seller-role"
                  value={role.value}
                  checked={data.seller_role === role.value}
                  onChange={() => setField("seller_role", role.value)}
                  className="peer sr-only"
                />
                <span className="block rounded-full border border-crease-light px-4 py-2 text-sm font-medium text-ink-mid transition-colors peer-checked:border-ink-black peer-checked:bg-ink-black peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1">
                  {role.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Contact Preference */}
        <div className="mt-5">
          <Label>Contact Preference</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {contactPreferences.map((cp) => (
              <label key={cp.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="contact-pref"
                  value={cp.value}
                  checked={(data.contact_preference || "email_and_phone") === cp.value}
                  onChange={() => setField("contact_preference", cp.value)}
                  className="peer sr-only"
                />
                <span className="block rounded-full border border-crease-light px-4 py-2 text-sm font-medium text-ink-mid transition-colors peer-checked:border-ink-black peer-checked:bg-ink-black peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1">
                  {cp.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Warranty — UCC 2-316 compliant display */}
      <div>
        <Label>
          Warranty <span className="text-red" aria-label="required">*</span>
        </Label>
        <p className="mb-3 text-xs text-ink-light">
          Select the warranty type for this sale. This will be included in the
          Bill of Sale per UCC Article 2.
        </p>
        <div className="space-y-3">
          {warrantyOptions.map((opt) => (
            <label
              key={opt.value}
              className="block cursor-pointer rounded-lg border border-crease-light p-4 transition-colors has-[:checked]:border-ink-black has-[:checked]:bg-paper-warm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-1"
            >
              <input
                type="radio"
                name="warranty-radio"
                value={opt.value}
                checked={(data.warranty || "as_is") === opt.value}
                onChange={() => setField("warranty", opt.value)}
                className="peer sr-only"
              />
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-crease-mid peer-checked:border-primary peer-checked:bg-primary" />
                <div>
                  {/* CONSPICUOUS display per UCC 2-316 */}
                  <p className="text-sm font-bold uppercase tracking-wide text-ink-black">
                    {opt.label}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-mid">
                    {opt.description}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>

        {(data.warranty || "as_is") === "as_is" && (
          <div className="mt-3 rounded-md border border-gold/30 bg-gold/5 p-3">
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-gold" />
              <p className="text-xs text-ink-dark">
                <strong className="uppercase">
                  THIS HORSE IS SOLD &ldquo;AS IS&rdquo; WITHOUT ANY WARRANTIES,
                  EXPRESS OR IMPLIED.
                </strong>{" "}
                Buyer assumes all risk. Even &ldquo;as is&rdquo; does not protect
                against intentional fraud or misrepresentation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lease terms — shown when listing type is For Lease */}
      {data.listing_type === "for_lease" && (
        <div>
          <Label htmlFor="lease_terms">Lease Terms</Label>
          <Textarea
            id="lease_terms"
            value={(data.lease_terms as string) || ""}
            onChange={(e) => setField("lease_terms", e.target.value)}
            placeholder="Describe lease terms, duration, and monthly rate..."
            rows={3}
            className="mt-1.5"
          />
        </div>
      )}

      {/* State-specific compliance */}
      {isComplianceState && (
        <div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
          <p className="overline mb-3 text-gold">
            {sellerState} COMPLIANCE REQUIREMENTS
          </p>

          {sellerState === "FL" && (
            <div className="space-y-3">
              <p className="text-xs text-ink-mid">
                Florida Rule 5H-26 requires written disclosure of medical
                treatments within 7 days of sale, commission disclosure for
                amounts &gt;$500, and dual agency consent.
              </p>
              <div>
                <Label htmlFor="fl_medical_disclosure">
                  Medical Treatments (Last 7 Days)
                </Label>
                <Textarea
                  id="fl_medical_disclosure"
                  value={(data.fl_medical_disclosure as string) || ""}
                  onChange={(e) =>
                    setField("fl_medical_disclosure", e.target.value)
                  }
                  placeholder="List any medical treatments administered within the last 7 days, or 'None'"
                  rows={2}
                  className="mt-1.5"
                />
              </div>
            </div>
          )}

          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.commission_disclosed === true}
                onChange={(e) =>
                  setField("commission_disclosed", e.target.checked)
                }
                className="h-4 w-4 rounded border-crease-light"
              />
              <span className="text-sm text-ink-dark">
                Commission amount is disclosed to all parties
              </span>
            </label>
            {data.commission_disclosed === true && (
              <Input
                placeholder="Commission amount or percentage"
                value={(data.commission_amount as string) || ""}
                onChange={(e) => setField("commission_amount", e.target.value)}
                className="mt-1.5"
              />
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.dual_agency_disclosed === true}
                onChange={(e) =>
                  setField("dual_agency_disclosed", e.target.checked)
                }
                className="h-4 w-4 rounded border-crease-light"
              />
              <span className="text-sm text-ink-dark">
                Dual agency (if applicable) disclosed with written consent
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
