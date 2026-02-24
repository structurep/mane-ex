import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChevronLeft } from "lucide-react";
import { MessageThread } from "./thread";

export const metadata: Metadata = { title: "Conversation" };

type Props = { params: Promise<{ id: string }> };

export default async function ConversationPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch conversation with participants
  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      `
      *,
      participant_1:profiles!participant_1_id(id, display_name, full_name, avatar_url),
      participant_2:profiles!participant_2_id(id, display_name, full_name, avatar_url),
      listing:horse_listings!listing_id(id, name, slug)
    `
    )
    .eq("id", id)
    .single();

  if (!conversation) notFound();

  // Verify user is a participant
  if (
    conversation.participant_1_id !== user.id &&
    conversation.participant_2_id !== user.id
  ) {
    notFound();
  }

  // Fetch messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  // Mark unread messages as read
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", id)
    .neq("sender_id", user.id)
    .is("read_at", null);

  const other =
    conversation.participant_1_id === user.id
      ? conversation.participant_2
      : conversation.participant_1;

  const otherName = other?.display_name || other?.full_name || "Unknown";

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      {/* Thread header */}
      <div className="flex items-center gap-3 border-b border-crease-light pb-4">
        <Link
          href="/dashboard/messages"
          className="text-ink-light hover:text-ink-black md:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="h-8 w-8 rounded-full bg-paper-warm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink-black">{otherName}</p>
          {conversation.listing && (
            <Link
              href={`/horses/${conversation.listing.slug}`}
              className="text-xs text-blue hover:underline"
            >
              Re: {conversation.listing.name}
            </Link>
          )}
        </div>
      </div>

      {/* Pass to client component for realtime + sending */}
      <MessageThread
        conversationId={id}
        currentUserId={user.id}
        initialMessages={messages || []}
        otherParticipantName={otherName}
      />
    </div>
  );
}
