"use server";

import { createClient } from "@/lib/supabase/server";
import { fullListingSchema } from "@/lib/validators/listing";
import { redirect } from "next/navigation";

export type ListingActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  listingId?: string;
};

export async function createListing(
  _prevState: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a listing." };
  }

  // Parse form data into object
  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "discipline_ids") {
      // Handle array fields
      const existing = raw[key] as string[] | undefined;
      raw[key] = existing ? [...existing, value as string] : [value as string];
    } else if (key === "price") {
      // Convert dollars to cents
      raw[key] = Math.round(Number(value) * 100);
    } else if (value === "true" || value === "false") {
      raw[key] = value === "true";
    } else if (value === "") {
      // Skip empty strings
    } else {
      raw[key] = value;
    }
  });

  const parsed = fullListingSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      fieldErrors[path] = issue.message;
    });
    return { fieldErrors, error: "Please fix the errors below." };
  }

  const { data, error } = await supabase
    .from("horse_listings")
    .insert({
      seller_id: user.id,
      status: "draft",
      ...parsed.data,
    })
    .select("id, slug")
    .single();

  if (error) {
    return { error: error.message };
  }

  redirect(`/horses/${data.slug}`);
}

export async function updateListing(
  _prevState: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to edit a listing." };
  }

  const listingId = formData.get("_listingId") as string;
  if (!listingId) {
    return { error: "Missing listing ID." };
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("horse_listings")
    .select("id, seller_id, status")
    .eq("id", listingId)
    .single();

  if (!existing || existing.seller_id !== user.id) {
    return { error: "Listing not found or you don't have permission to edit it." };
  }

  if (existing.status === "removed") {
    return { error: "Archived listings cannot be edited." };
  }

  // Parse form data into object (same logic as createListing)
  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "_listingId") return; // skip meta field
    if (key === "discipline_ids") {
      const arr = raw[key] as string[] | undefined;
      raw[key] = arr ? [...arr, value as string] : [value as string];
    } else if (key === "price") {
      raw[key] = Math.round(Number(value) * 100);
    } else if (value === "true" || value === "false") {
      raw[key] = value === "true";
    } else if (value === "") {
      // Skip empty strings
    } else {
      raw[key] = value;
    }
  });

  const parsed = fullListingSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      fieldErrors[path] = issue.message;
    });
    return { fieldErrors, error: "Please fix the errors below." };
  }

  const { error } = await supabase
    .from("horse_listings")
    .update(parsed.data)
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { listingId };
}

export async function publishListing(listingId: string): Promise<ListingActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("horse_listings")
    .update({
      status: "active",
      published_at: new Date().toISOString(),
    })
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { listingId };
}

export async function archiveListing(
  listingId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("horse_listings")
    .update({ status: "removed" })
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function toggleFavorite(
  listingId: string
): Promise<{ favorited: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { favorited: false, error: "You must be logged in to save horses." };
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from("listing_favorites")
    .select("id")
    .eq("listing_id", listingId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    await supabase
      .from("listing_favorites")
      .delete()
      .eq("listing_id", listingId)
      .eq("user_id", user.id);
    return { favorited: false };
  }

  await supabase
    .from("listing_favorites")
    .insert({ listing_id: listingId, user_id: user.id });
  return { favorited: true };
}
