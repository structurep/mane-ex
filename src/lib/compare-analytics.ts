/**
 * Lightweight compare feature instrumentation.
 * Logs events to console.debug for now — swap to a real analytics
 * provider (Mixpanel, PostHog, etc.) when ready.
 */

type CompareEventType = "compare_add" | "compare_remove" | "compare_open" | "compare_clear";

interface CompareEventPayload {
  listingId?: string;
  listingName?: string;
  count?: number;
}

export function trackCompareEvent(type: CompareEventType, payload?: CompareEventPayload) {
  if (typeof window === "undefined") return;
  console.debug("compare_event", { type, timestamp: Date.now(), ...payload });
}
