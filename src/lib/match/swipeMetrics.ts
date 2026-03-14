/**
 * Client-side swipe telemetry with batched persistence.
 * Events queue in memory → flush to Supabase every 5s.
 * Queue capped at 50; drops silently on failure.
 */

import { insertSwipeEvents, type SwipeEventInput } from "@/actions/swipe-events";

export type SwipeMetric = {
  listing_id: string;
  swipe_duration_ms: number;
  drag_distance_px: number;
  velocity_x: number;
  commit_reason: "distance" | "velocity";
  result: "pass" | "favorite";
  discipline?: string | null;
  price?: number | null;
  location?: string | null;
  seller_id?: string | null;
};

// ── Event queue ───────────────────────────────
const MAX_QUEUE = 50;
const FLUSH_INTERVAL_MS = 5000;
let queue: SwipeEventInput[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

function ensureTimer() {
  if (flushTimer) return;
  flushTimer = setInterval(flushQueue, FLUSH_INTERVAL_MS);
  // Also flush on page hide (tab close / navigate away)
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushQueue();
    });
  }
}

function flushQueue() {
  if (queue.length === 0) return;
  const batch = queue.splice(0, MAX_QUEUE);
  // Fire-and-forget — never await, never throw
  insertSwipeEvents(batch).catch(() => { /* silent */ });
}

/**
 * Log a committed swipe metric. Queues for batch persistence.
 */
export function logSwipeMetric(metric: SwipeMetric) {
  if (process.env.NODE_ENV === "development") {
    console.debug("match_swipe_metric", metric);
  }

  queue.push({
    listing_id: metric.listing_id,
    direction: metric.result,
    commit_reason: metric.commit_reason,
    drag_distance_px: metric.drag_distance_px,
    velocity_x: metric.velocity_x,
    swipe_duration_ms: metric.swipe_duration_ms,
    discipline: metric.discipline,
    price: metric.price,
    location: metric.location,
    seller_id: metric.seller_id,
  });

  // Drop oldest if queue overflows
  if (queue.length > MAX_QUEUE) {
    queue = queue.slice(-MAX_QUEUE);
  }

  ensureTimer();
}

/** Force flush (call on Match Mode close) */
export function flushSwipeMetrics() {
  flushQueue();
}

// ── Frame-drop detection ──────────────────────
let frameDropLogged = false;

/**
 * Detect frame drops during drag. Call on every pointer move.
 * Logs once per session if frame delta > 32ms (below 30fps).
 */
export function checkFrameDrop(lastFrameTime: number): number {
  const now = performance.now();
  if (lastFrameTime > 0 && !frameDropLogged) {
    const delta = now - lastFrameTime;
    if (delta > 32) {
      console.warn("match_swipe_frame_drop", {
        delta_ms: Math.round(delta),
        timestamp: new Date().toISOString(),
      });
      frameDropLogged = true;
    }
  }
  return now;
}

/** Reset frame drop flag (call on new session or reload) */
export function resetFrameDropFlag() {
  frameDropLogged = false;
}
