"use server";

import { createClient } from "@/lib/supabase/server";

export type SavedSearch = {
  id: string;
  name: string;
  filters: Record<string, string>;
  alerts: boolean;
  match_count: number;
  last_checked_at: string;
  created_at: string;
};

export async function getSavedSearches(): Promise<SavedSearch[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data as SavedSearch[]) || [];
}

export async function createSavedSearch(
  name: string,
  filters: Record<string, string>,
  alerts: boolean
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase.from("saved_searches").insert({
    user_id: user.id,
    name: name.trim(),
    filters,
    alerts,
  });

  if (error) return { ok: false, error: error.message };

  // In-app notification confirming save
  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "saved_search",
    title: "Search saved",
    body: alerts
      ? `"${name.trim()}" saved. You'll be notified when new matches appear.`
      : `"${name.trim()}" saved to your dashboard.`,
    link: "/dashboard",
    metadata: { filters },
  });

  return { ok: true };
}

export async function deleteSavedSearch(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("saved_searches")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function toggleSavedSearchAlerts(
  id: string,
  alerts: boolean
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("saved_searches")
    .update({ alerts, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
