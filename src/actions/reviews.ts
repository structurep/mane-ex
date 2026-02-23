"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createReviewSchema,
  respondToReviewSchema,
} from "@/lib/validators/reviews";

export type ReviewActionState = {
  error?: string;
  data?: unknown;
};

export async function createReview(
  formData: FormData
): Promise<ReviewActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to leave a review." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = createReviewSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (parsed.data.seller_id === user.id) {
    return { error: "You cannot review yourself." };
  }

  // Check for duplicate review (same reviewer + seller + stage + listing)
  const duplicateQuery = supabase
    .from("reviews")
    .select("id")
    .eq("reviewer_id", user.id)
    .eq("seller_id", parsed.data.seller_id)
    .eq("stage", parsed.data.stage);

  if (parsed.data.listing_id) {
    duplicateQuery.eq("listing_id", parsed.data.listing_id);
  }

  const { data: existing } = await duplicateQuery.limit(1);

  if (existing && existing.length > 0) {
    return { error: "You have already left a review for this stage." };
  }

  // Check if this is a verified purchase
  let isVerifiedPurchase = false;
  if (parsed.data.offer_id) {
    const { data: escrow } = await supabase
      .from("escrow_transactions")
      .select("status")
      .eq("offer_id", parsed.data.offer_id)
      .single();

    isVerifiedPurchase =
      escrow?.status === "funds_released" || escrow?.status === "delivery_confirmed";
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      reviewer_id: user.id,
      seller_id: parsed.data.seller_id,
      listing_id: parsed.data.listing_id || null,
      offer_id: parsed.data.offer_id || null,
      stage: parsed.data.stage,
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body,
      is_verified_purchase: isVerifiedPurchase,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: { id: data.id } };
}

export async function respondToReview(
  formData: FormData
): Promise<ReviewActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = respondToReviewSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Verify user is the seller on this review
  const { data: review } = await supabase
    .from("reviews")
    .select("id, seller_id, seller_response")
    .eq("id", parsed.data.review_id)
    .single();

  if (!review) {
    return { error: "Review not found." };
  }

  if (review.seller_id !== user.id) {
    return { error: "Only the seller can respond to this review." };
  }

  if (review.seller_response) {
    return { error: "You have already responded to this review." };
  }

  const { error } = await supabase
    .from("reviews")
    .update({
      seller_response: parsed.data.seller_response,
      seller_responded_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.review_id);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}

export async function getSellerReviews(sellerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(
        id, display_name, avatar_url, city, state
      )
    `)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

export async function getListingReviews(listingId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(
        id, display_name, avatar_url, city, state
      )
    `)
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

export async function getMyReviews() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", data: null };
  }

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(
        id, display_name, avatar_url, city, state
      ),
      listing:horse_listings(id, name, slug)
    `)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}
