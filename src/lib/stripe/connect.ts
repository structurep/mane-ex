"use server";

import { stripe } from "./server";

/**
 * Create a Stripe Connect Express account for a seller.
 * Returns the account ID to store on the profile.
 */
export async function createConnectAccount(
  email: string,
  profileId: string
): Promise<{ accountId: string; error?: string }> {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      email,
      metadata: {
        mane_profile_id: profileId,
      },
      capabilities: {
        transfers: { requested: true },
      },
      settings: {
        payouts: {
          schedule: { interval: "manual" }, // Platform controls payout timing
        },
      },
    });

    return { accountId: account.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create Connect account";
    return { accountId: "", error: message };
  }
}

/**
 * Create a Stripe Connect onboarding link.
 * Redirects seller to Stripe-hosted onboarding form.
 */
export async function createOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<{ url: string; error?: string }> {
  try {
    const link = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      return_url: returnUrl,
      refresh_url: refreshUrl,
    });

    return { url: link.url };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create onboarding link";
    return { url: "", error: message };
  }
}

/**
 * Check whether a Connect account has completed onboarding
 * and is ready to receive transfers.
 */
export async function checkAccountStatus(
  accountId: string
): Promise<{
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  error?: string;
}> {
  try {
    const account = await stripe.accounts.retrieve(accountId);

    return {
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      detailsSubmitted: account.details_submitted ?? false,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to check account status";
    return {
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      error: message,
    };
  }
}

/**
 * Create a login link for the seller's Stripe Express dashboard.
 */
export async function createDashboardLink(
  accountId: string
): Promise<{ url: string; error?: string }> {
  try {
    const link = await stripe.accounts.createLoginLink(accountId);
    return { url: link.url };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create dashboard link";
    return { url: "", error: message };
  }
}
