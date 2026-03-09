"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserEmail } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { priceDropEmail } from "@/lib/email/templates";
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

  // Verify ownership (also fetch price/name/slug for price-drop notifications)
  const { data: existing } = await supabase
    .from("horse_listings")
    .select("id, seller_id, status, price, name, slug")
    .eq("id", listingId)
    .single();

  if (!existing || existing.seller_id !== user.id) {
    return { error: "Listing not found or you don't have permission to edit it." };
  }

  if (existing.status === "removed") {
    return { error: "Archived listings cannot be edited." };
  }

  if (existing.status === "pending_review") {
    return { error: "This listing is under review and cannot be edited. Please wait for moderation to complete." };
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

  // Notify users who saved this listing if price dropped (fire-and-forget)
  const oldPrice = existing.price as number | null;
  const newPrice = parsed.data.price as number | undefined;
  if (oldPrice && newPrice && newPrice < oldPrice && existing.status === "active") {
    (async () => {
      const { data: savedByUsers } = await supabase
        .from("listing_favorites")
        .select("user_id")
        .eq("listing_id", listingId);
      if (!savedByUsers || savedByUsers.length === 0) return;

      for (const fav of savedByUsers) {
        const email = await getUserEmail(fav.user_id);
        if (!email) continue;
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", fav.user_id)
          .single();
        const fmt = (cents: number) => `$${(cents / 100).toLocaleString()}`;
        const tmpl = priceDropEmail(
          profile?.display_name || "there",
          existing.name,
          fmt(oldPrice),
          fmt(newPrice),
          existing.slug
        );
        await sendEmail({
          to: email,
          ...tmpl,
          idempotencyKey: `price-drop-${listingId}-${fav.user_id}-${newPrice}`,
        });
      }
    })().catch(() => {});
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

  // Pre-publish validation: require minimum listing quality
  const { data: listing } = await supabase
    .from("horse_listings")
    .select("name, breed, description, location_state, price, status")
    .eq("id", listingId)
    .eq("seller_id", user.id)
    .single();

  if (!listing) {
    return { error: "Listing not found." };
  }

  // State transition guard: only drafts can be submitted for review
  if (listing.status !== "draft") {
    return { error: `This listing is "${listing.status}" and cannot be submitted for review. Only draft listings can be published.` };
  }

  const missing: string[] = [];
  if (!listing.name || listing.name.trim().length < 2) missing.push("horse name");
  if (!listing.location_state) missing.push("location (state)");

  // Require at least one photo
  const { count: photoCount } = await supabase
    .from("listing_media")
    .select("*", { count: "exact", head: true })
    .eq("listing_id", listingId);

  if (!photoCount || photoCount === 0) missing.push("at least one photo");

  if (missing.length > 0) {
    return { error: `Please complete the following before publishing: ${missing.join(", ")}.` };
  }

  const { error } = await supabase
    .from("horse_listings")
    .update({
      status: "pending_review",
      published_at: new Date().toISOString(),
    })
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Deduplicated notification: check for existing unread notification for this listing submission
  const { data: existingNotif } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", "listing_status")
    .is("read_at", null)
    .contains("metadata", { listing_id: listingId })
    .limit(1)
    .maybeSingle();

  if (!existingNotif) {
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "listing_status",
      title: "Listing submitted for review",
      body: `"${listing.name}" is now under review. You'll be notified once approved.`,
      link: `/dashboard`,
      metadata: { listing_id: listingId },
    });
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

  // State transition guard: verify listing exists and isn't already removed
  const { data: listing } = await supabase
    .from("horse_listings")
    .select("status")
    .eq("id", listingId)
    .eq("seller_id", user.id)
    .single();

  if (!listing) {
    return { error: "Listing not found." };
  }

  if (listing.status === "removed") {
    return { error: "This listing is already archived." };
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
