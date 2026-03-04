/**
 * Build a FormData object from wizard state.data for the updateListing server action.
 * Mirrors the hidden-input serialization in wizard.tsx (lines 125-142).
 */
export function buildListingFormData(
  data: Record<string, unknown>,
  listingId: string,
): FormData {
  const fd = new FormData();
  fd.set("_listingId", listingId);

  // Map wizard _checkedAngles/_checkedVideos → media_checklist JSON
  const checkedAngles = data._checkedAngles;
  const checkedVideos = data._checkedVideos;
  if (Array.isArray(checkedAngles) || Array.isArray(checkedVideos)) {
    fd.set("media_checklist", JSON.stringify({
      angles: Array.isArray(checkedAngles) ? checkedAngles : [],
      videos: Array.isArray(checkedVideos) ? checkedVideos : [],
    }));
  }

  for (const [key, value] of Object.entries(data)) {
    // Skip ephemeral wizard keys and already-handled fields
    if (key === "_checkedAngles" || key === "_checkedVideos") continue;

    // registry_records is an array of objects — must be JSON-serialized
    if (key === "registry_records" && Array.isArray(value)) {
      fd.set(key, JSON.stringify(value));
      continue;
    }

    // Other arrays: each element becomes a separate FormData entry
    if (Array.isArray(value)) {
      for (const v of value) {
        fd.append(key, String(v));
      }
      continue;
    }

    // Booleans: explicit "true"/"false"
    if (typeof value === "boolean") {
      fd.set(key, String(value));
      continue;
    }

    // Non-null, non-empty scalars
    if (value != null && value !== "") {
      fd.set(key, String(value));
    }
  }

  return fd;
}
