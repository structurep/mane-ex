"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "@/actions/messages";
import { toast } from "sonner";

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  is_system: boolean;
  read_at: string | null;
  created_at: string;
};

type MessageThreadProps = {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
  otherParticipantName: string;
};

export function MessageThread({
  conversationId,
  currentUserId,
  initialMessages,
  otherParticipantName,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Scroll on initial load and new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if not from us (we already optimistically added ours)
          if (newMsg.sender_id !== currentUserId) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  // Auto-grow textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  // Send message
  const handleSend = async () => {
    const body = input.trim();
    if (!body || sending) return;

    setSending(true);
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Optimistic message
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      body,
      is_system: false,
      read_at: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    const result = await sendMessage(conversationId, body);

    if (result.error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      toast.error("Message failed to send");
    } else if (result.messageId) {
      // Replace optimistic ID with real ID
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticId ? { ...m, id: result.messageId! } : m
        )
      );
    }

    setSending(false);
  };

  // Send on Enter (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Message list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4">
        <div className="space-y-3">
          {messages.map((msg) => {
            // System message
            if (msg.is_system) {
              return (
                <div key={msg.id} className="px-4 text-center">
                  <p className="text-xs italic text-ink-light">{msg.body}</p>
                </div>
              );
            }

            const isMine = msg.sender_id === currentUserId;

            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 shadow-flat ${
                    isMine
                      ? "bg-paper-cream text-ink-black"
                      : "bg-paper-warm text-ink-black"
                  }`}
                >
                  {!isMine && (
                    <p className="mb-0.5 text-xs font-medium text-ink-mid">
                      {otherParticipantName}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap text-sm text-ink-mid">
                    {msg.body}
                  </p>
                  <p className="mt-1 text-right text-[10px] text-ink-light">
                    {formatMessageTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-crease-light pt-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-lg border-0 bg-paper-white px-3 py-2 text-sm text-ink-black shadow-flat placeholder:text-ink-light focus:shadow-folded focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-ink-light">
          Press Enter to send, Shift+Enter for a new line
        </p>
      </div>
    </>
  );
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return time;

  const datepart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${datepart}, ${time}`;
}
