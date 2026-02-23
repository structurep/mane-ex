"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createCollectionSchema,
  updateCollectionSchema,
  addToCollectionSchema,
  removeFromCollectionSchema,
} from "@/lib/validators/collections";

export type CollectionActionState = {
  error?: string;
  data?: unknown;
};

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export async function createCollection(
  formData: FormData
): Promise<CollectionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a collection." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = createCollectionSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const slug = generateSlug(parsed.data.name);

  const { data, error } = await supabase
    .from("collections")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      visibility: parsed.data.visibility,
    })
    .select("id, slug")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: { id: data.id, slug: data.slug } };
}

export async function updateCollection(
  formData: FormData
): Promise<CollectionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateCollectionSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.visibility) updateData.visibility = parsed.data.visibility;
  if (parsed.data.cover_image_url !== undefined) updateData.cover_image_url = parsed.data.cover_image_url;

  const { error } = await supabase
    .from("collections")
    .update(updateData)
    .eq("id", parsed.data.collection_id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}

export async function deleteCollection(
  collectionId: string
): Promise<CollectionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}

export async function addToCollection(
  collectionId: string,
  listingId: string,
  notes?: string
): Promise<CollectionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // Verify collection belongs to user
  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", user.id)
    .single();

  if (!collection) {
    return { error: "Collection not found." };
  }

  // Get current listing price for snapshot
  const { data: listing } = await supabase
    .from("horse_listings")
    .select("price")
    .eq("id", listingId)
    .single();

  const { error } = await supabase.from("collection_items").insert({
    collection_id: collectionId,
    listing_id: listingId,
    price_at_added: listing?.price ?? null,
    notes: notes || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "This horse is already in the collection." };
    }
    return { error: error.message };
  }

  return { data: { success: true } };
}

export async function removeFromCollection(
  collectionId: string,
  listingId: string
): Promise<CollectionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // Verify the collection belongs to this user
  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", user.id)
    .single();

  if (!collection) {
    return { error: "Collection not found." };
  }

  const { error } = await supabase
    .from("collection_items")
    .delete()
    .eq("collection_id", collectionId)
    .eq("listing_id", listingId);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}

export async function getMyCollections() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", data: null };
  }

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

export async function getCollectionWithItems(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", data: null };
  }

  const { data: collection, error: collError } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .eq("user_id", user.id)
    .single();

  if (collError || !collection) {
    return { error: "Collection not found.", data: null };
  }

  const { data: items, error: itemsError } = await supabase
    .from("collection_items")
    .select(`
      *,
      listing:horse_listings(
        id, name, slug, breed, price, location_state, status,
        height_hands, age_years, gender
      )
    `)
    .eq("collection_id", collection.id)
    .order("added_at", { ascending: false });

  if (itemsError) {
    return { error: itemsError.message, data: null };
  }

  // Calculate price changes
  const itemsWithChanges = (items ?? []).map((item) => {
    const listing = item.listing as Record<string, unknown> | null;
    const currentPrice = typeof listing?.price === "number" ? listing.price : null;
    const priceAtAdded = item.price_at_added;
    const priceChange =
      currentPrice !== null && priceAtAdded !== null
        ? currentPrice - priceAtAdded
        : null;

    return { ...item, price_change_cents: priceChange };
  });

  return { data: { ...collection, items: itemsWithChanges }, error: null };
}

export async function getSharedCollection(userId: string, slug: string) {
  const supabase = await createClient();

  const { data: collection, error: collError } = await supabase
    .from("collections")
    .select(`
      *,
      owner:profiles!collections_user_id_fkey(id, display_name, avatar_url)
    `)
    .eq("slug", slug)
    .eq("user_id", userId)
    .in("visibility", ["public", "shared"])
    .single();

  if (collError || !collection) {
    return { error: "Collection not found or is private.", data: null };
  }

  const { data: items } = await supabase
    .from("collection_items")
    .select(`
      *,
      listing:horse_listings(
        id, name, slug, breed, price, location_state, status,
        height_hands, age_years, gender
      )
    `)
    .eq("collection_id", collection.id)
    .order("added_at", { ascending: false });

  return { data: { ...collection, items: items ?? [] }, error: null };
}
