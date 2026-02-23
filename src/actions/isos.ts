"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createIsoSchema,
  updateIsoSchema,
  matchIsoSchema,
} from "@/lib/validators/isos";
import { ISO_TIER_LIMITS } from "@/types/isos";

export type IsoActionState = {
  error?: string;
  data?: unknown;
};

export async function createIso(
  formData: FormData
): Promise<IsoActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create an ISO." };
  }

  // Parse form data — handle array fields
  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (["discipline_ids", "gender", "breeds", "preferred_states"].includes(key)) {
      const existing = raw[key] as string[] | undefined;
      raw[key] = existing ? [...existing, value as string] : [value as string];
    } else if (["min_price", "max_price"].includes(key) && value !== "") {
      raw[key] = Math.round(Number(value) * 100); // dollars to cents
    } else if (value !== "") {
      raw[key] = value;
    }
  });

  const parsed = createIsoSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Check tier limits
  const { data: profile } = await supabase
    .from("profiles")
    .select("seller_tier")
    .eq("id", user.id)
    .single();

  const tier = (profile?.seller_tier ?? "basic") as keyof typeof ISO_TIER_LIMITS;
  const limits = ISO_TIER_LIMITS[tier];

  // Count active ISOs
  const { count } = await supabase
    .from("iso_posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "active");

  if (limits.max_active > 0 && (count ?? 0) >= limits.max_active) {
    return {
      error: `You can have at most ${limits.max_active} active ISO${limits.max_active === 1 ? "" : "s"} on your current plan.`,
    };
  }

  const { data, error } = await supabase
    .from("iso_posts")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      discipline_ids: parsed.data.discipline_ids,
      min_price: parsed.data.min_price ?? null,
      max_price: parsed.data.max_price ?? null,
      min_height_hands: parsed.data.min_height_hands ?? null,
      max_height_hands: parsed.data.max_height_hands ?? null,
      min_age: parsed.data.min_age ?? null,
      max_age: parsed.data.max_age ?? null,
      gender: parsed.data.gender,
      breeds: parsed.data.breeds,
      preferred_states: parsed.data.preferred_states,
      level: parsed.data.level ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: { id: data.id } };
}

export async function updateIso(
  formData: FormData
): Promise<IsoActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateIsoSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.title) updateData.title = parsed.data.title;
  if (parsed.data.description) updateData.description = parsed.data.description;
  if (parsed.data.status) updateData.status = parsed.data.status;

  const { error } = await supabase
    .from("iso_posts")
    .update(updateData)
    .eq("id", parsed.data.iso_id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}

export async function closeIso(isoId: string): Promise<IsoActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("iso_posts")
    .update({ status: "closed" })
    .eq("id", isoId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}

export async function matchIso(
  formData: FormData
): Promise<IsoActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to match a horse." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = matchIsoSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Verify ISO is active
  const { data: iso } = await supabase
    .from("iso_posts")
    .select("id, user_id, status")
    .eq("id", parsed.data.iso_id)
    .single();

  if (!iso || iso.status !== "active") {
    return { error: "This ISO is no longer active." };
  }

  if (iso.user_id === user.id) {
    return { error: "You cannot match your own ISO." };
  }

  // Verify listing is active and belongs to matcher (or matcher is a trainer)
  const { data: listing } = await supabase
    .from("horse_listings")
    .select("id, status")
    .eq("id", parsed.data.listing_id)
    .eq("status", "active")
    .single();

  if (!listing) {
    return { error: "Listing not found or not active." };
  }

  // Check tier limits for responses_per_month
  const { data: profile } = await supabase
    .from("profiles")
    .select("seller_tier")
    .eq("id", user.id)
    .single();

  const tier = (profile?.seller_tier ?? "basic") as keyof typeof ISO_TIER_LIMITS;
  const limits = ISO_TIER_LIMITS[tier];

  if (limits.responses_per_month === 0) {
    return { error: "Your plan does not include ISO matching. Upgrade to respond." };
  }

  if (limits.responses_per_month > 0) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("iso_matches")
      .select("id", { count: "exact", head: true })
      .eq("matched_by", user.id)
      .gte("created_at", startOfMonth.toISOString());

    if ((count ?? 0) >= limits.responses_per_month) {
      return {
        error: `You have reached your monthly limit of ${limits.responses_per_month} ISO matches.`,
      };
    }
  }

  const { data, error } = await supabase
    .from("iso_matches")
    .insert({
      iso_id: parsed.data.iso_id,
      listing_id: parsed.data.listing_id,
      matched_by: user.id,
      message: parsed.data.message || null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "This horse has already been matched to this ISO." };
    }
    return { error: error.message };
  }

  return { data: { id: data.id } };
}

export async function getIsos(filters?: {
  discipline?: string;
  minPrice?: number;
  maxPrice?: number;
  state?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("iso_posts")
    .select(`
      *,
      author:profiles!iso_posts_user_id_fkey(
        id, display_name, avatar_url, city, state
      )
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (filters?.state) {
    query = query.contains("preferred_states", [filters.state]);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

export async function getMyIsos() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", data: null };
  }

  const { data, error } = await supabase
    .from("iso_posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

export async function getIsoMatches(isoId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("iso_matches")
    .select(`
      *,
      listing:horse_listings(
        id, name, slug, breed, price, height_hands, age_years,
        location_state
      ),
      matcher:profiles!iso_matches_matched_by_fkey(
        id, display_name, avatar_url
      )
    `)
    .eq("iso_id", isoId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}
