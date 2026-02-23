import { z } from "zod";

export const requestTrialSchema = z.object({
  listing_id: z.string().uuid("Valid listing ID is required"),
  preferred_date: z.string().min(1, "Preferred date is required"),
  alternate_date: z.string().optional(),
  buyer_notes: z.string().max(2000).optional(),
});

export const respondTrialSchema = z.object({
  trial_id: z.string().uuid("Valid trial ID is required"),
  status: z.enum(["confirmed", "rescheduled", "cancelled"]),
  confirmed_date: z.string().optional(),
  seller_notes: z.string().max(2000).optional(),
});

export const completeTrialSchema = z.object({
  trial_id: z.string().uuid("Valid trial ID is required"),
});

export const createTourSchema = z.object({
  name: z
    .string()
    .min(1, "Tour name is required")
    .max(200, "Name must be 200 characters or less"),
  tour_date: z.string().min(1, "Tour date is required"),
  notes: z.string().max(2000).optional(),
});

export const addTourStopSchema = z.object({
  tour_id: z.string().uuid("Valid tour ID is required"),
  trial_request_id: z.string().uuid("Valid trial ID is required"),
  stop_order: z.coerce.number().int().min(0).default(0),
});

export const removeTourStopSchema = z.object({
  tour_id: z.string().uuid("Valid tour ID is required"),
  tour_stop_id: z.string().uuid("Valid tour stop ID is required"),
});

export type RequestTrialData = z.infer<typeof requestTrialSchema>;
export type RespondTrialData = z.infer<typeof respondTrialSchema>;
export type CompleteTrialData = z.infer<typeof completeTrialSchema>;
export type CreateTourData = z.infer<typeof createTourSchema>;
export type AddTourStopData = z.infer<typeof addTourStopSchema>;
export type RemoveTourStopData = z.infer<typeof removeTourStopSchema>;
