"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export type AdminActionState = {
  error?: string;
  success?: boolean;
};

// ============================================================
// Audit log helper
// ============================================================

async function auditLog(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createClient();
  await supabase.from("admin_audit_log").insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata,
  });
}

// ============================================================
// User management
// ============================================================

export async function suspendUser(
  userId: string,
  reason: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      suspended_at: new Date().toISOString(),
      suspension_reason: reason,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  await auditLog(admin.id, "suspend_user", "user", userId, { reason });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function unsuspendUser(
  userId: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      suspended_at: null,
      suspension_reason: null,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  await auditLog(admin.id, "unsuspend_user", "user", userId);
  revalidatePath("/admin/users");
  return { success: true };
}

// ============================================================
// Listing moderation
// ============================================================

export async function approveListing(
  listingId: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("horse_listings")
    .update({
      status: "active",
      moderated_by: admin.id,
      moderated_at: new Date().toISOString(),
      moderation_note: null,
    })
    .eq("id", listingId);

  if (error) return { error: error.message };

  await auditLog(admin.id, "approve_listing", "listing", listingId);
  revalidatePath("/admin/listings");
  return { success: true };
}

export async function rejectListing(
  listingId: string,
  reason: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("horse_listings")
    .update({
      status: "draft",
      moderated_by: admin.id,
      moderated_at: new Date().toISOString(),
      moderation_note: reason,
    })
    .eq("id", listingId);

  if (error) return { error: error.message };

  await auditLog(admin.id, "reject_listing", "listing", listingId, { reason });
  revalidatePath("/admin/listings");
  return { success: true };
}

// ============================================================
// Report resolution
// ============================================================

export async function resolveReport(
  reportId: string,
  resolution: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("reports")
    .update({
      status: "resolved",
      resolved_by: admin.id,
      resolved_at: new Date().toISOString(),
      resolution_note: resolution,
    })
    .eq("id", reportId);

  if (error) return { error: error.message };

  await auditLog(admin.id, "resolve_report", "report", reportId, {
    resolution,
  });
  revalidatePath("/admin/reports");
  return { success: true };
}

// ============================================================
// Admin data fetching
// ============================================================

export async function getAdminStats() {
  await requireAdmin();
  const supabase = await createClient();

  const [users, listings, reports, escrows, auditLog] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("horse_listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("escrow_transactions")
      .select("id", { count: "exact", head: true })
      .in("status", ["funded", "shipping", "delivered"]),
    supabase
      .from("admin_audit_log")
      .select("id, admin_id, action, target_type, target_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return {
    totalUsers: users.count || 0,
    activeListings: listings.count || 0,
    openReports: reports.count || 0,
    activeEscrows: escrows.count || 0,
    recentAuditLog: auditLog.data || [],
  };
}

export async function getAdminUsers(search?: string) {
  await requireAdmin();
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select(
      "id, display_name, email, created_at, is_admin, suspended_at, suspension_reason, subscription_status"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (search) {
    query = query.or(
      `display_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return [];
  return data;
}

export async function getAdminListings(filter: "all" | "reported" = "all") {
  await requireAdmin();
  const supabase = await createClient();

  let query = supabase
    .from("horse_listings")
    .select(
      "id, name, slug, status, price, seller_id, created_at, moderation_note, moderated_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (filter === "reported") {
    // Get listing IDs that have open reports
    const { data: reports } = await supabase
      .from("reports")
      .select("target_id")
      .eq("target_type", "listing")
      .eq("status", "pending");

    const reportedIds = (reports || []).map((r) => r.target_id);
    if (reportedIds.length > 0) {
      query = query.in("id", reportedIds);
    } else {
      return [];
    }
  }

  const { data, error } = await query;
  if (error) return [];
  return data;
}

export async function getAdminReports(status: "pending" | "resolved" | "all" = "pending") {
  await requireAdmin();
  const supabase = await createClient();

  let query = supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return [];
  return data;
}

export async function getAdminTransactions() {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("escrow_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];
  return data;
}
