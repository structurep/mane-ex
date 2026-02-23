import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Collection name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z.string().max(500).optional(),
  visibility: z.enum(["private", "shared", "public"]).default("private"),
});

export const updateCollectionSchema = z.object({
  collection_id: z.string().uuid("Valid collection ID is required"),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  visibility: z.enum(["private", "shared", "public"]).optional(),
  cover_image_url: z.string().url().nullable().optional(),
});

export const addToCollectionSchema = z.object({
  collection_id: z.string().uuid("Valid collection ID is required"),
  listing_id: z.string().uuid("Valid listing ID is required"),
  notes: z.string().max(500).optional(),
});

export const removeFromCollectionSchema = z.object({
  collection_id: z.string().uuid("Valid collection ID is required"),
  listing_id: z.string().uuid("Valid listing ID is required"),
});

export type CreateCollectionData = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionData = z.infer<typeof updateCollectionSchema>;
export type AddToCollectionData = z.infer<typeof addToCollectionSchema>;
export type RemoveFromCollectionData = z.infer<typeof removeFromCollectionSchema>;
