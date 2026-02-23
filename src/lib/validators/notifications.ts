import { z } from "zod";

export const updateNotificationPreferencesSchema = z.object({
  email_offers: z.boolean().optional(),
  email_messages: z.boolean().optional(),
  email_price_drops: z.boolean().optional(),
  email_new_matches: z.boolean().optional(),
  email_just_sold: z.boolean().optional(),
  email_weekly_digest: z.boolean().optional(),
  email_marketing: z.boolean().optional(),

  push_offers: z.boolean().optional(),
  push_messages: z.boolean().optional(),
  push_price_drops: z.boolean().optional(),
  push_new_matches: z.boolean().optional(),
  push_just_sold: z.boolean().optional(),
});

export const registerPushSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>;
export type RegisterPushInput = z.infer<typeof registerPushSchema>;
