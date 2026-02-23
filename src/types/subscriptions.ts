export type SubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid";

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  tier: "basic" | "standard" | "premium";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

// Tier limits enforced across the platform
export const TIER_LIMITS = {
  basic: {
    max_listings: 3,
    messages_per_day: 10,
    iso_active: 1,
    iso_responses_per_month: 0,
    farm_page: false,
    analytics: false,
    featured_placement: false,
    priority_search: false,
  },
  standard: {
    max_listings: 10,
    messages_per_day: 50,
    iso_active: 3,
    iso_responses_per_month: 5,
    farm_page: true,
    analytics: true,
    featured_placement: false,
    priority_search: true,
  },
  premium: {
    max_listings: -1, // unlimited
    messages_per_day: -1, // unlimited
    iso_active: 10,
    iso_responses_per_month: -1, // unlimited
    farm_page: true,
    analytics: true,
    featured_placement: true,
    priority_search: true,
  },
} as const;

export type TierName = keyof typeof TIER_LIMITS;

// Stripe Price IDs — set via env vars
export const STRIPE_PRICES = {
  standard_monthly: process.env.STRIPE_PRICE_STANDARD_MONTHLY ?? "",
  standard_yearly: process.env.STRIPE_PRICE_STANDARD_YEARLY ?? "",
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? "",
  premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY ?? "",
} as const;

// Map Stripe price ID to tier
export function tierFromPriceId(priceId: string): TierName {
  if (
    priceId === STRIPE_PRICES.premium_monthly ||
    priceId === STRIPE_PRICES.premium_yearly
  ) {
    return "premium";
  }
  if (
    priceId === STRIPE_PRICES.standard_monthly ||
    priceId === STRIPE_PRICES.standard_yearly
  ) {
    return "standard";
  }
  return "basic";
}
