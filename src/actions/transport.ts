"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { transportRequestEmail, transportProviderLeadEmail } from "@/lib/email/templates";

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
    .select("seller_id, name, slug, seller:profiles!seller_id(email, display_name)")
    .eq("id", input.listingId)
    .single()
    .then(({ data: listing }) => {
      if (!listing) return;

      // In-app notification
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

      // Email notification
      const seller = Array.isArray(listing.seller) ? listing.seller[0] : listing.seller;
      if (seller?.email) {
        const { subject, html } = transportRequestEmail(
          seller.display_name || "Seller",
          listing.name,
          input.destinationState,
          listing.slug,
        );
        sendEmail({
          to: seller.email,
          subject,
          html,
          idempotencyKey: `transport-req-${data.id}`,
        });
      }

      // Route to transport providers (fire-and-forget)
      routeToProviders(supabase, {
        transportRequestId: data.id,
        horseName: listing.name,
        listingSlug: listing.slug,
        originState: input.originState,
        destinationState: input.destinationState,
        distanceMiles: input.distanceMiles,
      });
    });

  return { id: data.id };
}

/**
 * Route a transport request to matching providers.
 * Finds providers whose service_regions include the destination state,
 * falls back to long_haul providers if none match. Max 3 providers.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function routeToProviders(supabase: any, lead: {
  transportRequestId: string;
  horseName: string;
  listingSlug: string;
  originState: string;
  destinationState: string;
  distanceMiles: number;
}) {
  try {
    // Find providers covering the destination state
    const { data: regionalProviders } = await supabase
      .from("transport_providers")
      .select("id, company_name, contact_name, email")
      .eq("active", true)
      .contains("service_regions", [lead.destinationState])
      .limit(3);

    let providers = regionalProviders || [];

    // Fallback: long-haul providers if no regional match
    if (providers.length === 0) {
      const { data: longHaulProviders } = await supabase
        .from("transport_providers")
        .select("id, company_name, contact_name, email")
        .eq("active", true)
        .eq("long_haul", true)
        .limit(3);
      providers = longHaulProviders || [];
    }

    if (providers.length === 0) return;

    for (const provider of providers) {
      // Insert lead row (unique constraint prevents duplicates)
      const { error: leadError } = await supabase
        .from("transport_provider_leads")
        .insert({
          transport_request_id: lead.transportRequestId,
          provider_id: provider.id,
        });

      // Skip email if lead already existed (duplicate)
      if (leadError) continue;

      const { subject, html } = transportProviderLeadEmail(
        provider.contact_name || provider.company_name,
        lead.horseName,
        lead.originState,
        lead.destinationState,
        lead.distanceMiles,
        lead.listingSlug,
      );
      sendEmail({
        to: provider.email,
        subject,
        html,
        idempotencyKey: `provider-lead-${lead.transportRequestId}-${provider.id}`,
      });
    }
  } catch (err) {
    console.error("[Transport] Provider routing failed:", err);
  }
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

/**
 * Get provider lead counts per listing for seller dashboard.
 */
export async function getProviderLeadCounts(
  listingIds: string[]
): Promise<Record<string, number>> {
  if (listingIds.length === 0) return {};

  const supabase = await createClient();
  const { data } = await supabase
    .from("transport_provider_leads")
    .select("transport_request_id, transport_requests!inner(listing_id)")
    .in("transport_requests.listing_id", listingIds);

  if (!data) return {};

  const counts: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of data as any[]) {
    const tr = Array.isArray(row.transport_requests) ? row.transport_requests[0] : row.transport_requests;
    const listingId = tr?.listing_id;
    if (listingId) {
      counts[listingId] = (counts[listingId] || 0) + 1;
    }
  }
  return counts;
}
