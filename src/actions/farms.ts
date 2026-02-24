"use server";

import { createClient } from "@/lib/supabase/server";
import { createFarmSchema, updateFarmSchema } from "@/lib/validators/farms";

export type FarmActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  farmId?: string;
  success?: boolean;
};

export async function createFarm(
  _prevState: FarmActionState,
  formData: FormData
): Promise<FarmActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a farm." };
  }

  // Parse form data into object
  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "disciplines") {
      // Handle array fields
      const existing = raw[key] as string[] | undefined;
      raw[key] = existing ? [...existing, value as string] : [value as string];
    } else if (key === "year_established" || key === "number_of_stalls") {
      // Coerce numbers
      const num = Number(value);
      if (!isNaN(num)) {
        raw[key] = num;
      }
    } else if (value === "") {
      // Skip empty strings
    } else {
      raw[key] = value;
    }
  });

  const parsed = createFarmSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      fieldErrors[path] = issue.message;
    });
    return { fieldErrors, error: "Please fix the errors below." };
  }

  // Generate slug from name
  let slug = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Check slug uniqueness
  const { data: existingFarm } = await supabase
    .from("farms")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existingFarm) {
    // Append random suffix for uniqueness
    const suffix = Math.random().toString(36).substring(2, 8);
    slug = `${slug}-${suffix}`;
  }

  const { data, error } = await supabase
    .from("farms")
    .insert({
      owner_id: user.id,
      slug,
      ...parsed.data,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { farmId: data.id, success: true };
}

export async function updateFarm(
  _prevState: FarmActionState,
  formData: FormData
): Promise<FarmActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to update a farm." };
  }

  const farmId = formData.get("farmId") as string;
  if (!farmId) {
    return { error: "Farm ID is required." };
  }

  // Parse remaining form data into object
  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "farmId") return; // Already extracted
    if (key === "disciplines") {
      const existing = raw[key] as string[] | undefined;
      raw[key] = existing ? [...existing, value as string] : [value as string];
    } else if (key === "year_established" || key === "number_of_stalls") {
      const num = Number(value);
      if (!isNaN(num)) {
        raw[key] = num;
      }
    } else if (value === "") {
      // Skip empty strings
    } else {
      raw[key] = value;
    }
  });

  const parsed = updateFarmSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      fieldErrors[path] = issue.message;
    });
    return { fieldErrors, error: "Please fix the errors below." };
  }

  const { error } = await supabase
    .from("farms")
    .update(parsed.data)
    .eq("id", farmId)
    .eq("owner_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { farmId, success: true };
}

export async function getFarm(): Promise<{ farm: Record<string, unknown> | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { farm: null, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("farms")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (error) {
    return { farm: null, error: error.message };
  }

  return { farm: data };
}

export async function getPublicFarm(
  slug: string
): Promise<{ farm: Record<string, unknown> | null; listings: Record<string, unknown>[]; staff: Record<string, unknown>[]; error?: string }> {
  const supabase = await createClient();

  // Fetch farm by slug
  const { data: farm, error: farmError } = await supabase
    .from("farms")
    .select("*")
    .eq("slug", slug)
    .single();

  if (farmError || !farm) {
    return { farm: null, listings: [], staff: [], error: "Farm not found." };
  }

  // Fetch active listings and farm staff in parallel
  const [listingsResult, staffResult] = await Promise.all([
    supabase
      .from("horse_listings")
      .select("*")
      .eq("farm_id", farm.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("farm_staff")
      .select("id, role, title, user_id, profiles(display_name, avatar_url)")
      .eq("farm_id", farm.id),
  ]);

  return {
    farm,
    listings: listingsResult.data ?? [],
    staff: staffResult.data ?? [],
  };
}
