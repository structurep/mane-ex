"use server";

import { createClient } from "@/lib/supabase/server";
import {
  confirmDeliverySchema,
  addShippingSchema,
  openDisputeSchema,
} from "@/lib/validators/offers";
import {
  calculatePlatformFee,
  calculateSellerNet,
  DELIVERY_CONFIRMATION_DAYS,
  DISPUTE_WINDOW_DAYS,
  formatCentsToDollars,
} from "@/lib/stripe/config";
import { createEscrowPayment } from "@/lib/stripe/escrow";

export type EscrowActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  escrowId?: string;
  clientSecret?: string;
  success?: boolean;
};

/**
 * Initiate escrow after an offer is accepted.
 * Creates escrow_transaction record and Stripe PaymentIntent.
 * Called by the buyer to proceed to payment.
 */
export async function initiateEscrow(
  offerId: string
): Promise<EscrowActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // Fetch offer
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("*")
    .eq("id", offerId)
    .single();

  if (offerError || !offer) {
    return { error: "Offer not found." };
  }

  if (offer.buyer_id !== user.id) {
    return { error: "Only the buyer can initiate payment." };
  }

  if (offer.status !== "accepted") {
    return { error: "This offer must be accepted before payment can begin." };
  }

  // Check seller has completed Stripe onboarding
  const { data: seller } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_onboarding_complete")
    .eq("id", offer.seller_id)
    .single();

  if (!seller?.stripe_account_id || !seller.stripe_onboarding_complete) {
    return {
      error: "The seller has not completed payment setup. Please ask them to complete their Stripe onboarding.",
    };
  }

  // Check for existing escrow on this offer
  const { data: existingEscrow } = await supabase
    .from("escrow_transactions")
    .select("id")
    .eq("offer_id", offerId)
    .maybeSingle();

  if (existingEscrow) {
    return { error: "Payment has already been initiated for this offer." };
  }

  // Fetch listing name for description
  const { data: listing } = await supabase
    .from("horse_listings")
    .select("name")
    .eq("id", offer.listing_id)
    .single();

  // Fetch buyer email for receipt
  const { data: buyerProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  const platformFeeCents = calculatePlatformFee(offer.amount_cents);
  const sellerNetCents = calculateSellerNet(offer.amount_cents);

  // Create escrow record first
  const { data: escrow, error: escrowError } = await supabase
    .from("escrow_transactions")
    .insert({
      offer_id: offerId,
      listing_id: offer.listing_id,
      buyer_id: offer.buyer_id,
      seller_id: offer.seller_id,
      amount_cents: offer.amount_cents,
      platform_fee_cents: platformFeeCents,
      seller_net_cents: sellerNetCents,
      payment_method: offer.payment_method,
      status: "awaiting_payment",
      status_history: [
        {
          status: "awaiting_payment",
          previous_status: null,
          timestamp: new Date().toISOString(),
          note: "Escrow initiated by buyer",
        },
      ],
    })
    .select("id")
    .single();

  if (escrowError) {
    return { error: escrowError.message };
  }

  // Create Stripe PaymentIntent
  const { clientSecret, paymentIntentId, error: stripeError } =
    await createEscrowPayment({
      amountCents: offer.amount_cents,
      buyerEmail: buyerProfile?.email ?? "",
      paymentMethod: offer.payment_method,
      escrowId: escrow.id,
      listingName: listing?.name ?? "Horse listing",
    });

  if (stripeError) {
    // Clean up the escrow record
    await supabase
      .from("escrow_transactions")
      .delete()
      .eq("id", escrow.id);
    return { error: stripeError };
  }

  // Update escrow with Stripe PaymentIntent ID
  await supabase
    .from("escrow_transactions")
    .update({ stripe_payment_intent_id: paymentIntentId })
    .eq("id", escrow.id);

  // Update offer status to in_escrow
  await supabase
    .from("offers")
    .update({ status: "in_escrow" })
    .eq("id", offerId);

  return { escrowId: escrow.id, clientSecret };
}

/**
 * Seller adds shipping/transport tracking info.
 */
export async function addShippingInfo(
  _prevState: EscrowActionState,
  formData: FormData
): Promise<EscrowActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const raw = {
    escrow_id: formData.get("escrow_id") as string,
    shipping_tracking: formData.get("shipping_tracking") as string,
    expected_delivery_date: formData.get("expected_delivery_date") as string,
  };

  const parsed = addShippingSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      fieldErrors[path] = issue.message;
    });
    return { fieldErrors, error: "Please fix the errors below." };
  }

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("id, seller_id, buyer_id, status, listing_id")
    .eq("id", parsed.data.escrow_id)
    .single();

  if (!escrow) {
    return { error: "Escrow transaction not found." };
  }

  if (escrow.seller_id !== user.id) {
    return { error: "Only the seller can add shipping info." };
  }

  if (escrow.status !== "funds_held") {
    return { error: "Shipping can only be added after payment is confirmed." };
  }

  const { error: updateError } = await supabase
    .from("escrow_transactions")
    .update({
      shipping_tracking: parsed.data.shipping_tracking,
      expected_delivery_date: parsed.data.expected_delivery_date,
    })
    .eq("id", escrow.id);

  if (updateError) {
    return { error: updateError.message };
  }

  // Notify buyer
  const { data: listing } = await supabase
    .from("horse_listings")
    .select("name")
    .eq("id", escrow.listing_id)
    .single();

  await supabase.from("notifications").insert({
    user_id: escrow.buyer_id,
    type: "offer",
    title: `Shipping update for ${listing?.name ?? "your horse"}`,
    body: `Transport tracking has been added. Expected delivery: ${parsed.data.expected_delivery_date}`,
    link: `/dashboard/offers/${escrow.id}`,
    metadata: { escrow_id: escrow.id },
  });

  return { escrowId: escrow.id, success: true };
}

/**
 * Buyer confirms delivery of the horse.
 * Starts the 14-day dispute window, after which funds auto-release.
 */
export async function confirmDelivery(
  _prevState: EscrowActionState,
  formData: FormData
): Promise<EscrowActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const raw = {
    escrow_id: formData.get("escrow_id") as string,
    inspection_acknowledged:
      formData.get("inspection_acknowledged") === "true",
  };

  const parsed = confirmDeliverySchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      fieldErrors[path] = issue.message;
    });
    return { fieldErrors, error: "Please fix the errors below." };
  }

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("id, buyer_id, seller_id, status, listing_id, amount_cents")
    .eq("id", parsed.data.escrow_id)
    .single();

  if (!escrow) {
    return { error: "Escrow transaction not found." };
  }

  if (escrow.buyer_id !== user.id) {
    return { error: "Only the buyer can confirm delivery." };
  }

  if (escrow.status !== "funds_held") {
    return { error: "Delivery can only be confirmed when funds are held in escrow." };
  }

  const now = new Date();
  const autoReleaseAt = new Date(now);
  autoReleaseAt.setDate(
    autoReleaseAt.getDate() + DISPUTE_WINDOW_DAYS
  );

  const { error: updateError } = await supabase
    .from("escrow_transactions")
    .update({
      status: "delivery_confirmed",
      delivery_confirmed_at: now.toISOString(),
      delivery_confirmed_by: user.id,
      auto_release_at: autoReleaseAt.toISOString(),
    })
    .eq("id", escrow.id);

  if (updateError) {
    return { error: updateError.message };
  }

  const { data: listing } = await supabase
    .from("horse_listings")
    .select("name")
    .eq("id", escrow.listing_id)
    .single();

  // Notify seller
  await supabase.from("notifications").insert({
    user_id: escrow.seller_id,
    type: "offer",
    title: `Delivery confirmed for ${listing?.name ?? "your horse"}`,
    body: `Buyer confirmed receipt. Funds will be released after ${DISPUTE_WINDOW_DAYS}-day review period.`,
    link: `/dashboard/offers/${escrow.id}`,
    metadata: { escrow_id: escrow.id },
  });

  return { escrowId: escrow.id, success: true };
}

/**
 * Buyer opens a dispute during the dispute window.
 */
export async function openDispute(
  _prevState: EscrowActionState,
  formData: FormData
): Promise<EscrowActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const raw = {
    escrow_id: formData.get("escrow_id") as string,
    reason: formData.get("reason") as string,
  };

  const parsed = openDisputeSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      fieldErrors[path] = issue.message;
    });
    return { fieldErrors, error: "Please fix the errors below." };
  }

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("id, buyer_id, seller_id, status, listing_id, auto_release_at")
    .eq("id", parsed.data.escrow_id)
    .single();

  if (!escrow) {
    return { error: "Escrow transaction not found." };
  }

  if (escrow.buyer_id !== user.id) {
    return { error: "Only the buyer can open a dispute." };
  }

  if (escrow.status !== "delivery_confirmed") {
    return { error: "Disputes can only be opened after delivery is confirmed." };
  }

  // Check we're still within dispute window
  if (escrow.auto_release_at && new Date(escrow.auto_release_at) < new Date()) {
    return { error: "The dispute window has closed. Funds have been released." };
  }

  const { error: updateError } = await supabase
    .from("escrow_transactions")
    .update({
      status: "dispute_opened",
      dispute_reason: parsed.data.reason,
      dispute_opened_at: new Date().toISOString(),
      auto_release_at: null, // Cancel auto-release
    })
    .eq("id", escrow.id);

  if (updateError) {
    return { error: updateError.message };
  }

  const { data: listing } = await supabase
    .from("horse_listings")
    .select("name")
    .eq("id", escrow.listing_id)
    .single();

  // Notify seller
  await supabase.from("notifications").insert({
    user_id: escrow.seller_id,
    type: "offer",
    title: `Dispute opened for ${listing?.name ?? "your horse"}`,
    body: "The buyer has opened a dispute. Funds are held pending resolution.",
    link: `/dashboard/offers/${escrow.id}`,
    metadata: { escrow_id: escrow.id },
  });

  // Also notify admins (system notification)
  await supabase.from("notifications").insert({
    user_id: escrow.seller_id, // TODO: Replace with admin notification system
    type: "system",
    title: `Dispute requires review: ${listing?.name ?? "unknown listing"}`,
    body: `Reason: ${parsed.data.reason.substring(0, 200)}`,
    metadata: { escrow_id: escrow.id, dispute: true },
  });

  return { escrowId: escrow.id, success: true };
}
