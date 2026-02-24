"use server";

import { createClient } from "@/lib/supabase/server";
import type { BillOfSaleData } from "@/types/offers";
import { getStateDisclosureRules } from "./disclosures";

// Re-export for any server-side consumers
export { getStateDisclosureRules };

const PLATFORM_DISCLAIMER =
  "ManeExchange is a marketplace facilitator, not a party to this transaction. " +
  "ManeExchange makes no representations or warranties regarding the horse, " +
  "its condition, soundness, or fitness for any purpose.";

const WARRANTY_DISCLAIMERS: Record<string, string> = {
  as_is:
    'THIS HORSE IS SOLD "AS IS" WITHOUT ANY WARRANTIES, EXPRESS OR IMPLIED, ' +
    "INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY OR FITNESS FOR " +
    "A PARTICULAR PURPOSE. BUYER ASSUMES ALL RISK. This disclaimer is made " +
    "conspicuous pursuant to UCC § 2-316.",
  sound_at_sale:
    "Seller warrants that the horse is sound at the time of sale. This warranty " +
    "does not extend to any condition arising after the date of sale. Any claim " +
    "must be supported by a veterinary examination within 14 days of delivery.",
  sound_for_use:
    "Seller warrants that the horse is sound and suitable for the intended use " +
    "described in this agreement. This warranty is limited to conditions existing " +
    "at the time of sale and does not cover injuries, illnesses, or conditions " +
    "arising after delivery.",
};

/**
 * Generate Bill of Sale data from an escrow transaction.
 * This assembles all required fields from the listing, profiles, and offer.
 */
export async function generateBillOfSale(
  escrowId: string
): Promise<{ data: BillOfSaleData | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "You must be logged in." };
  }

  // Fetch escrow with related data
  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("*")
    .eq("id", escrowId)
    .single();

  if (!escrow) {
    return { data: null, error: "Escrow transaction not found." };
  }

  // Verify participant
  if (escrow.buyer_id !== user.id && escrow.seller_id !== user.id) {
    return { data: null, error: "You don't have access to this transaction." };
  }

  // Fetch listing
  const { data: listing } = await supabase
    .from("horse_listings")
    .select("*")
    .eq("id", escrow.listing_id)
    .single();

  if (!listing) {
    return { data: null, error: "Listing not found." };
  }

  // Fetch buyer and seller profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, full_name, location_city, location_state, location_zip")
    .in("id", [escrow.buyer_id, escrow.seller_id]);

  const buyer = (profiles ?? []).find((p) => p.id === escrow.buyer_id);
  const seller = (profiles ?? []).find((p) => p.id === escrow.seller_id);

  if (!buyer || !seller) {
    return { data: null, error: "Could not load participant profiles." };
  }

  const buyerAddress = [buyer.location_city, buyer.location_state, buyer.location_zip]
    .filter(Boolean)
    .join(", ");
  const sellerAddress = [seller.location_city, seller.location_state, seller.location_zip]
    .filter(Boolean)
    .join(", ");

  const warrantyType = listing.warranty ?? "as_is";

  const billOfSale: BillOfSaleData = {
    // Parties
    buyer_name: buyer.full_name ?? buyer.display_name ?? "Buyer",
    buyer_address: buyerAddress || "Address not provided",
    buyer_state: buyer.location_state ?? "",
    seller_name: seller.full_name ?? seller.display_name ?? "Seller",
    seller_address: sellerAddress || "Address not provided",
    seller_state: seller.location_state ?? listing.seller_state ?? "",

    // Horse
    horse_name: listing.name,
    horse_breed: listing.breed,
    horse_registered_name: listing.registered_name,
    horse_registration_number: listing.registration_number,
    horse_color: listing.color,
    horse_gender: listing.gender,
    horse_date_of_birth: listing.date_of_birth,
    horse_height_hands: listing.height_hands,

    // Transaction
    sale_price_cents: escrow.amount_cents,
    warranty_type: warrantyType,
    payment_method: escrow.payment_method,

    // Compliance
    fl_medical_disclosure: listing.fl_medical_disclosure,
    commission_disclosed: listing.commission_disclosed ?? false,
    commission_amount: listing.commission_amount,
    trainer_name: listing.current_trainer,
    dual_agency_disclosed: listing.dual_agency_disclosed ?? false,

    // Disclaimers
    platform_disclaimer: PLATFORM_DISCLAIMER,
    warranty_disclaimer: WARRANTY_DISCLAIMERS[warrantyType] ?? WARRANTY_DISCLAIMERS.as_is,
    inspection_acknowledgment: false,

    // Timestamps
    generated_at: new Date().toISOString(),
    accepted_by_buyer_at: null,
    accepted_by_seller_at: null,
  };

  // Store on escrow transaction
  await supabase
    .from("escrow_transactions")
    .update({ bill_of_sale_data: billOfSale as unknown as Record<string, unknown> })
    .eq("id", escrowId);

  return { data: billOfSale };
}

/**
 * Accept (sign) the Bill of Sale. Both parties must accept.
 */
export async function acceptBillOfSale(
  escrowId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in." };
  }

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("id, buyer_id, seller_id, bill_of_sale_data")
    .eq("id", escrowId)
    .single();

  if (!escrow) {
    return { success: false, error: "Escrow transaction not found." };
  }

  if (escrow.buyer_id !== user.id && escrow.seller_id !== user.id) {
    return { success: false, error: "You don't have access to this transaction." };
  }

  if (!escrow.bill_of_sale_data) {
    return { success: false, error: "Bill of Sale has not been generated yet." };
  }

  const now = new Date().toISOString();
  const bos = escrow.bill_of_sale_data as unknown as BillOfSaleData;

  if (user.id === escrow.buyer_id) {
    bos.accepted_by_buyer_at = now;
    bos.inspection_acknowledgment = true;
  } else {
    bos.accepted_by_seller_at = now;
  }

  const bothAccepted = bos.accepted_by_buyer_at && bos.accepted_by_seller_at;

  await supabase
    .from("escrow_transactions")
    .update({
      bill_of_sale_data: bos as unknown as Record<string, unknown>,
      ...(bothAccepted ? { bill_of_sale_accepted_at: now } : {}),
    })
    .eq("id", escrowId);

  return { success: true };
}

