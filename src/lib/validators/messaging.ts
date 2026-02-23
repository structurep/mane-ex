import { z } from "zod";

// Start a new conversation
export const startConversationSchema = z.object({
  participant_id: z.string().uuid("Valid user ID is required"),
  listing_id: z.string().uuid().optional(),
  initial_message: z.string().min(1, "Message is required").max(5000),
});

// Send a message in an existing conversation
export const sendMessageSchema = z.object({
  conversation_id: z.string().uuid("Valid conversation ID is required"),
  body: z.string().min(1, "Message is required").max(5000),
});

export type StartConversationData = z.infer<typeof startConversationSchema>;
export type SendMessageData = z.infer<typeof sendMessageSchema>;
