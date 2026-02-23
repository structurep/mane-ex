import { z } from "zod";

// Create a new farm
export const createFarmSchema = z.object({
  name: z.string().min(1, "Farm name is required").max(200),
  description: z.string().max(2000).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().or(z.literal("")).optional(),
  website_url: z.string().url().or(z.literal("")).optional(),
  instagram_handle: z.string().optional(),
  disciplines: z.array(z.string()).optional(),
  year_established: z.coerce.number().min(1800).max(2026).optional(),
  number_of_stalls: z.coerce.number().min(0).optional(),
});

// Update an existing farm (all fields optional)
export const updateFarmSchema = createFarmSchema.partial();

export type CreateFarmData = z.infer<typeof createFarmSchema>;
export type UpdateFarmData = z.infer<typeof updateFarmSchema>;
