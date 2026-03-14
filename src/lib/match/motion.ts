/**
 * Centralized motion presets for Match Mode.
 * Tune globally — don't scatter magic numbers across components.
 */

// ── Swipe Commit ──────────────────────────────
/** Minimum px displacement to commit a swipe */
export const SWIPE_THRESHOLD_PX = 80;
/** Minimum px/ms velocity to commit (allows decisive flicks below px threshold) */
export const SWIPE_VELOCITY_THRESHOLD = 0.6; // px/ms

// ── Rotation & Opacity ────────────────────────
/** Max card rotation during drag (degrees). Luxury = restrained. */
export const MAX_ROTATION_DEG = 6;
/** Max opacity reduction during drag (0.12 = drops to 88%) */
export const DRAG_OPACITY_DROP = 0.12;

// ── Fly-out (accepted swipe) ──────────────────
/** Duration for card to exit screen (ms) */
export const FLYOUT_DURATION_MS = 200;
/** Fly-out CSS transition */
export const FLYOUT_TRANSITION = `transform ${FLYOUT_DURATION_MS}ms cubic-bezier(0.2, 0, 0.6, 1), opacity ${FLYOUT_DURATION_MS}ms cubic-bezier(0.2, 0, 0.6, 1)`;
/** Rotation multiplier for fly-out (relative to MAX_ROTATION_DEG) */
export const FLYOUT_ROTATION_MULT = 1.5;

// ── Snap-back (rejected swipe) ────────────────
/** Duration for snap-back to center (ms) */
export const SNAPBACK_DURATION_MS = 160;
/** Snap-back CSS transition */
export const SNAPBACK_TRANSITION = `transform ${SNAPBACK_DURATION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity ${SNAPBACK_DURATION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;

// ── Stack Promotion (next card → active) ──────
/** Duration for next card to settle into active position (ms) */
export const PROMOTION_DURATION_MS = 160;
/** Stack promotion CSS transition */
export const PROMOTION_TRANSITION = `transform ${PROMOTION_DURATION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity ${PROMOTION_DURATION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;

// ── Badge Animation ───────────────────────────
/** Resting badge scale (invisible state) */
export const BADGE_SCALE_MIN = 0.85;
/** Badge rotation (LIKE = negative, PASS = positive) */
export const BADGE_ROTATION_DEG = 12;

// ── GPU Hints ─────────────────────────────────
/** Apply to animated card for compositor promotion */
export const GPU_STYLE: React.CSSProperties = {
  willChange: "transform",
  backfaceVisibility: "hidden",
};
