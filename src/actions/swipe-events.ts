"use server";

import { createClient } from "@/lib/supabase/server";

export type SwipeEventInput = {
  listing_id: string;
  direction: "pass" | "favorite";
  commit_reason: "distance" | "velocity";
  drag_distance_px: number;
  velocity_x: number;
  swipe_duration_ms: number;
};

/**
 * Batch-insert swipe events. Fire-and-forget from client.
 * Silent failure — telemetry must never block UX.
 */
export async function insertSwipeEvents(events: SwipeEventInput[]) {
  if (events.length === 0) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const rows = events.map((e) => ({
    user_id: user?.id ?? null,
    listing_id: e.listing_id,
    direction: e.direction,
    commit_reason: e.commit_reason,
    drag_distance_px: e.drag_distance_px,
    velocity_x: e.velocity_x,
    swipe_duration_ms: e.swipe_duration_ms,
  }));

  await supabase.from("swipe_events").insert(rows);
}
