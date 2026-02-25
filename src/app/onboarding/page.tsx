import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "./onboarding-flow";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Already complete — send to dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete, display_name, avatar_url, cover_url, bio, city, state, zip, role")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_complete) {
    redirect("/dashboard");
  }

  return (
    <OnboardingFlow
      userId={user.id}
      initialData={{
        display_name: (profile?.display_name as string) ?? "",
        avatar_url: (profile?.avatar_url as string) ?? "",
        cover_url: (profile?.cover_url as string) ?? "",
        bio: (profile?.bio as string) ?? "",
        city: (profile?.city as string) ?? "",
        state: (profile?.state as string) ?? "",
        zip: (profile?.zip as string) ?? "",
        role: (profile?.role as string) ?? "buyer",
      }}
    />
  );
}
