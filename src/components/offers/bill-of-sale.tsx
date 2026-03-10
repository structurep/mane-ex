"use client";

import { formatCentsToDollars } from "@/lib/stripe/config";
import { getStateDisclosureRules } from "@/lib/legal/disclosures";
import type { BillOfSaleData } from "@/types/offers";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle } from "lucide-react";

type BillOfSaleProps = {
  data: BillOfSaleData;
  escrowId: string;
};

export function BillOfSale({ data, escrowId }: BillOfSaleProps) {
  const stateRules = getStateDisclosureRules(data.seller_state, data.buyer_state);
  const isFullyAccepted = data.accepted_by_buyer_at && data.accepted_by_seller_at;

  return (
    <div className="mx-auto max-w-3xl rounded-lg border border-crease-light bg-paper-white p-8 shadow-folded print:shadow-none print:border-none">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink-black">
          EQUINE BILL OF SALE
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          Facilitated by ManeExchange &middot; Document #{escrowId.substring(0, 8).toUpperCase()}
        </p>
        <p className="text-xs text-ink-light">
          Generated {new Date(data.generated_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <Separator className="my-6" />

      {/* Parties */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="overline text-ink-light">SELLER</p>
          <p className="mt-1 font-medium text-ink-black">{data.seller_name}</p>
          <p className="text-sm text-ink-mid">{data.seller_address}</p>
        </div>
        <div>
          <p className="overline text-ink-light">BUYER</p>
          <p className="mt-1 font-medium text-ink-black">{data.buyer_name}</p>
          <p className="text-sm text-ink-mid">{data.buyer_address}</p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Horse Description */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-black">
          Description of Horse
        </h2>
        <div className="grid gap-x-8 gap-y-2 text-sm md:grid-cols-2">
          <InfoRow label="Barn Name" value={data.horse_name} />
          <InfoRow label="Breed" value={data.horse_breed} />
          <InfoRow label="Registered Name" value={data.horse_registered_name} />
          <InfoRow label="Registration #" value={data.horse_registration_number} />
          <InfoRow label="Color" value={data.horse_color} />
          <InfoRow label="Gender" value={data.horse_gender} />
          <InfoRow
            label="Date of Birth"
            value={
              data.horse_date_of_birth
                ? new Date(data.horse_date_of_birth).toLocaleDateString()
                : null
            }
          />
          <InfoRow
            label="Height"
            value={data.horse_height_hands ? `${data.horse_height_hands}hh` : null}
          />
        </div>
      </section>

      <Separator className="my-6" />

      {/* Sale Terms */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-black">
          Terms of Sale
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-mid">Sale Price</span>
            <span className="text-lg font-bold text-ink-black">
              {formatCentsToDollars(data.sale_price_cents)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-mid">Payment Method</span>
            <span className="font-medium text-ink-dark">
              {data.payment_method === "ach" ? "Bank Transfer (ACH)" : "Credit Card"}
            </span>
          </div>
        </div>
      </section>

      <Separator className="my-6" />

      {/* Warranty — UCC 2-316 conspicuous display */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-black">
          Warranty
        </h2>
        <div
          className={`rounded-md border-2 p-4 ${
            data.warranty_type === "as_is"
              ? "border-red bg-red-light"
              : "border-crease-light bg-paper-warm"
          }`}
        >
          {/* UCC 2-316: "As Is" must be CONSPICUOUS — bold, caps, larger font */}
          <p
            className={`font-bold uppercase tracking-wide ${
              data.warranty_type === "as_is"
                ? "text-lg text-red"
                : "text-ink-black"
            }`}
          >
            {data.warranty_type === "as_is"
              ? "SOLD AS IS — NO WARRANTIES"
              : data.warranty_type === "sound_at_sale"
                ? "SOUND AT TIME OF SALE"
                : "SOUND FOR INTENDED USE"}
          </p>
          <p className="mt-2 text-sm text-ink-mid">{data.warranty_disclaimer}</p>
        </div>
      </section>

      {/* State-specific disclosures */}
      {stateRules.length > 0 && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink-black">
              State Disclosure Requirements
            </h2>
            {stateRules.map((rule) => (
              <div
                key={rule.state}
                className="mb-4 rounded-md border border-gold/30 bg-gold/5 p-4"
              >
                <p className="text-sm font-medium text-ink-dark">
                  {rule.state} — {rule.statute}
                </p>
                <ul className="mt-2 space-y-1">
                  {rule.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-mid">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* FL Rule 5H medical disclosure */}
            {data.fl_medical_disclosure && (
              <div className="rounded-md bg-paper-warm p-4">
                <p className="text-sm font-medium text-ink-dark">
                  Medical Treatments Within 7 Days (FL Rule 5H)
                </p>
                <p className="mt-1 text-sm text-ink-mid">
                  {data.fl_medical_disclosure}
                </p>
              </div>
            )}

            {/* Commission disclosure */}
            {data.commission_disclosed && data.commission_amount && (
              <div className="mt-3 rounded-md bg-paper-warm p-4">
                <p className="text-sm font-medium text-ink-dark">
                  Commission Disclosure
                </p>
                <p className="mt-1 text-sm text-ink-mid">
                  Trainer commission: {data.commission_amount}
                  {data.trainer_name && ` (${data.trainer_name})`}
                </p>
                {data.dual_agency_disclosed && (
                  <p className="mt-1 text-xs text-ink-light">
                    Dual agency has been disclosed and acknowledged by both parties.
                  </p>
                )}
              </div>
            )}
          </section>
        </>
      )}

      <Separator className="my-6" />

      {/* Platform disclaimer */}
      <section className="rounded-md bg-paper-warm p-4 text-xs text-ink-light">
        <p className="font-medium text-ink-mid">Platform Disclaimer</p>
        <p className="mt-1">{data.platform_disclaimer}</p>
      </section>

      <Separator className="my-6" />

      {/* Signatures / acceptance */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-ink-black">
          Acceptance
        </h2>
        <p className="mb-4 text-sm text-ink-mid">
          By accepting below, each party acknowledges they have read and agree to the
          terms of this Bill of Sale. This document satisfies the writing requirement
          of UCC § 2-201 (Statute of Frauds) for the sale of goods exceeding $500.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <SignatureBlock
            role="Seller"
            name={data.seller_name}
            acceptedAt={data.accepted_by_seller_at}
          />
          <SignatureBlock
            role="Buyer"
            name={data.buyer_name}
            acceptedAt={data.accepted_by_buyer_at}
          />
        </div>

        {isFullyAccepted && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-forest/10 p-3 text-sm text-forest">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">
              Bill of Sale accepted by both parties.
            </span>
          </div>
        )}
      </section>

      {/* Print button (hidden in print) */}
      <div className="mt-8 text-center print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded-md bg-ink-black px-6 py-2 text-sm font-medium text-paper-white hover:bg-ink-dark"
        >
          Print Bill of Sale
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between border-b border-crease-light py-1.5">
      <span className="text-ink-light">{label}</span>
      <span className="font-medium text-ink-dark">{value}</span>
    </div>
  );
}

function SignatureBlock({
  role,
  name,
  acceptedAt,
}: {
  role: string;
  name: string;
  acceptedAt: string | null;
}) {
  return (
    <div className="rounded-md border border-crease-light bg-paper-cream p-4">
      <p className="overline text-ink-light">{role.toUpperCase()}</p>
      <p className="mt-1 font-medium text-ink-dark">{name}</p>
      {acceptedAt ? (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-forest">
          <CheckCircle className="h-3 w-3" />
          Accepted {new Date(acceptedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-light">
          <AlertTriangle className="h-3 w-3" />
          Pending acceptance
        </div>
      )}
    </div>
  );
}
