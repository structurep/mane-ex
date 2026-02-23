import { z } from "zod";

// Query leaderboard
export const leaderboardQuerySchema = z.object({
  category: z.enum(["most_complete", "most_active", "most_credible"]).default("most_complete"),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

// Request score recalculation (for admin or system use)
export const recalculateScoreSchema = z.object({
  seller_id: z.string().uuid("Valid seller ID is required"),
});

// Batch recalculation (admin)
export const batchRecalculateSchema = z.object({
  seller_ids: z
    .array(z.string().uuid())
    .min(1, "At least one seller ID required")
    .max(100, "Maximum 100 sellers per batch"),
});

export type LeaderboardQueryData = z.infer<typeof leaderboardQuerySchema>;
export type RecalculateScoreData = z.infer<typeof recalculateScoreSchema>;
export type BatchRecalculateData = z.infer<typeof batchRecalculateSchema>;
