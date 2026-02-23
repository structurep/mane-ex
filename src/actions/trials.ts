"use server";

import { createClient } from "@/lib/supabase/server";
import {
  requestTrialSchema,
  respondTrialSchema,
  completeTrialSchema,
  createTourSchema,
  addTourStopSchema,
  removeTourStopSchema,
} from "@/lib/validators/trials";

export type TrialActionState = {
  error?: string;
  data?: unknown;
};

// ── Trial Requests ──

export async function requestTrial(
  formData: FormData
): Promise<TrialActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to request a trial." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = requestTrialSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Get listing to find seller_id
  const { data: listing, error: listingError } = await supabase
    .from("horse_listings")
    .select("id, seller_id, status")
    .eq("id", parsed.data.listing_id)
    .single();

  if (listingError || !listing) {
    return { error: "Listing not found." };
  }

  if (listing.status !== "active" && listing.status !== "under_offer") {
    return { error: "This listing is not available for trials." };
  }

  if (listing.seller_id === user.id) {
    return { error: "You cannot request a trial for your own listing." };
  }

  // Check for existing pending/confirmed trial for same listing by same buyer
  const { data: existing } = await supabase
    .from("trial_requests")
    .select("id")
    .eq("listing_id", parsed.data.listing_id)
    .eq("buyer_id", user.id)
    .in("status", ["requested", "confirmed", "rescheduled"])
    .limit(1);

  if (existing && existing.length > 0) {
    return { error: "You already have an active trial request for this horse." };
  }

  const { data, error } = await supabase
    .from("trial_requests")
    .insert({
      listing_id: parsed.data.listing_id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      preferred_date: parsed.data.preferred_date,
      alternate_date: parsed.data.alternate_date || null,
      buyer_notes: parsed.data.buyer_notes || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: { id: data.id } };
}

export async function respondTrial(
  formData: FormData
): Promise<TrialActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = respondTrialSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Verify user is the seller on this trial
  const { data: trial } = await supabase
    .from("trial_requests")
    .select("id, seller_id, buyer_id, status")
    .eq("id", parsed.data.trial_id)
    .single();

  if (!trial) {
    return { error: "Trial request not found." };
  }

  if (trial.seller_id !== user.id) {
    return { error: "Only the seller can respond to trial requests." };
  }

  if (!["requested", "rescheduled"].includes(trial.status)) {
    return { error: "This trial request cannot be updated." };
  }

  const updateData: Record<string, unknown> = {
    status: parsed.data.status,
    seller_notes: parsed.data.seller_notes || null,
  };

  if (parsed.data.status === "confirmed" && parsed.data.confirmed_date) {
    updateData.confirmed_date = parsed.data.confirmed_date;
  }

  const { error } = await supabase
    .from("trial_requests")
    .update(updateData)
    .eq("id", parsed.data.trial_id);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}

export async function completeTrial(
  formData: FormData
): Promise<TrialActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = completeTrialSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Verify user is buyer or seller
  const { data: trial } = await supabase
    .from("trial_requests")
    .select("id, seller_id, buyer_id, status")
    .eq("id", parsed.data.trial_id)
    .single();

  if (!trial) {
    return { error: "Trial request not found." };
  }

  if (trial.seller_id !== user.id && trial.buyer_id !== user.id) {
    return { error: "Only participants can complete a trial." };
  }

  if (trial.status !== "confirmed") {
    return { error: "Only confirmed trials can be marked as completed." };
  }

  const { error } = await supabase
    .from("trial_requests")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.trial_id);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}

export async function cancelTrial(
  trialId: string
): Promise<TrialActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: trial } = await supabase
    .from("trial_requests")
    .select("id, seller_id, buyer_id, status")
    .eq("id", trialId)
    .single();

  if (!trial) {
    return { error: "Trial request not found." };
  }

  if (trial.seller_id !== user.id && trial.buyer_id !== user.id) {
    return { error: "Only participants can cancel a trial." };
  }

  if (["completed", "cancelled", "no_show"].includes(trial.status)) {
    return { error: "This trial cannot be cancelled." };
  }

  const { error } = await supabase
    .from("trial_requests")
    .update({ status: "cancelled" })
    .eq("id", trialId);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}

export async function getMyTrials() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", data: null };
  }

  // Get trials where user is buyer or seller
  const { data, error } = await supabase
    .from("trial_requests")
    .select(`
      *,
      listing:horse_listings(id, name, slug, breed, price, location_city, location_state),
      buyer:profiles!trial_requests_buyer_id_fkey(id, display_name, avatar_url),
      seller:profiles!trial_requests_seller_id_fkey(id, display_name, avatar_url, phone)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

// ── Tours ──

export async function createTour(
  formData: FormData
): Promise<TrialActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a tour." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = createTourSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { data, error } = await supabase
    .from("tours")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      tour_date: parsed.data.tour_date,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: { id: data.id } };
}

export async function addTourStop(
  formData: FormData
): Promise<TrialActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = addTourStopSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Verify tour belongs to user
  const { data: tour } = await supabase
    .from("tours")
    .select("id, user_id")
    .eq("id", parsed.data.tour_id)
    .single();

  if (!tour || tour.user_id !== user.id) {
    return { error: "Tour not found." };
  }

  // Verify trial belongs to user as buyer
  const { data: trial } = await supabase
    .from("trial_requests")
    .select("id, buyer_id")
    .eq("id", parsed.data.trial_request_id)
    .single();

  if (!trial || trial.buyer_id !== user.id) {
    return { error: "Trial request not found." };
  }

  const { data, error } = await supabase
    .from("tour_stops")
    .insert({
      tour_id: parsed.data.tour_id,
      trial_request_id: parsed.data.trial_request_id,
      stop_order: parsed.data.stop_order,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "This trial is already in the tour." };
    }
    return { error: error.message };
  }

  return { data: { id: data.id } };
}

export async function removeTourStop(
  formData: FormData
): Promise<TrialActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = removeTourStopSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Verify tour belongs to user
  const { data: tour } = await supabase
    .from("tours")
    .select("id, user_id")
    .eq("id", parsed.data.tour_id)
    .single();

  if (!tour || tour.user_id !== user.id) {
    return { error: "Tour not found." };
  }

  const { error } = await supabase
    .from("tour_stops")
    .delete()
    .eq("id", parsed.data.tour_stop_id)
    .eq("tour_id", parsed.data.tour_id);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}

export async function getMyTours() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", data: null };
  }

  const { data, error } = await supabase
    .from("tours")
    .select(`
      *,
      stops:tour_stops(
        *,
        trial:trial_requests(
          *,
          listing:horse_listings(id, name, slug, breed, price, location_city, location_state),
          buyer:profiles!trial_requests_buyer_id_fkey(id, display_name, avatar_url),
          seller:profiles!trial_requests_seller_id_fkey(id, display_name, avatar_url, phone)
        )
      )
    `)
    .eq("user_id", user.id)
    .order("tour_date", { ascending: true })
    .order("stop_order", { referencedTable: "tour_stops", ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

export async function deleteTour(tourId: string): Promise<TrialActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("tours")
    .delete()
    .eq("id", tourId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}
