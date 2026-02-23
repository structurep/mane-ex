import { z } from "zod";

export const createReviewSchema = z.object({
  seller_id: z.string().uuid("Valid seller ID is required"),
  listing_id: z.string().uuid().optional(),
  offer_id: z.string().uuid().optional(),
  stage: z.enum(["inquiry", "trial", "offer", "completion"]),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  title: z.string().max(200).optional(),
  body: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(2000, "Review must be 2000 characters or less"),
});

export const respondToReviewSchema = z.object({
  review_id: z.string().uuid("Valid review ID is required"),
  seller_response: z
    .string()
    .min(5, "Response must be at least 5 characters")
    .max(2000, "Response must be 2000 characters or less"),
});

export type CreateReviewData = z.infer<typeof createReviewSchema>;
export type RespondToReviewData = z.infer<typeof respondToReviewSchema>;
