"use client";

import { createClient } from "@/lib/supabase/client";

export type UploadResult =
  | { ok: true; url: string; storagePath: string }
  | { ok: false; error: string };

const MAX_FILE_SIZE: Record<string, number> = {
  avatars: 5 * 1024 * 1024,     // 5MB
  "barn-media": 10 * 1024 * 1024, // 10MB
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Upload an image to Supabase Storage (client-side direct upload).
 * @param bucket - Storage bucket name ("avatars" | "barn-media")
 * @param path - File path within bucket (e.g. "{userId}/avatar.webp")
 * @param file - File to upload
 */
export async function uploadImage(
  bucket: string,
  path: string,
  file: File
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: "Only JPEG, PNG, and WebP images are allowed." };
  }

  const maxSize = MAX_FILE_SIZE[bucket] ?? 5 * 1024 * 1024;
  if (file.size > maxSize) {
    const mb = Math.round(maxSize / 1024 / 1024);
    return { ok: false, error: `File size must be under ${mb}MB.` };
  }

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    return { ok: false, error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return { ok: true, url: urlData.publicUrl, storagePath: path };
}

/**
 * Delete an image from Supabase Storage.
 */
export async function deleteImage(
  bucket: string,
  path: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    return { error: error.message };
  }

  return {};
}

/**
 * Get a public URL for a storage object.
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
