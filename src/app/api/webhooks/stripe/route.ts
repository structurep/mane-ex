import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@supabase/supabase-js";
import {
  releaseEscrowFunds,
  getChargeFromPaymentIntent,
} from "@/lib/stripe/escrow";
import { DISPUTE_WINDOW_DAYS } from "@/lib/stripe/config";
import { tierFromPriceId } from "@/types/subscriptions";
import type Stripe from "stripe";

// Use service role client to bypass RLS for webhook processing
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Idempotency check: skip if already processed
  const { data: existing } = await supabase
    .from("stripe_webhook_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Log the event
  await supabase.from("stripe_webhook_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event.data.object as unknown as Record<string, unknown>,
  });

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(supabase, event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(supabase, event.data.object as Stripe.PaymentIntent);
        break;

      case "transfer.created":
        await handleTransferCreated(supabase, event.data.object as Stripe.Transfer);
        break;

      case "account.updated":
        await handleAccountUpdated(supabase, event.data.object as Stripe.Account);
        break;

      // Subscription events
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(supabase, event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription);
        break;

      case "checkout.session.completed":
        await handleCheckoutCompleted(supabase, event.data.object as Stripe.Checkout.Session);
        break;
    }

    // Mark as processed
    await supabase
      .from("stripe_webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("stripe_event_id", event.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing error";
    await supabase
      .from("stripe_webhook_events")
      .update({ error: message })
      .eq("stripe_event_id", event.id);
  }

  return NextResponse.json({ received: true });
}

/**
 * Payment succeeded — funds are on platform balance.
 * Update escrow to 'funds_held', notify both parties.
 */
async function handlePaymentSucceeded(
  supabase: ReturnType<typeof getServiceClient>,
  pi: Stripe.PaymentIntent
) {
  const escrowId = pi.metadata.mane_escrow_id;
  if (!escrowId) return;

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("id, buyer_id, seller_id, listing_id, amount_cents, status")
    .eq("id", escrowId)
    .single();

  if (!escrow || escrow.status !== "awaiting_payment" && escrow.status !== "payment_processing") return;

  // Get charge ID for later transfer
  const chargeId =
    typeof pi.latest_charge === "string"
      ? pi.latest_charge
      : (pi.latest_charge as Stripe.Charge | null)?.id ?? null;

  await supabase
    .from("escrow_transactions")
    .update({
      status: "funds_held",
      stripe_charge_id: chargeId,
    })
    .eq("id", escrowId);

  // Fetch listing name
  const { data: listing } = await supabase
    .from("horse_listings")
    .select("name")
    .eq("id", escrow.listing_id)
    .single();

  const listingName = listing?.name ?? "your horse";

  // Notify seller: funds received, ready to ship
  await supabase.from("notifications").insert({
    user_id: escrow.seller_id,
    type: "offer" as const,
    title: `Payment received for ${listingName}`,
    body: "Funds are held in ManeVault escrow. You can now arrange transport.",
    link: `/dashboard/offers/${escrow.id}`,
    metadata: { escrow_id: escrowId },
  });

  // Notify buyer: payment confirmed
  await supabase.from("notifications").insert({
    user_id: escrow.buyer_id,
    type: "offer" as const,
    title: `Payment confirmed for ${listingName}`,
    body: "Your payment is held securely in ManeVault. The seller will arrange transport.",
    link: `/dashboard/offers/${escrow.id}`,
    metadata: { escrow_id: escrowId },
  });
}

/**
 * Payment failed (ACH can fail 2-5 days after initiation).
 * Revert escrow, notify buyer.
 */
async function handlePaymentFailed(
  supabase: ReturnType<typeof getServiceClient>,
  pi: Stripe.PaymentIntent
) {
  const escrowId = pi.metadata.mane_escrow_id;
  if (!escrowId) return;

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("id, buyer_id, seller_id, listing_id, offer_id")
    .eq("id", escrowId)
    .single();

  if (!escrow) return;

  await supabase
    .from("escrow_transactions")
    .update({ status: "funds_refunded" })
    .eq("id", escrowId);

  // Revert offer status
  await supabase
    .from("offers")
    .update({ status: "accepted" })
    .eq("id", escrow.offer_id);

  // Revert listing status
  await supabase
    .from("horse_listings")
    .update({ status: "active" })
    .eq("id", escrow.listing_id);

  await supabase.from("notifications").insert({
    user_id: escrow.buyer_id,
    type: "offer" as const,
    title: "Payment failed",
    body: "Your payment could not be processed. Please try again or use a different payment method.",
    link: `/dashboard/offers/${escrow.offer_id}`,
    metadata: { escrow_id: escrowId },
  });
}

/**
 * Transfer created — funds sent to seller's Connect account.
 */
async function handleTransferCreated(
  supabase: ReturnType<typeof getServiceClient>,
  transfer: Stripe.Transfer
) {
  const escrowId = transfer.metadata.mane_escrow_id;
  if (!escrowId) return;

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("id, seller_id, listing_id")
    .eq("id", escrowId)
    .single();

  if (!escrow) return;

  await supabase
    .from("escrow_transactions")
    .update({
      status: "funds_released",
      stripe_transfer_id: transfer.id,
    })
    .eq("id", escrowId);

  // Update listing to 'sold'
  await supabase
    .from("horse_listings")
    .update({ status: "sold" })
    .eq("id", escrow.listing_id);

  const { data: listing } = await supabase
    .from("horse_listings")
    .select("name")
    .eq("id", escrow.listing_id)
    .single();

  await supabase.from("notifications").insert({
    user_id: escrow.seller_id,
    type: "offer" as const,
    title: `Funds released for ${listing?.name ?? "your horse"}`,
    body: "Payment has been transferred to your account. Congratulations on the sale!",
    link: `/dashboard/offers/${escrowId}`,
    metadata: { escrow_id: escrowId },
  });
}

/**
 * Connect account updated — check onboarding completion.
 */
async function handleAccountUpdated(
  supabase: ReturnType<typeof getServiceClient>,
  account: Stripe.Account
) {
  if (!account.details_submitted || !account.charges_enabled) return;

  const profileId = account.metadata?.mane_profile_id;
  if (!profileId) return;

  await supabase
    .from("profiles")
    .update({ stripe_onboarding_complete: true })
    .eq("id", profileId);
}

/**
 * Subscription created or updated — sync tier and status.
 */
async function handleSubscriptionChange(
  supabase: ReturnType<typeof getServiceClient>,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata.mane_user_id;
  if (!userId) return;

  const priceId = subscription.items.data[0]?.price.id ?? "";
  const tier = tierFromPriceId(priceId);

  // Map Stripe status to our tier
  const sellerTier =
    subscription.status === "active" || subscription.status === "trialing"
      ? tier
      : "basic";

  await supabase
    .from("profiles")
    .update({
      seller_tier: sellerTier,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_current_period_end: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null,
    })
    .eq("id", userId);

  // Notify user
  await supabase.from("notifications").insert({
    user_id: userId,
    type: "subscription" as const,
    title:
      subscription.status === "active"
        ? `Welcome to ${sellerTier.charAt(0).toUpperCase() + sellerTier.slice(1)}!`
        : `Subscription ${subscription.status}`,
    body:
      subscription.status === "active"
        ? "Your new plan is now active. Enjoy the upgraded features!"
        : `Your subscription status changed to ${subscription.status}.`,
    link: "/dashboard/settings",
    metadata: { subscription_id: subscription.id, tier: sellerTier },
  });
}

/**
 * Subscription deleted — revert to basic tier.
 */
async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof getServiceClient>,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata.mane_user_id;
  if (!userId) return;

  await supabase
    .from("profiles")
    .update({
      seller_tier: "basic",
      subscription_status: "canceled",
      stripe_subscription_id: null,
    })
    .eq("id", userId);

  await supabase.from("notifications").insert({
    user_id: userId,
    type: "subscription" as const,
    title: "Subscription ended",
    body: "Your plan has been downgraded to Starter. You can resubscribe anytime.",
    link: "/pricing",
    metadata: { subscription_id: subscription.id },
  });
}

/**
 * Checkout completed — link subscription to user if not yet linked.
 */
async function handleCheckoutCompleted(
  supabase: ReturnType<typeof getServiceClient>,
  session: Stripe.Checkout.Session
) {
  if (session.mode !== "subscription") return;

  const userId = session.metadata?.mane_user_id;
  if (!userId) return;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : (session.subscription as Stripe.Subscription | null)?.id;

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer as Stripe.Customer | null)?.id;

  if (customerId) {
    await supabase
      .from("profiles")
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId ?? null,
      })
      .eq("id", userId);
  }
}
