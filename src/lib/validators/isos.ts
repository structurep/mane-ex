import { z } from "zod";

export const createIsoSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be 200 characters or less"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be 5000 characters or less"),
  discipline_ids: z.array(z.string().uuid()).default([]),
  min_price: z.coerce.number().int().min(0).optional(),
  max_price: z.coerce.number().int().min(0).optional(),
  min_height_hands: z.coerce.number().min(10).max(20).optional(),
  max_height_hands: z.coerce.number().min(10).max(20).optional(),
  min_age: z.coerce.number().int().min(0).max(40).optional(),
  max_age: z.coerce.number().int().min(0).max(40).optional(),
  gender: z.array(z.enum(["mare", "gelding", "stallion"])).default([]),
  breeds: z.array(z.string().max(100)).default([]),
  preferred_states: z.array(z.string().length(2)).default([]),
  level: z.string().max(100).optional(),
});

export const updateIsoSchema = z.object({
  iso_id: z.string().uuid("Valid ISO ID is required"),
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  status: z.enum(["active", "paused", "fulfilled", "closed"]).optional(),
  discipline_ids: z.array(z.string().uuid()).optional(),
  min_price: z.coerce.number().int().min(0).optional(),
  max_price: z.coerce.number().int().min(0).optional(),
  min_height_hands: z.coerce.number().min(10).max(20).optional(),
  max_height_hands: z.coerce.number().min(10).max(20).optional(),
  min_age: z.coerce.number().int().min(0).max(40).optional(),
  max_age: z.coerce.number().int().min(0).max(40).optional(),
  gender: z.array(z.enum(["mare", "gelding", "stallion"])).optional(),
  breeds: z.array(z.string().max(100)).optional(),
  preferred_states: z.array(z.string().length(2)).optional(),
  level: z.string().max(100).optional(),
});

export const matchIsoSchema = z.object({
  iso_id: z.string().uuid("Valid ISO ID is required"),
  listing_id: z.string().uuid("Valid listing ID is required"),
  message: z.string().max(1000).optional(),
});

export type CreateIsoData = z.infer<typeof createIsoSchema>;
export type UpdateIsoData = z.infer<typeof updateIsoSchema>;
export type MatchIsoData = z.infer<typeof matchIsoSchema>;
