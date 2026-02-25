"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createOfferSchema,
  counterOfferSchema,
} from "@/lib/validators/offers";
import { MIN_COMPLETENESS_FOR_OFFER } from "@/lib/stripe/config";
import { formatCentsToDollars } from "@/lib/stripe/config";

export type OfferActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  offerId?: string;
  success?: boolean;
};

/**
 * Buyer creates an offer on a listing.
 * Gated on listing completeness >= 50 and listing status = 'active'.
 * Auto-creates a conversation if one doesn't exist.
 */
export async function createOffer(
  _prevState: OfferActionState,
  formData: FormData
): Promise<OfferActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to make an offer." };
  }

  const raw = {
    listing_id: formData.get("listing_id") as string,
    amount_cents: Number(formData.get("amount_cents")),
    message: (formData.get("message") as string) || undefined,
    payment_method: (formData.get("payment_method") as string) || "ach",
  };

  const parsed = createOfferSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      fieldErrors[path] = issue.message;
    });
    return { fieldErrors, error: "Please fix the errors below." };
  }

  // Fetch listing to validate status, completeness, and get seller_id
  const { data: listing, error: listingError } = await supabase
    .from("horse_listings")
    .select("id, seller_id, status, completeness_score, name, slug")
    .eq("id", parsed.data.listing_id)
    .single();

  if (listingError || !listing) {
    return { error: "Listing not found." };
  }

  if (listing.seller_id === user.id) {
    return { error: "You cannot make an offer on your own listing." };
  }

  if (listing.status !== "active") {
    return { error: "This listing is not currently accepting offers." };
  }

  if (listing.completeness_score < MIN_COMPLETENESS_FOR_OFFER) {
    return {
      error: "This listing does not have enough documentation to accept offers yet.",
    };
  }

  // Check for existing pending offer from this buyer on this listing
  const { data: existingOffer } = await supabase
    .from("offers")
    .select("id")
    .eq("listing_id", listing.id)
    .eq("buyer_id", user.id)
    .in("status", ["pending", "in_escrow"])
    .limit(1)
    .maybeSingle();

  if (existingOffer) {
    return { error: "You already have an active offer on this listing." };
  }

  // Insert the offer
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .insert({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      amount_cents: parsed.data.amount_cents,
      message: parsed.data.message ?? null,
      payment_method: parsed.data.payment_method,
      status: "pending",
    })
    .select("id")
    .single();

  if (offerError) {
    return { error: offerError.message };
  }

  // Notify seller
  await supabase.from("notifications").insert({
    user_id: listing.seller_id,
    type: "offer",
    title: `New offer on ${listing.name}`,
    body: `A buyer offered ${formatCentsToDollars(parsed.data.amount_cents)}`,
    link: `/dashboard/offers/${offer.id}`,
    metadata: {
      listing_id: listing.id,
      offer_id: offer.id,
      buyer_id: user.id,
    },
  });

  // Inject system message into conversation (if one exists for this listing)
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant_1_id.eq.${user.id},participant_2_id.eq.${listing.seller_id}),and(participant_1_id.eq.${listing.seller_id},participant_2_id.eq.${user.id})`
    )
    .eq("listing_id", listing.id)
    .maybeSingle();

  if (conversation) {
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: null,
      body: `Offer made for ${formatCentsToDollars(parsed.data.amount_cents)}`,
      is_system: true,
    });
  }

  return { offerId: offer.id };
}

/**
 * Seller accepts an offer.
 * Changes listing status to 'under_offer' (via DB trigger).
 */
export async function acceptOffer(
  offerId: string
): Promise<OfferActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // Verify offer exists and belongs to this seller
  const { data: offer, error: fetchError } = await supabase
    .from("offers")
    .select("id, status, buyer_id, seller_id, listing_id, amount_cents")
    .eq("id", offerId)
    .single();

  if (fetchError || !offer) {
    return { error: "Offer not found." };
  }

  if (offer.seller_id !== user.id) {
    return { error: "You can only respond to offers on your own listings." };
  }

  if (offer.status !== "pending") {
    return { error: `This offer is ${offer.status} and cannot be accepted.` };
  }

  // Accept the offer
  const { error: updateError } = await supabase
    .from("offers")
    .update({
      status: "accepted",
      responded_at: new Date().toISOString(),
    })
    .eq("id", offerId)
    .eq("seller_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  // Reject all other pending offers on this listing
  await supabase
    .from("offers")
    .update({
      status: "rejected",
      responded_at: new Date().toISOString(),
    })
    .eq("listing_id", offer.listing_id)
    .eq("status", "pending")
    .neq("id", offerId);

  // Fetch listing name for notification
  const { data: listing } = await supabase
    .from("horse_listings")
    .select("name")
    .eq("id", offer.listing_id)
    .single();

  // Notify buyer
  await supabase.from("notifications").insert({
    user_id: offer.buyer_id,
    type: "offer",
    title: `Offer accepted on ${listing?.name ?? "a listing"}`,
    body: `Your offer of ${formatCentsToDollars(offer.amount_cents)} was accepted. Proceed to payment.`,
    link: `/dashboard/offers/${offerId}`,
    metadata: {
      listing_id: offer.listing_id,
      offer_id: offerId,
    },
  });

  return { offerId, success: true };
}

/**
 * Seller rejects an offer.
 */
export async function rejectOffer(
  offerId: string,
  reason?: string
): Promise<OfferActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: offer, error: fetchError } = await supabase
    .from("offers")
    .select("id, status, buyer_id, seller_id, listing_id, amount_cents")
    .eq("id", offerId)
    .single();

  if (fetchError || !offer) {
    return { error: "Offer not found." };
  }

  if (offer.seller_id !== user.id) {
    return { error: "You can only respond to offers on your own listings." };
  }

  if (offer.status !== "pending") {
    return { error: `This offer is ${offer.status} and cannot be rejected.` };
  }

  const { error: updateError } = await supabase
    .from("offers")
    .update({
      status: "rejected",
      responded_at: new Date().toISOString(),
    })
    .eq("id", offerId)
    .eq("seller_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  const { data: listing } = await supabase
    .from("horse_listings")
    .select("name")
    .eq("id", offer.listing_id)
    .single();

  await supabase.from("notifications").insert({
    user_id: offer.buyer_id,
    type: "offer",
    title: `Offer declined on ${listing?.name ?? "a listing"}`,
    body: reason
      ? `Your offer of ${formatCentsToDollars(offer.amount_cents)} was declined. ${reason}`
      : `Your offer of ${formatCentsToDollars(offer.amount_cents)} was declined.`,
    link: `/dashboard/offers/${offerId}`,
    metadata: {
      listing_id: offer.listing_id,
      offer_id: offerId,
    },
  });

  return { offerId, success: true };
}

/**
 * Seller counter-offers. Creates a new offer linked to the original.
 */
export async function counterOffer(
  _prevState: OfferActionState,
  formData: FormData
): Promise<OfferActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const raw = {
    offer_id: formData.get("offer_id") as string,
    counter_amount_cents: Number(formData.get("counter_amount_cents")),
    message: (formData.get("message") as string) || undefined,
  };

  const parsed = counterOfferSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      fieldErrors[path] = issue.message;
    });
    return { fieldErrors, error: "Please fix the errors below." };
  }

  // Fetch the original offer
  const { data: originalOffer, error: fetchError } = await supabase
    .from("offers")
    .select("id, status, buyer_id, seller_id, listing_id, amount_cents, payment_method")
    .eq("id", parsed.data.offer_id)
    .single();

  if (fetchError || !originalOffer) {
    return { error: "Original offer not found." };
  }

  if (originalOffer.seller_id !== user.id) {
    return { error: "You can only counter offers on your own listings." };
  }

  if (originalOffer.status !== "pending") {
    return { error: `This offer is ${originalOffer.status} and cannot be countered.` };
  }

  // Mark original as countered
  const { error: updateError } = await supabase
    .from("offers")
    .update({
      status: "countered",
      counter_amount_cents: parsed.data.counter_amount_cents,
      responded_at: new Date().toISOString(),
    })
    .eq("id", originalOffer.id)
    .eq("seller_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  // Create new counter-offer (roles swap: seller is now the "offeror")
  const { data: newOffer, error: insertError } = await supabase
    .from("offers")
    .insert({
      listing_id: originalOffer.listing_id,
      buyer_id: originalOffer.buyer_id,
      seller_id: originalOffer.seller_id,
      amount_cents: parsed.data.counter_amount_cents,
      message: parsed.data.message ?? null,
      payment_method: originalOffer.payment_method,
      parent_offer_id: originalOffer.id,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  const { data: listing } = await supabase
    .from("horse_listings")
    .select("name")
    .eq("id", originalOffer.listing_id)
    .single();

  // Notify buyer about the counter
  await supabase.from("notifications").insert({
    user_id: originalOffer.buyer_id,
    type: "offer",
    title: `Counter-offer on ${listing?.name ?? "a listing"}`,
    body: `Seller countered with ${formatCentsToDollars(parsed.data.counter_amount_cents)}`,
    link: `/dashboard/offers/${newOffer.id}`,
    metadata: {
      listing_id: originalOffer.listing_id,
      offer_id: newOffer.id,
      original_offer_id: originalOffer.id,
    },
  });

  // Inject system message
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant_1_id.eq.${originalOffer.buyer_id},participant_2_id.eq.${originalOffer.seller_id}),and(participant_1_id.eq.${originalOffer.seller_id},participant_2_id.eq.${originalOffer.buyer_id})`
    )
    .eq("listing_id", originalOffer.listing_id)
    .maybeSingle();

  if (conversation) {
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: null,
      body: `Counter-offer: ${formatCentsToDollars(parsed.data.counter_amount_cents)}`,
      is_system: true,
    });
  }

  return { offerId: newOffer.id };
}

/**
 * Buyer withdraws their pending offer.
 */
export async function withdrawOffer(
  offerId: string
): Promise<OfferActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: offer, error: fetchError } = await supabase
    .from("offers")
    .select("id, status, buyer_id, seller_id, listing_id")
    .eq("id", offerId)
    .single();

  if (fetchError || !offer) {
    return { error: "Offer not found." };
  }

  if (offer.buyer_id !== user.id) {
    return { error: "You can only withdraw your own offers." };
  }

  if (offer.status !== "pending") {
    return { error: `This offer is ${offer.status} and cannot be withdrawn.` };
  }

  const { error: updateError } = await supabase
    .from("offers")
    .update({ status: "withdrawn" })
    .eq("id", offerId)
    .eq("buyer_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  return { offerId, success: true };
}

/**
 * Fetch offers for the current user (as buyer or seller).
 * Returns offers grouped by role with listing + participant enrichment.
 */
export async function getOffers(role: "buyer" | "seller"): Promise<{
  offers: Record<string, unknown>[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { offers: [], error: "You must be logged in." };
  }

  const column = role === "buyer" ? "buyer_id" : "seller_id";

  const { data: offers, error } = await supabase
    .from("offers")
    .select("*")
    .eq(column, user.id)
    .is("parent_offer_id", null) // Only root offers (not counters displayed separately)
    .order("created_at", { ascending: false });

  if (error) {
    return { offers: [], error: error.message };
  }

  if (!offers || offers.length === 0) {
    return { offers: [] };
  }

  // Batch-fetch related listings
  const listingIds = [...new Set(offers.map((o) => o.listing_id))];
  const { data: listings } = await supabase
    .from("horse_listings")
    .select("id, name, slug, price, breed, location_state, completeness_score")
    .in("id", listingIds);

  const listingMap = new Map((listings ?? []).map((l) => [l.id, l]));

  // Batch-fetch other party profiles
  const otherPartyIds = [
    ...new Set(
      offers.map((o) => (role === "buyer" ? o.seller_id : o.buyer_id))
    ),
  ];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", otherPartyIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  // Batch-fetch counter offers
  const offerIds = offers.map((o) => o.id);
  const { data: counterOffers } = await supabase
    .from("offers")
    .select("*")
    .in("parent_offer_id", offerIds)
    .order("created_at", { ascending: true });

  const counterMap = new Map<string, Record<string, unknown>[]>();
  for (const co of counterOffers ?? []) {
    const existing = counterMap.get(co.parent_offer_id) ?? [];
    existing.push(co);
    counterMap.set(co.parent_offer_id, existing);
  }

  const enriched = offers.map((offer) => {
    const otherPartyId =
      role === "buyer" ? offer.seller_id : offer.buyer_id;
    return {
      ...offer,
      listing: listingMap.get(offer.listing_id) ?? null,
      other_party: profileMap.get(otherPartyId) ?? null,
      counter_offers: counterMap.get(offer.id) ?? [],
    };
  });

  return { offers: enriched };
}

/**
 * Fetch a single offer with full details for the offer detail page.
 */
export async function getOfferDetail(offerId: string): Promise<{
  offer: Record<string, unknown> | null;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { offer: null, error: "You must be logged in." };
  }

  const { data: offer, error } = await supabase
    .from("offers")
    .select("*")
    .eq("id", offerId)
    .single();

  if (error || !offer) {
    return { offer: null, error: "Offer not found." };
  }

  // Verify the user is a participant
  if (offer.buyer_id !== user.id && offer.seller_id !== user.id) {
    return { offer: null, error: "You don't have access to this offer." };
  }

  // Fetch listing details
  const { data: listing } = await supabase
    .from("horse_listings")
    .select(
      "id, name, slug, price, breed, location_state, completeness_score, warranty, seller_state"
    )
    .eq("id", offer.listing_id)
    .single();

  // Fetch primary image
  let primaryImageUrl: string | null = null;
  if (listing) {
    const { data: media } = await supabase
      .from("listing_media")
      .select("url")
      .eq("listing_id", listing.id)
      .eq("is_primary", true)
      .limit(1)
      .maybeSingle();
    primaryImageUrl = media?.url ?? null;
  }

  // Fetch both participant profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      "id, display_name, avatar_url, location_state, stripe_account_id, stripe_onboarding_complete"
    )
    .in("id", [offer.buyer_id, offer.seller_id]);

  const buyer = (profiles ?? []).find((p) => p.id === offer.buyer_id);
  const seller = (profiles ?? []).find((p) => p.id === offer.seller_id);

  // Fetch escrow transaction if exists
  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("*")
    .eq("offer_id", offerId)
    .maybeSingle();

  // Fetch counter-offer chain
  const { data: counterOffers } = await supabase
    .from("offers")
    .select("*")
    .eq("parent_offer_id", offerId)
    .order("created_at", { ascending: true });

  return {
    offer: {
      ...offer,
      listing: listing
        ? { ...listing, primary_image_url: primaryImageUrl }
        : null,
      buyer: buyer
        ? {
            id: buyer.id,
            display_name: buyer.display_name,
            avatar_url: buyer.avatar_url,
            location_state: buyer.location_state,
          }
        : null,
      seller: seller
        ? {
            id: seller.id,
            display_name: seller.display_name,
            avatar_url: seller.avatar_url,
            stripe_onboarding_complete: seller.stripe_onboarding_complete,
          }
        : null,
      escrow: escrow ?? null,
      counter_offers: counterOffers ?? [],
    },
  };
}
