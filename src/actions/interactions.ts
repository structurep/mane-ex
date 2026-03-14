"use server";

import { createClient } from "@/lib/supabase/server";

export type InteractionType = "view" | "pass" | "favorite" | "open";
export type InteractionMethod = "swipe" | "button" | "keyboard" | "tap";

type LogInteractionInput = {
  listingId: string;
  type: InteractionType;
  method: InteractionMethod;
  price?: number | null;
  discipline?: string | null;
  location?: string | null;
};

/**
 * Log a listing interaction to the database.
 * Fire-and-forget — never blocks UI, fails silently for unauthenticated users.
 */
export async function logInteraction(input: LogInteractionInput): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("listing_interactions").insert({
      user_id: user.id,
      listing_id: input.listingId,
      interaction_type: input.type,
      method: input.method,
      price: input.price ?? null,
      discipline: input.discipline ?? null,
      location: input.location ?? null,
    });
  } catch {
    // Silent failure — interaction logging must never break the UI
  }
}
