import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AdminUser = {
  id: string;
  email: string;
  is_admin: boolean;
};

/**
 * Require admin access. Returns the admin user or redirects to /dashboard.
 * Use in Server Components and Server Actions that need admin access.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  return {
    id: user.id,
    email: user.email || "",
    is_admin: true,
  };
}

/**
 * Check admin status without redirecting. Returns null if not admin.
 */
export async function checkAdmin(): Promise<AdminUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return null;

  return {
    id: user.id,
    email: user.email || "",
    is_admin: true,
  };
}
