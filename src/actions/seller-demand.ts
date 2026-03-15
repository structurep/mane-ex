"use server";

import { createClient } from "@/lib/supabase/server";
import { getListingDemandStats, type DemandStats } from "@/lib/match/demand-score";

/**
 * Get demand insights for a seller's own listing.
 * Verifies ownership before returning data.
 */
export async function getSellerListingDemand(listingId: string): Promise<{
  stats: DemandStats | null;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { stats: null, error: "Not authenticated" };

  // Verify ownership
  const { data: listing } = await supabase
    .from("horse_listings")
    .select("id, seller_id")
    .eq("id", listingId)
    .single();

  if (!listing || listing.seller_id !== user.id) {
    return { stats: null, error: "Not authorized" };
  }

  const stats = await getListingDemandStats(listingId);
  return { stats };
}
