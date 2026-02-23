import { z } from "zod";

// Report a listing, user, or message
export const createReportSchema = z.object({
  target_type: z.enum(["listing", "user", "message"]),
  target_id: z.string().uuid("Valid target ID is required"),
  reason: z.enum([
    "fraud",
    "misrepresentation",
    "stolen_photos",
    "animal_welfare",
    "harassment",
    "spam",
    "other",
  ]),
  details: z.string().min(10, "Please provide at least 10 characters").max(2000),
});

export type CreateReportData = z.infer<typeof createReportSchema>;
