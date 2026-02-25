import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">Settings</h1>
        <p className="mt-1 text-sm text-ink-mid">
          Manage your profile and preferences.
        </p>
      </div>
      <ProfileForm profile={profile} userEmail={user.email ?? ""} />
    </div>
  );
}
