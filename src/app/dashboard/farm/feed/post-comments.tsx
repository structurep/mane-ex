"use client";

import { useEffect, useState, useCallback } from "react";
import { createComment, getComments, deleteComment } from "@/actions/barn-comments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Send, Loader2, Trash2, Reply } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function PostComments({
  postId,
  currentUserId,
}: {
  postId: string;
  currentUserId: string;
}) {
  const [comments, setComments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    const { comments: data } = await getComments(postId);
    setComments(data);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    let cancelled = false;

    // Initial load
    getComments(postId).then(({ comments: data }) => {
      if (!cancelled) {
        setComments(data);
        setLoading(false);
      }
    });

    // Subscribe to realtime changes
    const supabase = createClient();
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "barn_post_comments", filter: `post_id=eq.${postId}` },
        () => loadComments()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [postId, loadComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setSubmitting(true);
    await createComment({
      post_id: postId,
      body: body.trim(),
      parent_id: replyTo ?? undefined,
    });
    setBody("");
    setReplyTo(null);
    setSubmitting(false);
    await loadComments();
  }

  async function handleDelete(commentId: string) {
    await deleteComment(commentId);
    await loadComments();
  }

  if (loading) {
    return (
      <div className="border-t border-crease-light px-4 py-4">
        <Loader2 className="mx-auto h-4 w-4 animate-spin text-ink-light" />
      </div>
    );
  }

  return (
    <div className="border-t border-crease-light">
      {/* Comment list */}
      <div className="max-h-80 space-y-0 overflow-y-auto px-4">
        {comments.map((comment) => {
          const author = comment.author as { display_name: string | null; avatar_url: string | null } | null;
          const commentId = comment.id as string;
          const authorId = comment.author_id as string;
          const commentBody = comment.body as string;
          const createdAt = comment.created_at as string;
          const replies = (comment.replies ?? []) as Record<string, unknown>[];
          const isAuthor = authorId === currentUserId;

          return (
            <div key={commentId} className="py-3">
              <div className="flex gap-2.5">
                {author?.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-paper-warm">
                    <User className="h-3.5 w-3.5 text-ink-light" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-ink-black">
                      {author?.display_name ?? "Member"}
                    </span>
                    <span className="text-xs text-ink-light">
                      {timeAgo(createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-ink-mid">{commentBody}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setReplyTo(commentId)}
                      className="text-xs text-ink-light hover:text-ink-black"
                    >
                      <Reply className="mr-0.5 inline h-3 w-3" />
                      Reply
                    </button>
                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => handleDelete(commentId)}
                        className="text-xs text-ink-light hover:text-red"
                      >
                        <Trash2 className="mr-0.5 inline h-3 w-3" />
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Replies */}
                  {replies.length > 0 && (
                    <div className="mt-2 space-y-2 border-l-2 border-crease-light pl-3">
                      {replies.map((reply) => {
                        const replyAuthor = reply.author as { display_name: string | null; avatar_url: string | null } | null;
                        return (
                          <div key={reply.id as string} className="flex gap-2">
                            {replyAuthor?.avatar_url ? (
                              <img
                                src={replyAuthor.avatar_url}
                                alt=""
                                className="h-5 w-5 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-paper-warm">
                                <User className="h-3 w-3 text-ink-light" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs font-medium text-ink-black">
                                  {replyAuthor?.display_name ?? "Member"}
                                </span>
                                <span className="text-xs text-ink-light">
                                  {timeAgo(reply.created_at as string)}
                                </span>
                              </div>
                              <p className="text-xs text-ink-mid">
                                {reply.body as string}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-crease-light px-4 py-3"
      >
        {replyTo && (
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="shrink-0 rounded bg-paper-warm px-2 py-0.5 text-xs text-ink-light"
          >
            Replying... &times;
          </button>
        )}
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
          maxLength={2000}
          className="flex-1 border-0 bg-paper-warm"
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          disabled={submitting || !body.trim()}
          className="h-8 w-8"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
