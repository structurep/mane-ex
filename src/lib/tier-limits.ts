import { createClient } from "@/lib/supabase/server";
import { TIER_LIMITS, type TierName } from "@/types/subscriptions";

export type TierCheckResult =
  | { allowed: true }
  | { allowed: false; error: string; upgradeUrl: string };

/**
 * Get the current user's tier from their profile.
 */
export async function getUserTier(userId: string): Promise<TierName> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("seller_tier")
    .eq("id", userId)
    .single();

  return (data?.seller_tier as TierName) ?? "basic";
}

/**
 * Check if user can create another listing.
 */
export async function checkListingLimit(userId: string): Promise<TierCheckResult> {
  const tier = await getUserTier(userId);
  const limits = TIER_LIMITS[tier];

  if (limits.max_listings === -1) return { allowed: true };

  const supabase = await createClient();
  const { count } = await supabase
    .from("horse_listings")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", userId)
    .in("status", ["draft", "active"]);

  if ((count ?? 0) >= limits.max_listings) {
    return {
      allowed: false,
      error: `You can have up to ${limits.max_listings} listings on the ${tier} plan. Upgrade for more.`,
      upgradeUrl: "/pricing",
    };
  }

  return { allowed: true };
}

/**
 * Check if user can send a message today.
 */
export async function checkMessageLimit(userId: string): Promise<TierCheckResult> {
  const tier = await getUserTier(userId);
  const limits = TIER_LIMITS[tier];

  if (limits.messages_per_day === -1) return { allowed: true };

  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", userId)
    .gte("created_at", todayStart.toISOString());

  if ((count ?? 0) >= limits.messages_per_day) {
    return {
      allowed: false,
      error: `You've reached your daily message limit (${limits.messages_per_day}). Upgrade for more.`,
      upgradeUrl: "/pricing",
    };
  }

  return { allowed: true };
}

/**
 * Check if user has access to a feature.
 */
export function checkFeatureAccess(
  tier: TierName,
  feature: keyof (typeof TIER_LIMITS)["basic"]
): TierCheckResult {
  const limits = TIER_LIMITS[tier];
  const value = limits[feature];

  if (typeof value === "boolean" && !value) {
    return {
      allowed: false,
      error: `This feature requires an upgrade from the ${tier} plan.`,
      upgradeUrl: "/pricing",
    };
  }

  return { allowed: true };
}
