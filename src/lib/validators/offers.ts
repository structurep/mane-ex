import { z } from "zod";

// Create a new offer on a listing
export const createOfferSchema = z.object({
  listing_id: z.string().uuid("Valid listing ID is required"),
  amount_cents: z.coerce
    .number()
    .int()
    .min(100, "Offer must be at least $1")
    .max(100000000, "Offer cannot exceed $1,000,000"),
  message: z.string().max(2000).optional(),
  payment_method: z.enum(["ach", "card"]).default("ach"),
});

// Seller counter-offer
export const counterOfferSchema = z.object({
  offer_id: z.string().uuid("Valid offer ID is required"),
  counter_amount_cents: z.coerce
    .number()
    .int()
    .min(100, "Counter must be at least $1")
    .max(100000000, "Counter cannot exceed $1,000,000"),
  message: z.string().max(2000).optional(),
});

// Accept an offer (seller)
export const acceptOfferSchema = z.object({
  offer_id: z.string().uuid("Valid offer ID is required"),
});

// Reject an offer (seller)
export const rejectOfferSchema = z.object({
  offer_id: z.string().uuid("Valid offer ID is required"),
  reason: z.string().max(500).optional(),
});

// Withdraw an offer (buyer)
export const withdrawOfferSchema = z.object({
  offer_id: z.string().uuid("Valid offer ID is required"),
});

// Confirm delivery (buyer)
export const confirmDeliverySchema = z.object({
  escrow_id: z.string().uuid("Valid escrow ID is required"),
  inspection_acknowledged: z
    .boolean()
    .refine((v) => v === true, "You must acknowledge the inspection period"),
});

// Add shipping info (seller)
export const addShippingSchema = z.object({
  escrow_id: z.string().uuid("Valid escrow ID is required"),
  shipping_tracking: z.string().min(1, "Tracking info is required").max(500),
  expected_delivery_date: z.string().min(1, "Expected delivery date is required"),
});

// Open a dispute (buyer, during dispute window)
export const openDisputeSchema = z.object({
  escrow_id: z.string().uuid("Valid escrow ID is required"),
  reason: z.string().min(10, "Please provide details (at least 10 characters)").max(5000),
});

export type CreateOfferData = z.infer<typeof createOfferSchema>;
export type CounterOfferData = z.infer<typeof counterOfferSchema>;
export type AcceptOfferData = z.infer<typeof acceptOfferSchema>;
export type RejectOfferData = z.infer<typeof rejectOfferSchema>;
export type WithdrawOfferData = z.infer<typeof withdrawOfferSchema>;
export type ConfirmDeliveryData = z.infer<typeof confirmDeliverySchema>;
export type AddShippingData = z.infer<typeof addShippingSchema>;
export type OpenDisputeData = z.infer<typeof openDisputeSchema>;
