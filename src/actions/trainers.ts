"use server";

import { createClient } from "@/lib/supabase/server";
import { trainerProfileSchema, trainerServiceSchema } from "@/lib/validators/trainer";
import type { TrainerProfile, TrainerService } from "@/types/trainers";

export type TrainerActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

// ============================================================
// Profile CRUD
// ============================================================

/**
 * Get or create the trainer profile for the current user.
 */
export async function getTrainerProfile(): Promise<{
  profile: TrainerProfile | null;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { profile: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("trainer_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return { profile: null, error: error.message };
  return { profile: data as TrainerProfile | null };
}

/**
 * Create or update the trainer profile.
 */
export async function upsertTrainerProfile(
  _prevState: TrainerActionState,
  formData: FormData
): Promise<TrainerActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "disciplines" || key === "certifications") {
      const existing = raw[key] as string[] | undefined;
      raw[key] = existing ? [...existing, value as string] : [value as string];
    } else if (value === "true" || value === "false") {
      raw[key] = value === "true";
    } else if (value === "") {
      // skip empty strings
    } else {
      raw[key] = value;
    }
  });

  const parsed = trainerProfileSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      fieldErrors[issue.path.join(".")] = issue.message;
    });
    return { fieldErrors, error: "Please fix the errors below." };
  }

  // Clean empty website_url
  const data = {
    ...parsed.data,
    website_url: parsed.data.website_url || null,
  };

  const { error } = await supabase
    .from("trainer_profiles")
    .upsert({ id: user.id, ...data }, { onConflict: "id" });

  if (error) return { error: error.message };
  return { success: true };
}

// ============================================================
// Services CRUD
// ============================================================

/**
 * List services for a trainer.
 */
export async function getTrainerServices(trainerId?: string): Promise<{
  services: TrainerService[];
  error?: string;
}> {
  const supabase = await createClient();

  let id = trainerId;
  if (!id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { services: [], error: "Not authenticated" };
    id = user.id;
  }

  const { data, error } = await supabase
    .from("trainer_services")
    .select("*")
    .eq("trainer_id", id)
    .order("created_at", { ascending: true });

  if (error) return { services: [], error: error.message };
  return { services: (data ?? []) as TrainerService[] };
}

/**
 * Add a new service.
 */
export async function addTrainerService(
  _prevState: TrainerActionState,
  formData: FormData
): Promise<TrainerActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (value !== "") raw[key] = value;
  });

  const parsed = trainerServiceSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      fieldErrors[issue.path.join(".")] = issue.message;
    });
    return { fieldErrors, error: "Please fix the errors below." };
  }

  // Verify trainer profile exists
  const { data: profile } = await supabase
    .from("trainer_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return { error: "Please create your trainer profile first." };
  }

  const { error } = await supabase
    .from("trainer_services")
    .insert({ trainer_id: user.id, ...parsed.data });

  if (error) return { error: error.message };
  return { success: true };
}

/**
 * Update an existing service.
 */
export async function updateTrainerService(
  serviceId: string,
  _prevState: TrainerActionState,
  formData: FormData
): Promise<TrainerActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (value !== "") raw[key] = value;
  });

  const parsed = trainerServiceSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      fieldErrors[issue.path.join(".")] = issue.message;
    });
    return { fieldErrors, error: "Please fix the errors below." };
  }

  const { error } = await supabase
    .from("trainer_services")
    .update(parsed.data)
    .eq("id", serviceId)
    .eq("trainer_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

/**
 * Delete a service.
 */
export async function deleteTrainerService(
  serviceId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("trainer_services")
    .delete()
    .eq("id", serviceId)
    .eq("trainer_id", user.id);

  if (error) return { error: error.message };
  return {};
}

// ============================================================
// Public directory
// ============================================================

/**
 * Search trainers for the public directory page.
 */
export async function searchTrainers(opts?: {
  state?: string;
  discipline?: string;
  category?: string;
}): Promise<{
  trainers: (TrainerProfile & { display_name: string | null; avatar_url: string | null; services: TrainerService[] })[];
  error?: string;
}> {
  const supabase = await createClient();

  let query = supabase
    .from("trainer_profiles")
    .select("*, profiles!inner(display_name, avatar_url)")
    .eq("accepting_clients", true)
    .order("verified", { ascending: false })
    .order("review_count", { ascending: false })
    .limit(50);

  if (opts?.state) {
    query = query.eq("location_state", opts.state);
  }
  if (opts?.discipline) {
    query = query.contains("disciplines", [opts.discipline]);
  }

  const { data, error } = await query;
  if (error) return { trainers: [], error: error.message };

  // Fetch services for all trainers
  const trainerIds = (data ?? []).map((t) => t.id);
  const serviceMap = new Map<string, TrainerService[]>();

  if (trainerIds.length > 0) {
    let serviceQuery = supabase
      .from("trainer_services")
      .select("*")
      .in("trainer_id", trainerIds)
      .eq("is_active", true);

    if (opts?.category) {
      serviceQuery = serviceQuery.eq("category", opts.category);
    }

    const { data: services } = await serviceQuery;
    for (const s of services ?? []) {
      const existing = serviceMap.get(s.trainer_id) ?? [];
      existing.push(s as TrainerService);
      serviceMap.set(s.trainer_id, existing);
    }

    // If filtering by category, only include trainers with matching services
    if (opts?.category) {
      const filtered = (data ?? []).filter((t) => serviceMap.has(t.id));
      return {
        trainers: filtered.map((t) => {
          const profile = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
          return {
            ...(t as unknown as TrainerProfile),
            display_name: (profile as Record<string, unknown>)?.display_name as string | null,
            avatar_url: (profile as Record<string, unknown>)?.avatar_url as string | null,
            services: serviceMap.get(t.id) ?? [],
          };
        }),
      };
    }
  }

  return {
    trainers: (data ?? []).map((t) => {
      const profile = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
      return {
        ...(t as unknown as TrainerProfile),
        display_name: (profile as Record<string, unknown>)?.display_name as string | null,
        avatar_url: (profile as Record<string, unknown>)?.avatar_url as string | null,
        services: serviceMap.get(t.id) ?? [],
      };
    }),
  };
}

/**
 * Get a single trainer profile with services for the detail page.
 */
export async function getTrainerDetail(trainerId: string): Promise<{
  trainer: (TrainerProfile & { display_name: string | null; avatar_url: string | null; services: TrainerService[] }) | null;
  error?: string;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trainer_profiles")
    .select("*, profiles!inner(display_name, avatar_url)")
    .eq("id", trainerId)
    .single();

  if (error || !data) return { trainer: null, error: error?.message ?? "Not found" };

  const { data: services } = await supabase
    .from("trainer_services")
    .select("*")
    .eq("trainer_id", trainerId)
    .eq("is_active", true)
    .order("created_at");

  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;

  return {
    trainer: {
      ...(data as unknown as TrainerProfile),
      display_name: (profile as Record<string, unknown>)?.display_name as string | null,
      avatar_url: (profile as Record<string, unknown>)?.avatar_url as string | null,
      services: (services ?? []) as TrainerService[],
    },
  };
}
