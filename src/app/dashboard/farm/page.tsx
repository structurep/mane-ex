import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FarmForm } from "./farm-form";

export const metadata: Metadata = {
  title: "Barn Page",
};

export default async function FarmPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: farm } = await supabase
    .from("farms")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
          {farm ? "Edit Barn Page" : "Create Your Barn Page"}
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          {farm
            ? "Update your barn's public profile."
            : "Set up your barn page to showcase your operation."}
        </p>
      </div>
      <FarmForm farm={farm} />
    </div>
  );
}
