import { z } from "zod";

export const createCheckoutSchema = z.object({
  price_id: z.string().min(1, "Price ID is required"),
  success_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
});

export const manageBillingSchema = z.object({
  return_url: z.string().url().optional(),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type ManageBillingInput = z.infer<typeof manageBillingSchema>;
