// ManeExchange fee structure
// Platform takes 3% + $300 flat fee on every transaction
// Trainer commission (if applicable) is disclosed and deducted separately

export const PLATFORM_FEE_PERCENT = 3; // 3% of transaction
export const PLATFORM_FEE_FLAT_CENTS = 30000; // $300

// ACH is default for transactions > $5K (Stripe fee capped at $5)
// Card allowed but ACH incentivized (saves ~$1,445 per $50K transaction)
export const ACH_THRESHOLD_CENTS = 500000; // $5,000

// Escrow timing
export const ACH_CLEARANCE_DAYS = 5; // Wait for ACH to clear before shipping
export const DELIVERY_CONFIRMATION_DAYS = 14; // Auto-release after 14 days if no action
export const DISPUTE_WINDOW_DAYS = 14; // 14-day dispute window after delivery confirmation
export const INSPECTION_PERIOD_DAYS = 5; // 5-day inspection period after delivery

// Offer expiration
export const OFFER_EXPIRY_HOURS = 72; // Offers expire after 72 hours

// Minimum completeness score to make an offer
export const MIN_COMPLETENESS_FOR_OFFER = 50;

/**
 * Calculate platform fee in cents for a given transaction amount.
 * Fee = 3% of amount + $300 flat
 */
export function calculatePlatformFee(amountCents: number): number {
  const percentFee = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));
  return percentFee + PLATFORM_FEE_FLAT_CENTS;
}

/**
 * Calculate net amount seller receives after platform fee.
 */
export function calculateSellerNet(amountCents: number): number {
  return amountCents - calculatePlatformFee(amountCents);
}

/**
 * Determine whether ACH should be the default payment method.
 * ACH default for transactions > $5K.
 */
export function shouldDefaultToACH(amountCents: number): boolean {
  return amountCents >= ACH_THRESHOLD_CENTS;
}

/**
 * Format cents to display dollars.
 */
export function formatCentsToDollars(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
