/**
 * Lightweight client-side swipe telemetry.
 * Fires once per committed swipe — never during drag.
 * Console-only for now; swap to analytics endpoint later.
 */

export type SwipeMetric = {
  swipe_duration_ms: number;
  drag_distance_px: number;
  velocity_x: number;
  commit_reason: "distance" | "velocity";
  result: "pass" | "favorite";
};

let frameDropLogged = false;

/**
 * Log a committed swipe metric to console.
 */
export function logSwipeMetric(metric: SwipeMetric) {
  if (process.env.NODE_ENV === "development") {
    console.debug("match_swipe_metric", metric);
  }
  // Future: POST to /api/vitals or analytics endpoint
}

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
