export type ConversationParticipant = "participant_1" | "participant_2";

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  listing_id: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  is_archived_by_1: boolean;
  is_archived_by_2: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  body: string;
  is_system: boolean;
  read_at: string | null;
  created_at: string;
}

// Message with joined sender profile for display
export interface MessageWithSender extends Message {
  sender: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

// Conversation with joined participants, listing, and message data
export interface ConversationWithDetails extends Conversation {
  other_participant: {
    id: string;
    display_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  listing: {
    id: string;
    name: string;
    slug: string;
    primary_image_url: string | null;
  } | null;
  unread_count: number;
  last_message: Message | null;
}
