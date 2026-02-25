"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateAvatarUrl(
  url: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", user.id);

  return error ? { error: error.message } : {};
}

export async function updateCoverUrl(
  url: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("profiles")
    .update({ cover_url: url })
    .eq("id", user.id);

  return error ? { error: error.message } : {};
}

export async function saveProfilePhoto(data: {
  url: string;
  storagePath: string;
  caption?: string;
  isAvatar?: boolean;
  isCover?: boolean;
  width?: number;
  height?: number;
  fileSize?: number;
}): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { data: photo, error } = await supabase
    .from("profile_photos")
    .insert({
      user_id: user.id,
      url: data.url,
      storage_path: data.storagePath,
      caption: data.caption ?? null,
      is_avatar: data.isAvatar ?? false,
      is_cover: data.isCover ?? false,
      width: data.width ?? null,
      height: data.height ?? null,
      file_size: data.fileSize ?? null,
    })
    .select("id")
    .single();

  return error ? { error: error.message } : { id: photo.id };
}

export async function deleteProfilePhoto(
  photoId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("profile_photos")
    .delete()
    .eq("id", photoId)
    .eq("user_id", user.id);

  return error ? { error: error.message } : {};
}

export async function getProfilePhotos(
  userId: string
): Promise<{ photos: Record<string, unknown>[]; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profile_photos")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  return error
    ? { photos: [], error: error.message }
    : { photos: data ?? [] };
}
