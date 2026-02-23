"use server";

import { createClient } from "@/lib/supabase/server";
import { updateNotificationPreferencesSchema } from "@/lib/validators/notifications";

export type NotificationActionState = {
  error?: string;
  data?: unknown;
};

/**
 * Get notifications for the current user.
 */
export async function getNotifications(limit = 20, offset = 0) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", data: null };
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

/**
 * Get unread notification count.
 */
export async function getUnreadCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { count: 0 };
  }

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return { count: count ?? 0 };
}

/**
 * Mark a notification as read.
 */
export async function markNotificationRead(
  notificationId: string
): Promise<NotificationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}

/**
 * Mark all notifications as read.
 */
export async function markAllRead(): Promise<NotificationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}

/**
 * Get notification preferences.
 */
export async function getNotificationPreferences() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", data: null };
  }

  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

/**
 * Update notification preferences.
 */
export async function updateNotificationPreferences(
  formData: FormData
): Promise<NotificationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // Parse checkbox form data — unchecked checkboxes aren't submitted
  const raw: Record<string, boolean> = {};
  const allFields = [
    "email_offers",
    "email_messages",
    "email_price_drops",
    "email_new_matches",
    "email_just_sold",
    "email_weekly_digest",
    "email_marketing",
    "push_offers",
    "push_messages",
    "push_price_drops",
    "push_new_matches",
    "push_just_sold",
  ];

  for (const field of allFields) {
    raw[field] = formData.get(field) === "on" || formData.get(field) === "true";
  }

  const parsed = updateNotificationPreferencesSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(
      { user_id: user.id, ...parsed.data },
      { onConflict: "user_id" }
    );

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}

/**
 * Register a push subscription.
 */
export async function registerPushSubscription(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
): Promise<NotificationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(
      { user_id: user.id, push_subscription: subscription },
      { onConflict: "user_id" }
    );

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}
