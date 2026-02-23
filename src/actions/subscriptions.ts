"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getOrCreateCustomer,
  createCheckoutSession,
  createPortalSession,
} from "@/lib/stripe/subscriptions";
import {
  createCheckoutSchema,
  manageBillingSchema,
} from "@/lib/validators/subscriptions";

export type SubscriptionActionState = {
  error?: string;
  data?: unknown;
};

/**
 * Create a Stripe Checkout session for subscription purchase.
 * Returns the checkout URL to redirect to.
 */
export async function createSubscriptionCheckout(
  formData: FormData
): Promise<SubscriptionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = createCheckoutSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Get profile for existing Stripe customer ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found." };
  }

  // Get or create Stripe customer
  const customerId = await getOrCreateCustomer(
    user.id,
    profile.email ?? user.email!,
    profile.stripe_customer_id
  );

  // Save customer ID if new
  if (!profile.stripe_customer_id) {
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";
  const successUrl =
    parsed.data.success_url ?? `${baseUrl}/dashboard?subscription=success`;
  const cancelUrl =
    parsed.data.cancel_url ?? `${baseUrl}/pricing?subscription=canceled`;

  const checkoutUrl = await createCheckoutSession({
    customerId,
    priceId: parsed.data.price_id,
    userId: user.id,
    successUrl,
    cancelUrl,
  });

  return { data: { url: checkoutUrl } };
}

/**
 * Create a Stripe Customer Portal session for managing billing.
 * Returns the portal URL to redirect to.
 */
export async function manageSubscription(
  formData: FormData
): Promise<SubscriptionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = manageBillingSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return { error: "No subscription found. Subscribe first." };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";
  const returnUrl = parsed.data.return_url ?? `${baseUrl}/dashboard/settings`;

  const portalUrl = await createPortalSession(
    profile.stripe_customer_id,
    returnUrl
  );

  return { data: { url: portalUrl } };
}

/**
 * Get current user's subscription info.
 */
export async function getMySubscription() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", data: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "seller_tier, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_current_period_end"
    )
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found.", data: null };
  }

  return {
    data: {
      tier: profile.seller_tier ?? "basic",
      status: profile.subscription_status ?? "none",
      stripe_customer_id: profile.stripe_customer_id ?? null,
      stripe_subscription_id: profile.stripe_subscription_id ?? null,
      current_period_end: profile.subscription_current_period_end ?? null,
    },
    error: null,
  };
}
