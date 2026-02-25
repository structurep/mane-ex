import { z } from "zod";

export const inviteMemberSchema = z.object({
  farm_id: z.string().uuid(),
  email: z.string().email("Please enter a valid email address."),
  role: z.enum(["manager", "trainer", "staff"]).default("staff"),
  title: z.string().max(100).optional(),
  can_list_horses: z.boolean().default(false),
  can_manage_messages: z.boolean().default(false),
  message: z.string().max(500).optional(),
});

export type InviteMemberData = z.infer<typeof inviteMemberSchema>;

export const updateMemberSchema = z.object({
  member_id: z.string().uuid(),
  role: z.enum(["manager", "trainer", "staff"]).optional(),
  title: z.string().max(100).optional(),
  can_list_horses: z.boolean().optional(),
  can_manage_messages: z.boolean().optional(),
});

export type UpdateMemberData = z.infer<typeof updateMemberSchema>;

export const createPostSchema = z.object({
  farm_id: z.string().uuid(),
  type: z.enum(["text", "photo", "announcement", "listing_share", "event"]).default("text"),
  body: z.string().min(1, "Post cannot be empty.").max(5000),
  listing_id: z.string().uuid().optional(),
});

export type CreatePostData = z.infer<typeof createPostSchema>;

export const createCommentSchema = z.object({
  post_id: z.string().uuid(),
  body: z.string().min(1, "Comment cannot be empty.").max(2000),
  parent_id: z.string().uuid().optional(),
});

export type CreateCommentData = z.infer<typeof createCommentSchema>;
