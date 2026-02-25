"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePost, pinPost } from "@/actions/barn-posts";
import { PostMediaGrid } from "./post-media-grid";
import { PostComments } from "./post-comments";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  MoreHorizontal,
  Pin,
  Trash2,
  MessageCircle,
  Megaphone,
} from "lucide-react";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

export function PostCard({
  post,
  currentUserId,
  isOwner,
}: {
  post: Record<string, unknown>;
  currentUserId: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);

  const author = post.author as { display_name: string | null; avatar_url: string | null } | null;
  const media = (post.media ?? []) as Record<string, unknown>[];
  const postId = post.id as string;
  const authorId = post.author_id as string;
  const body = post.body as string;
  const type = post.type as string;
  const isPinned = post.is_pinned as boolean;
  const commentCount = post.comment_count as number;
  const createdAt = post.created_at as string;

  const isAuthor = authorId === currentUserId;
  const canDelete = isAuthor || isOwner;

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    await deletePost(postId);
    router.refresh();
  }

  async function handlePin() {
    await pinPost(postId, !isPinned);
    router.refresh();
  }

  return (
    <div className="rounded-lg border-0 bg-paper-cream shadow-flat">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-0">
        {author?.avatar_url ? (
          <img
            src={author.avatar_url}
            alt={author.display_name ?? ""}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-warm">
            <User className="h-4 w-4 text-ink-light" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-ink-black">
              {author?.display_name ?? "Member"}
            </span>
            {type === "announcement" && (
              <Badge variant="secondary" className="text-xs">
                <Megaphone className="mr-1 h-3 w-3" />
                Announcement
              </Badge>
            )}
            {isPinned && (
              <Badge variant="outline" className="text-xs">
                <Pin className="mr-1 h-3 w-3" />
                Pinned
              </Badge>
            )}
          </div>
          <span className="text-xs text-ink-light">{timeAgo(createdAt)}</span>
        </div>

        {/* Actions menu */}
        {canDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded p-1 text-ink-light hover:bg-paper-warm hover:text-ink-black">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && (
                <DropdownMenuItem onClick={handlePin}>
                  <Pin className="mr-2 h-4 w-4" />
                  {isPinned ? "Unpin" : "Pin to top"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDelete} className="text-red">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <p className="whitespace-pre-wrap text-sm text-ink-black">{body}</p>
      </div>

      {/* Media */}
      {media.length > 0 && (
        <PostMediaGrid media={media} />
      )}

      {/* Footer */}
      <div className="border-t border-crease-light px-4 py-2.5">
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-ink-light hover:text-ink-black"
        >
          <MessageCircle className="h-4 w-4" />
          {commentCount > 0 ? `${commentCount} comment${commentCount !== 1 ? "s" : ""}` : "Comment"}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <PostComments postId={postId} currentUserId={currentUserId} />
      )}
    </div>
  );
}
