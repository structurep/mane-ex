"use server";

import { createClient } from "@/lib/supabase/server";
import { fullListingSchema } from "@/lib/validators/listing";
import { redirect } from "next/navigation";

export type ListingActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  listingId?: string;
};

type RegistryRecordInput = {
  registry: string;
  registrationNumber: string;
  registeredName?: string;
  verificationStatus: string;
};

/** Extract and parse registry_records JSON from FormData, then remove from raw object. */
function extractRegistryRecords(formData: FormData): RegistryRecordInput[] {
  const raw = formData.get("registry_records") as string | null;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as RegistryRecordInput[];
    // Filter out records without required registry_number; normalize registry to uppercase
    return parsed
      .filter((r) => r.registrationNumber?.trim())
      .map((r) => ({ ...r, registry: r.registry.toUpperCase().trim() }));
  } catch {
    return [];
  }
}

/** Parse listing FormData into a raw object for Zod validation. */
function parseListingFormData(formData: FormData, skipKeys: string[] = []): Record<string, unknown> {
  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (skipKeys.includes(key)) return;
    if (key === "registry_records") return; // handled separately
    if (key === "media_checklist") return; // handled below
    if (key === "discipline_ids") {
      const existing = raw[key] as string[] | undefined;
      raw[key] = existing ? [...existing, value as string] : [value as string];
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

  // Map _checkedAngles/_checkedVideos → media_checklist (only if present)
  const rawChecklist = formData.get("media_checklist") as string | null;
  const hasAngles = formData.has("_checkedAngles");
  const hasVideos = formData.has("_checkedVideos");

  if (rawChecklist) {
    // Prefer pre-serialized media_checklist JSON from buildListingFormData
    try {
      const parsed = JSON.parse(rawChecklist);
      if (parsed && typeof parsed === "object") {
        raw.media_checklist = {
          angles: Array.isArray(parsed.angles) ? parsed.angles : [],
          videos: Array.isArray(parsed.videos) ? parsed.videos : [],
        };
      }
    } catch {
      // Invalid JSON — skip, don't overwrite existing
    }
  } else if (hasAngles || hasVideos) {
    // Fallback: read individual fields from form submission
    const angles = formData.getAll("_checkedAngles").map(String).filter(Boolean);
    const videos = formData.getAll("_checkedVideos").map(String).filter(Boolean);
    raw.media_checklist = { angles, videos };
  }
  // If neither key is present, media_checklist is NOT set → preserves existing DB value

  return raw;
}

/** Persist registry records for a listing (delete-then-insert). */
async function saveRegistryRecords(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listingId: string,
  records: RegistryRecordInput[]
): Promise<string | null> {
  // Delete existing records
  const { error: deleteErr } = await supabase
    .from("listing_registry_records")
    .delete()
    .eq("listing_id", listingId);

  if (deleteErr) {
    return `Failed to clear registry records: ${deleteErr.message}`;
  }

  // Insert current set (if any)
  if (records.length > 0) {
    const { error: insertErr } = await supabase
      .from("listing_registry_records")
      .insert(
        records.map((r) => ({
          listing_id: listingId,
          registry: r.registry.toUpperCase().trim(),
          registry_number: r.registrationNumber.trim(),
          registered_name: r.registeredName?.trim() || null,
          status: r.verificationStatus || "unverified",
        }))
      );

    if (insertErr) {
      return `Listing saved but registry records failed: ${insertErr.message}`;
    }
  }

  return null; // success
}

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

  const registryRecords = extractRegistryRecords(formData);
  const raw = parseListingFormData(formData);

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

  // Save registry records (best-effort — listing is already created)
  if (registryRecords.length > 0) {
    const regErr = await saveRegistryRecords(supabase, data.id, registryRecords);
    if (regErr) {
      // Listing exists but records failed — redirect anyway, user can re-add
      console.error(regErr);
    }
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

  const registryRecords = extractRegistryRecords(formData);
  const raw = parseListingFormData(formData, ["_listingId"]);

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

  // Save registry records
  const regErr = await saveRegistryRecords(supabase, listingId, registryRecords);
  if (regErr) {
    return { error: regErr };
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
  const { data: existingFav } = await supabase
    .from("listing_favorites")
    .select("id")
    .eq("listing_id", listingId)
    .eq("user_id", user.id)
    .single();

  if (existingFav) {
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
