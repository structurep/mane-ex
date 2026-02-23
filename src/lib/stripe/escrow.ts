"use server";

import { stripe } from "./server";
import { calculatePlatformFee, calculateSellerNet } from "./config";

/**
 * Create a PaymentIntent for escrow.
 * Funds are captured on the platform balance (Separate Charges and Transfers pattern).
 * ACH default for >$5K; card fallback allowed.
 */
export async function createEscrowPayment(opts: {
  amountCents: number;
  buyerEmail: string;
  paymentMethod: "ach" | "card";
  escrowId: string;
  listingName: string;
}): Promise<{ clientSecret: string; paymentIntentId: string; error?: string }> {
  try {
    const paymentMethodTypes =
      opts.paymentMethod === "ach"
        ? ["us_bank_account"]
        : ["card"];

    const paymentIntent = await stripe.paymentIntents.create({
      amount: opts.amountCents,
      currency: "usd",
      payment_method_types: paymentMethodTypes,
      description: `ManeExchange escrow: ${opts.listingName}`,
      metadata: {
        mane_escrow_id: opts.escrowId,
        mane_payment_type: "escrow",
      },
      receipt_email: opts.buyerEmail,
      // Funds stay on platform balance until explicit transfer
    });

    return {
      clientSecret: paymentIntent.client_secret ?? "",
      paymentIntentId: paymentIntent.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create payment";
    return { clientSecret: "", paymentIntentId: "", error: message };
  }
}

/**
 * Release escrowed funds to the seller's Connect account.
 * Uses source_transaction to guarantee funds availability.
 */
export async function releaseEscrowFunds(opts: {
  chargeId: string;
  sellerAccountId: string;
  amountCents: number;
  escrowId: string;
}): Promise<{ transferId: string; error?: string }> {
  const sellerNetCents = calculateSellerNet(opts.amountCents);

  try {
    const transfer = await stripe.transfers.create({
      amount: sellerNetCents,
      currency: "usd",
      destination: opts.sellerAccountId,
      source_transaction: opts.chargeId,
      metadata: {
        mane_escrow_id: opts.escrowId,
        platform_fee_cents: String(calculatePlatformFee(opts.amountCents)),
      },
    });

    return { transferId: transfer.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to release funds";
    return { transferId: "", error: message };
  }
}

/**
 * Refund an escrow payment to the buyer.
 */
export async function refundEscrow(opts: {
  paymentIntentId: string;
  reason?: string;
}): Promise<{ refundId: string; error?: string }> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: opts.paymentIntentId,
      reason: "requested_by_customer",
      metadata: {
        mane_reason: opts.reason ?? "Escrow refund",
      },
    });

    return { refundId: refund.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to refund";
    return { refundId: "", error: message };
  }
}

/**
 * Retrieve the charge ID from a PaymentIntent.
 * Needed for source_transaction on transfers.
 */
export async function getChargeFromPaymentIntent(
  paymentIntentId: string
): Promise<{ chargeId: string; error?: string }> {
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    const chargeId =
      typeof pi.latest_charge === "string"
        ? pi.latest_charge
        : pi.latest_charge?.id ?? "";

    if (!chargeId) {
      return { chargeId: "", error: "No charge found on PaymentIntent" };
    }

    return { chargeId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to retrieve charge";
    return { chargeId: "", error: message };
  }
}
