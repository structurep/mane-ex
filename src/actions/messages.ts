"use server";

import { createClient } from "@/lib/supabase/server";

export type MessageActionState = {
  error?: string;
  conversationId?: string;
  messageId?: string;
};

/**
 * Start a conversation with a seller (Airbnb-style: auto-creates on first message).
 * If a conversation already exists between the two users for this listing, the message
 * is appended to the existing thread.
 */
export async function startConversation(
  sellerId: string,
  listingId: string | null,
  message: string
): Promise<MessageActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  if (user.id === sellerId) {
    return { error: "You cannot message yourself." };
  }

  // Validate message body
  const body = message.trim();
  if (body.length < 1) {
    return { error: "Message cannot be empty." };
  }
  if (body.length > 5000) {
    return { error: "Message cannot exceed 5,000 characters." };
  }

  // Check if a conversation already exists between these two users for this listing
  let query = supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant_1_id.eq.${user.id},participant_2_id.eq.${sellerId}),and(participant_1_id.eq.${sellerId},participant_2_id.eq.${user.id})`
    );

  if (listingId) {
    query = query.eq("listing_id", listingId);
  } else {
    query = query.is("listing_id", null);
  }

  const { data: existing } = await query.single();

  if (existing) {
    // Conversation exists — just send the message
    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id: existing.id,
      sender_id: user.id,
      body,
    });

    if (msgError) {
      return { error: msgError.message };
    }

    return { conversationId: existing.id };
  }

  // No existing conversation — create one
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({
      participant_1_id: user.id,
      participant_2_id: sellerId,
      listing_id: listingId,
    })
    .select("id")
    .single();

  if (convError) {
    return { error: convError.message };
  }

  // Insert the first message
  const { error: msgError } = await supabase.from("messages").insert({
    conversation_id: conversation.id,
    sender_id: user.id,
    body,
  });

  if (msgError) {
    return { error: msgError.message };
  }

  return { conversationId: conversation.id };
}

/**
 * Send a message to an existing conversation.
 */
export async function sendMessage(
  conversationId: string,
  body: string
): Promise<MessageActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // Validate body
  const trimmed = body.trim();
  if (trimmed.length < 1) {
    return { error: "Message cannot be empty." };
  }
  if (trimmed.length > 5000) {
    return { error: "Message cannot exceed 5,000 characters." };
  }

  // Verify user is a participant in this conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
    .single();

  if (!conversation) {
    return { error: "Conversation not found." };
  }

  // Insert the message
  const { data: msg, error: msgError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: trimmed,
    })
    .select("id")
    .single();

  if (msgError) {
    return { error: msgError.message };
  }

  return { conversationId, messageId: msg.id };
}

/**
 * Mark all unread messages in a conversation as read (messages sent by the other participant).
 */
export async function markAsRead(conversationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);
}

/**
 * Fetch the current user's conversation list with other-participant info and optional listing context.
 */
export async function getConversations(): Promise<{
  conversations: any[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { conversations: [], error: "You must be logged in." };
  }

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(
      "id, participant_1_id, participant_2_id, listing_id, last_message_at, last_message_preview, created_at"
    )
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) {
    return { conversations: [], error: error.message };
  }

  if (!conversations || conversations.length === 0) {
    return { conversations: [] };
  }

  // Collect unique other-participant IDs and listing IDs
  const otherParticipantIds = new Set<string>();
  const listingIds = new Set<string>();

  for (const conv of conversations) {
    const otherId =
      conv.participant_1_id === user.id
        ? conv.participant_2_id
        : conv.participant_1_id;
    otherParticipantIds.add(otherId);
    if (conv.listing_id) {
      listingIds.add(conv.listing_id);
    }
  }

  // Batch-fetch profiles for all other participants
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", Array.from(otherParticipantIds));

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, p])
  );

  // Batch-fetch listings if any conversations are listing-scoped
  let listingMap = new Map<string, { name: string; slug: string }>();
  if (listingIds.size > 0) {
    const { data: listings } = await supabase
      .from("horse_listings")
      .select("id, name, slug")
      .in("id", Array.from(listingIds));

    listingMap = new Map(
      (listings || []).map((l) => [l.id, { name: l.name, slug: l.slug }])
    );
  }

  // Assemble enriched conversation objects
  const enriched = conversations.map((conv) => {
    const otherId =
      conv.participant_1_id === user.id
        ? conv.participant_2_id
        : conv.participant_1_id;
    const profile = profileMap.get(otherId);
    const listing = conv.listing_id
      ? listingMap.get(conv.listing_id)
      : null;

    return {
      id: conv.id,
      last_message_at: conv.last_message_at,
      last_message_preview: conv.last_message_preview,
      created_at: conv.created_at,
      other_participant: {
        id: otherId,
        display_name: profile?.display_name || null,
        avatar_url: profile?.avatar_url || null,
      },
      listing: listing
        ? { id: conv.listing_id, name: listing.name, slug: listing.slug }
        : null,
    };
  });

  return { conversations: enriched };
}
