import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MessageCircle } from "lucide-react";
import { ConversationList } from "./conversation-list";
import { EmptyState } from "@/components/tailwind-plus";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // middleware handles redirect

  // Fetch conversations with other participant info
  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `
      *,
      participant_1:profiles!participant_1_id(id, display_name, full_name, avatar_url),
      participant_2:profiles!participant_2_id(id, display_name, full_name, avatar_url),
      listing:horse_listings!listing_id(id, name, slug)
    `
    )
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  // Get unread counts per conversation
  const { data: unreadCounts } = await supabase
    .from("messages")
    .select("conversation_id")
    .neq("sender_id", user.id)
    .is("read_at", null);

  const unreadMap = new Map<string, number>();
  unreadCounts?.forEach((m) => {
    unreadMap.set(
      m.conversation_id,
      (unreadMap.get(m.conversation_id) || 0) + 1
    );
  });

  // Enrich conversations with other participant and unread count
  const enriched = (conversations || []).map((c) => {
    const other =
      c.participant_1_id === user.id ? c.participant_2 : c.participant_1;
    return {
      id: c.id,
      otherParticipant: other,
      listing: c.listing,
      lastMessagePreview: c.last_message_preview,
      lastMessageAt: c.last_message_at,
      unreadCount: unreadMap.get(c.id) || 0,
    };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">Messages</h1>
        <p className="mt-1 text-sm text-ink-mid">
          Your conversations with buyers and sellers.
        </p>
      </div>

      {enriched.length === 0 ? (
        <div className="rounded-lg border-0 bg-paper-cream shadow-flat">
          <EmptyState
            icon={<MessageCircle className="size-10" />}
            title="No messages yet"
            description="When you message a seller or receive an inquiry, it will appear here."
            actionLabel="Browse Listings"
            actionHref="/browse"
          />
        </div>
      ) : (
        <ConversationList conversations={enriched} />
      )}
    </div>
  );
}
