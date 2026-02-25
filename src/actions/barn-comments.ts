"use server";

import { createClient } from "@/lib/supabase/server";
import { createCommentSchema } from "@/lib/validators/barn";

export type CommentActionState = {
  error?: string;
  success?: boolean;
  id?: string;
};

export async function createComment(
  data: { post_id: string; body: string; parent_id?: string }
): Promise<CommentActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const parsed = createCommentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const { data: comment, error } = await supabase
    .from("barn_post_comments")
    .insert({
      post_id: parsed.data.post_id,
      author_id: user.id,
      body: parsed.data.body,
      parent_id: parsed.data.parent_id ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { success: true, id: comment.id };
}

export async function deleteComment(
  commentId: string
): Promise<CommentActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("barn_post_comments")
    .delete()
    .eq("id", commentId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getComments(
  postId: string
): Promise<{ comments: Record<string, unknown>[]; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("barn_post_comments")
    .select("*, author:profiles!barn_post_comments_author_id_fkey(display_name, avatar_url)")
    .eq("post_id", postId)
    .is("parent_id", null)
    .order("created_at", { ascending: true });

  if (error) return { comments: [], error: error.message };

  // Fetch replies for each top-level comment
  const commentIds = (data ?? []).map((c) => c.id);
  if (commentIds.length === 0) return { comments: data ?? [] };

  const { data: replies } = await supabase
    .from("barn_post_comments")
    .select("*, author:profiles!barn_post_comments_author_id_fkey(display_name, avatar_url)")
    .in("parent_id", commentIds)
    .order("created_at", { ascending: true });

  // Nest replies under their parent
  const commentMap = (data ?? []).map((c) => ({
    ...c,
    replies: (replies ?? []).filter((r) => r.parent_id === c.id),
  }));

  return { comments: commentMap };
}
