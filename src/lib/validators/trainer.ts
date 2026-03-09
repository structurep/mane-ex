import { z } from "zod";

export const trainerProfileSchema = z.object({
  headline: z.string().max(200).optional(),
  bio: z.string().max(3000).optional(),
  disciplines: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  years_experience: z.coerce.number().int().min(0).max(80).optional(),
  service_radius_miles: z.coerce.number().int().min(0).max(500).optional(),
  location_city: z.string().max(200).optional(),
  location_state: z.string().max(200).optional(),
  website_url: z.string().url().max(500).optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  accepting_clients: z.boolean().default(true),
});

export const trainerServiceSchema = z.object({
  name: z.string().min(1, "Service name is required").max(200),
  description: z.string().max(1000).optional(),
  category: z.enum([
    "ppe_supervision", "trial_ride", "training_assessment",
    "lesson", "training_board", "show_coaching",
    "horse_shopping", "consultation", "other",
  ]),
  price_cents: z.coerce.number().int().min(0).optional(),
  price_type: z.enum(["fixed", "hourly", "per_session", "contact"]).default("fixed"),
  duration_minutes: z.coerce.number().int().min(1).max(480).optional(),
});

export type TrainerProfileFormData = z.infer<typeof trainerProfileSchema>;
export type TrainerServiceFormData = z.infer<typeof trainerServiceSchema>;
