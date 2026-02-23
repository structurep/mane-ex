"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

type StepProps = {
  data: Record<string, unknown>;
  setField: (field: string, value: unknown) => void;
};

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
    <div className="space-y-6">
      {/* Price */}
      <div>
        <Label htmlFor="price">Asking Price ($)</Label>
        <div className="relative mt-1.5">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light">
            $
          </span>
          <Input
            id="price"
            type="number"
            min="0"
            step="100"
            value={(data.price as string) || ""}
            onChange={(e) => setField("price", e.target.value)}
            placeholder="50000"
            className="pl-7"
          />
        </div>
      </div>

      {/* Price Display */}
      <div>
        <Label>Price Display</Label>
        <div className="mt-1.5 flex gap-2">
          {[
            { value: "exact", label: "Show exact price" },
            { value: "range", label: "Price range" },
            { value: "contact", label: "Contact for price" },
          ].map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input
                type="radio"
                name="price-display"
                value={opt.value}
                checked={(data.price_display || "exact") === opt.value}
                onChange={() => setField("price_display", opt.value)}
                className="peer sr-only"
              />
              <span className="block rounded-md border border-border px-3 py-2 text-xs font-medium text-ink-mid transition-colors peer-checked:border-ink-black peer-checked:bg-ink-black peer-checked:text-paper-white">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Negotiable */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={data.price_negotiable !== false}
          onChange={(e) => setField("price_negotiable", e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        <span className="text-sm text-ink-dark">Price is negotiable</span>
      </label>

      {/* Warranty — UCC 2-316 compliant display */}
      <div>
        <Label>
          Warranty <span className="text-red">*</span>
        </Label>
        <p className="mb-3 text-xs text-ink-light">
          Select the warranty type for this sale. This will be included in the
          Bill of Sale per UCC Article 2.
        </p>
        <div className="space-y-3">
          {warrantyOptions.map((opt) => (
            <label
              key={opt.value}
              className="block cursor-pointer rounded-lg border border-border p-4 transition-colors has-[:checked]:border-ink-black has-[:checked]:bg-paper-warm"
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
                <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-crease-mid peer-checked:border-ink-black peer-checked:bg-ink-black" />
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

      {/* Lease */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.lease_available === true}
            onChange={(e) => setField("lease_available", e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm text-ink-dark">Lease available</span>
        </label>
        {data.lease_available === true && (
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
      </div>

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
                className="h-4 w-4 rounded border-border"
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
                className="h-4 w-4 rounded border-border"
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
