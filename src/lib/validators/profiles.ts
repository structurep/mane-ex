import { z } from "zod";

// Update user profile
export const updateProfileSchema = z.object({
  display_name: z.string().max(100).optional(),
  avatar_url: z.string().url().or(z.literal("")).optional(),
  cover_url: z.string().url().or(z.literal("")).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  website_url: z.string().url().or(z.literal("")).optional(),
  instagram_handle: z.string().optional(),
  disciplines: z.array(z.string()).optional(),
  min_budget: z.coerce.number().min(0).optional(),
  max_budget: z.coerce.number().min(0).optional(),
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
