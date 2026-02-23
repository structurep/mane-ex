import { stripe } from "./server";
import { tierFromPriceId } from "@/types/subscriptions";
import type Stripe from "stripe";

/**
 * Get or create a Stripe Customer for a user.
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  existingCustomerId?: string | null
): Promise<string> {
  if (existingCustomerId) return existingCustomerId;

  const customer = await stripe.customers.create({
    email,
    metadata: { mane_user_id: userId },
  });

  return customer.id;
}

/**
 * Create a Stripe Checkout Session for subscription.
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: { mane_user_id: userId },
    },
    metadata: { mane_user_id: userId },
    allow_promotion_codes: true,
  });

  return session.url!;
}

/**
 * Create a Stripe Customer Portal session for managing subscriptions.
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

/**
 * Get subscription details from Stripe.
 */
export async function getSubscriptionDetails(
  subscriptionId: string
): Promise<{
  status: Stripe.Subscription.Status;
  tier: ReturnType<typeof tierFromPriceId>;
  cancelAt: Date | null;
  cancelAtPeriodEnd: boolean;
} | null> {
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = sub.items.data[0]?.price.id ?? "";

    return {
      status: sub.status,
      tier: tierFromPriceId(priceId),
      cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  } catch {
    return null;
  }
}
