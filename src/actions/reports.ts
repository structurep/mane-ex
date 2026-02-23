"use server";

import { createClient } from "@/lib/supabase/server";
import { createReportSchema } from "@/lib/validators/reporting";

export type ReportActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  reportId?: string;
};

export async function createReport(
  _prevState: ReportActionState,
  formData: FormData
): Promise<ReportActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to submit a report." };
  }

  // Parse form data
  const raw = {
    target_type: formData.get("target_type") as string,
    target_id: formData.get("target_id") as string,
    reason: formData.get("reason") as string,
    details: formData.get("details") as string,
  };

  const parsed = createReportSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      fieldErrors[path] = issue.message;
    });
    return { fieldErrors, error: "Please fix the errors below." };
  }

  // Check for duplicate open report from this user on the same target
  const { data: existing } = await supabase
    .from("reports")
    .select("id")
    .eq("reporter_id", user.id)
    .eq("target_type", parsed.data.target_type)
    .eq("target_id", parsed.data.target_id)
    .in("status", ["open", "investigating"])
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { error: "You have already reported this. Our team is reviewing it." };
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      target_type: parsed.data.target_type,
      target_id: parsed.data.target_id,
      reason: parsed.data.reason,
      details: parsed.data.details,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, reportId: data.id };
}

export async function getMyReports(): Promise<{
  reports: any[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { reports: [], error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("reporter_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { reports: [], error: error.message };
  }

  return { reports: data ?? [] };
}

export async function markNotificationsRead(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
}

export async function markNotificationRead(
  notificationId: string
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);
}

export async function getNotifications(
  limit: number = 20
): Promise<{ notifications: any[]; unreadCount: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { notifications: [], unreadCount: 0, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { notifications: [], unreadCount: 0, error: error.message };
  }

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return {
    notifications: data ?? [],
    unreadCount: count ?? 0,
  };
}
