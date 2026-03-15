"use server";

import { createClient } from "@/lib/supabase/server";

export type TransportRequestResult = {
  error?: string;
  id?: string;
};

export async function submitTransportRequest(input: {
  listingId: string;
  originState: string;
  destinationState: string;
  estimatedLow: number;
  estimatedHigh: number;
  distanceMiles: number;
}): Promise<TransportRequestResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to request transport help." };
  }

  // Rate limit: max 3 requests per listing per user
  const { count } = await supabase
    .from("transport_requests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("listing_id", input.listingId);

  if ((count ?? 0) >= 3) {
    return { error: "You've already requested transport help for this listing." };
  }

  const { data, error } = await supabase
    .from("transport_requests")
    .insert({
      user_id: user.id,
      listing_id: input.listingId,
      origin_state: input.originState,
      destination_state: input.destinationState,
      estimated_low: input.estimatedLow,
      estimated_high: input.estimatedHigh,
      distance_miles: input.distanceMiles,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Failed to submit transport request. Please try again." };
  }

  // Notify the listing's seller (fire-and-forget)
  supabase
    .from("horse_listings")
    .select("seller_id, name, slug")
    .eq("id", input.listingId)
    .single()
    .then(({ data: listing }) => {
      if (!listing) return;
      supabase.from("notifications").insert({
        user_id: listing.seller_id,
        type: "transport_request",
        title: "New transport request",
        body: `A buyer wants help shipping ${listing.name} to ${input.destinationState}.`,
        link: `/horses/${listing.slug}`,
        metadata: {
          transport_request_id: data.id,
          listing_id: input.listingId,
          destination_state: input.destinationState,
        },
      });
    });

  return { id: data.id };
}

/**
 * Get transport request count per listing for seller dashboard.
 */
export async function getTransportRequestCounts(
  listingIds: string[]
): Promise<Record<string, number>> {
  if (listingIds.length === 0) return {};

  const supabase = await createClient();
  const { data } = await supabase
    .from("transport_requests")
    .select("listing_id")
    .in("listing_id", listingIds);

  if (!data) return {};

  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.listing_id] = (counts[row.listing_id] || 0) + 1;
  }
  return counts;
}
