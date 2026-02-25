"use server";

import { createClient } from "@/lib/supabase/server";
import { createPostSchema } from "@/lib/validators/barn";

export type PostActionState = {
  error?: string;
  success?: boolean;
  id?: string;
};

export async function createPost(
  data: { farm_id: string; type?: string; body: string; listing_id?: string }
): Promise<PostActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const parsed = createPostSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const { data: post, error } = await supabase
    .from("barn_posts")
    .insert({
      farm_id: parsed.data.farm_id,
      author_id: user.id,
      type: parsed.data.type ?? "text",
      body: parsed.data.body,
      listing_id: parsed.data.listing_id ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { success: true, id: post.id };
}

export async function updatePost(
  postId: string,
  body: string
): Promise<PostActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  if (body.length < 1 || body.length > 5000) {
    return { error: "Post must be between 1 and 5000 characters." };
  }

  const { error } = await supabase
    .from("barn_posts")
    .update({ body, updated_at: new Date().toISOString() })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deletePost(
  postId: string
): Promise<PostActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("barn_posts")
    .delete()
    .eq("id", postId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getPosts(
  farmId: string,
  page = 0,
  limit = 20
): Promise<{ posts: Record<string, unknown>[]; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("barn_posts")
    .select(
      "*, author:profiles!barn_posts_author_id_fkey(display_name, avatar_url), media:barn_post_media(*)"
    )
    .eq("farm_id", farmId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (error) return { posts: [], error: error.message };
  return { posts: data ?? [] };
}

export async function pinPost(
  postId: string,
  pinned: boolean
): Promise<PostActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  // Only farm owner can pin
  const { data: post } = await supabase
    .from("barn_posts")
    .select("farm_id")
    .eq("id", postId)
    .single();

  if (!post) return { error: "Post not found." };

  const { data: farm } = await supabase
    .from("farms")
    .select("owner_id")
    .eq("id", post.farm_id)
    .single();

  if (!farm || farm.owner_id !== user.id) {
    return { error: "Only farm owners can pin posts." };
  }

  const { error } = await supabase
    .from("barn_posts")
    .update({ is_pinned: pinned })
    .eq("id", postId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function savePostMedia(
  postId: string,
  media: { url: string; storagePath: string; altText?: string; sortOrder?: number; width?: number; height?: number; fileSize?: number }[]
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const rows = media.map((m, i) => ({
    post_id: postId,
    url: m.url,
    storage_path: m.storagePath,
    alt_text: m.altText ?? null,
    sort_order: m.sortOrder ?? i,
    width: m.width ?? null,
    height: m.height ?? null,
    file_size: m.fileSize ?? null,
  }));

  const { error } = await supabase.from("barn_post_media").insert(rows);
  if (error) return { error: error.message };
  return {};
}
