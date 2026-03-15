"use server";

import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema } from "@/lib/validators/profiles";
import { computeQualification } from "@/lib/buyer/qualification-score";

export type ProfileActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // Parse form data into object
  const raw: Record<string, unknown> = {};
  const disciplines: string[] = [];

  formData.forEach((value, key) => {
    if (key === "disciplines") {
      // Collect all discipline values into array
      disciplines.push(value as string);
    } else if (key === "min_budget" || key === "max_budget") {
      // Coerce budget fields to number
      raw[key] = Number(value);
    } else if (value === "true" || value === "false") {
      raw[key] = value === "true";
    } else if (value === "") {
      // Skip empty strings
    } else {
      raw[key] = value;
    }
  });

  if (disciplines.length > 0) {
    raw.disciplines = disciplines;
  }

  const parsed = updateProfileSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      fieldErrors[path] = issue.message;
    });
    return { fieldErrors, error: "Please fix the errors below." };
  }

  // Calculate profile completeness
  const profile_complete = Boolean(
    parsed.data.display_name &&
      parsed.data.bio &&
      parsed.data.city &&
      parsed.data.state
  );

  // Compute buyer qualification badge
  const qual = computeQualification(parsed.data);
  const buyer_qualification =
    qual.badge === "Qualified Buyer" ? "qualified" as const
    : qual.badge === "Verified Buyer" ? "basic" as const
    : "unverified" as const;

  const { error } = await supabase
    .from("profiles")
    .update({
      ...parsed.data,
      profile_complete,
      buyer_qualification,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getProfile(): Promise<{
  profile: Record<string, unknown> | null;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: data };
}

export async function getPublicProfile(
  profileId: string
): Promise<{ profile: Record<string, unknown> | null; listings: Record<string, unknown>[]; farm: Record<string, unknown> | null; error?: string }> {
  const supabase = await createClient();

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (profileError) {
    return {
      profile: null,
      listings: [],
      farm: null,
      error: profileError.message,
    };
  }

  // Fetch active listings and farm in parallel
  const [listingsResult, farmResult] = await Promise.all([
    supabase
      .from("horse_listings")
      .select("*")
      .eq("seller_id", profileId)
      .eq("status", "active"),
    supabase
      .from("farms")
      .select("*")
      .eq("owner_id", profileId)
      .single(),
  ]);

  return {
    profile,
    listings: listingsResult.data ?? [],
    farm: farmResult.data ?? null,
  };
}
