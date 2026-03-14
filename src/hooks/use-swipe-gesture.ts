"use client";

import { useRef, useCallback, useEffect, type PointerEvent } from "react";
import {
  SWIPE_THRESHOLD_PX,
  SWIPE_VELOCITY_THRESHOLD,
  MAX_ROTATION_DEG,
  DRAG_OPACITY_DROP,
  FLYOUT_DURATION_MS,
  FLYOUT_TRANSITION,
  FLYOUT_ROTATION_MULT,
  SNAPBACK_TRANSITION,
  BADGE_SCALE_MIN,
  BADGE_ROTATION_DEG,
} from "@/lib/match/motion";
import { logSwipeMetric, checkFrameDrop } from "@/lib/match/swipeMetrics";

export type SwipeDirection = "left" | "right";

type UseSwipeGestureOptions = {
  onSwipe: (direction: SwipeDirection) => void;
  onTap?: () => void;
  /** Current listing context — attached to swipe metrics */
  listingId?: string;
  discipline?: string | null;
  price?: number | null;
  location?: string | null;
  sellerId?: string | null;
};

type SwipeState = {
  startX: number;
  startY: number;
  currentX: number;
  isDragging: boolean;
  hasMoved: boolean;
  pointerId: number | null;
  lockedAxis: "horizontal" | "vertical" | null;
  /** Timestamp of last pointer move (for velocity calc) */
  lastMoveTime: number;
  /** X position at last pointer move */
  lastMoveX: number;
  /** Computed velocity at release (px/ms) */
  velocityX: number;
  /** Timestamp of drag start (for duration metric) */
  startTime: number;
  /** Last frame timestamp (for frame-drop detection) */
  lastFrameTime: number;
};

/**
 * Pointer-based swipe gesture engine.
 * - Velocity tracking for decisive flicks
 * - Tap detection (< 5px movement)
 * - Axis locking: horizontal intent blocks vertical scroll
 * - Ref-driven transforms (zero React re-renders during drag)
 */
export function useSwipeGesture({
  onSwipe,
  onTap,
  listingId,
  discipline,
  price,
  location,
  sellerId,
}: UseSwipeGestureOptions) {
  const contextRef = useRef({ listingId, discipline, price, location, sellerId });
  useEffect(() => {
    contextRef.current = { listingId, discipline, price, location, sellerId };
  }, [listingId, discipline, price, location, sellerId]);
  const cardRef = useRef<HTMLDivElement>(null);
  const likeBadgeRef = useRef<HTMLDivElement>(null);
  const passBadgeRef = useRef<HTMLDivElement>(null);
  const state = useRef<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    isDragging: false,
    hasMoved: false,
    pointerId: null,
    lockedAxis: null,
    lastMoveTime: 0,
    lastMoveX: 0,
    velocityX: 0,
    startTime: 0,
    lastFrameTime: 0,
  });

  const updateTransform = useCallback((dx: number) => {
    const el = cardRef.current;
    if (!el) return;
    const progress = Math.min(Math.abs(dx) / SWIPE_THRESHOLD_PX, 1);
    const rotation = (dx / SWIPE_THRESHOLD_PX) * MAX_ROTATION_DEG;
    el.style.transition = "none";
    el.style.transform = `translate3d(${dx}px, 0, 0) rotate(${rotation}deg)`;
    el.style.opacity = String(1 - progress * DRAG_OPACITY_DROP);

    // Update badge opacity via DOM — no React re-render
    const likeOp = dx > 10 ? progress : 0;
    const passOp = dx < -10 ? progress : 0;
    const scaleRange = 1 - BADGE_SCALE_MIN;
    if (likeBadgeRef.current) {
      likeBadgeRef.current.style.opacity = String(likeOp);
      likeBadgeRef.current.style.transform = `rotate(-${BADGE_ROTATION_DEG}deg) scale(${BADGE_SCALE_MIN + likeOp * scaleRange})`;
    }
    if (passBadgeRef.current) {
      passBadgeRef.current.style.opacity = String(passOp);
      passBadgeRef.current.style.transform = `rotate(${BADGE_ROTATION_DEG}deg) scale(${BADGE_SCALE_MIN + passOp * scaleRange})`;
    }
  }, []);

  const resetTransform = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = SNAPBACK_TRANSITION;
    el.style.transform = "translate3d(0, 0, 0) rotate(0deg)";
    el.style.opacity = "1";
    if (likeBadgeRef.current) {
      likeBadgeRef.current.style.opacity = "0";
      likeBadgeRef.current.style.transform = `rotate(-${BADGE_ROTATION_DEG}deg) scale(${BADGE_SCALE_MIN})`;
    }
    if (passBadgeRef.current) {
      passBadgeRef.current.style.opacity = "0";
      passBadgeRef.current.style.transform = `rotate(${BADGE_ROTATION_DEG}deg) scale(${BADGE_SCALE_MIN})`;
    }
  }, []);

  const flyOut = useCallback(
    (direction: SwipeDirection): Promise<void> => {
      return new Promise((resolve) => {
        const el = cardRef.current;
        if (!el) { resolve(); return; }
        const x = direction === "right" ? window.innerWidth * 1.2 : -window.innerWidth * 1.2;
        const rot = direction === "right"
          ? MAX_ROTATION_DEG * FLYOUT_ROTATION_MULT
          : -MAX_ROTATION_DEG * FLYOUT_ROTATION_MULT;
        el.style.transition = FLYOUT_TRANSITION;
        el.style.transform = `translate3d(${x}px, 0, 0) rotate(${rot}deg)`;
        el.style.opacity = "0";
        setTimeout(resolve, FLYOUT_DURATION_MS);
      });
    },
    []
  );

  const onPointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const now = performance.now();
    state.current = {
      startX: e.clientX,
      startY: e.clientY,
      currentX: 0,
      isDragging: true,
      hasMoved: false,
      pointerId: e.pointerId,
      lockedAxis: null,
      lastMoveTime: now,
      lastMoveX: e.clientX,
      velocityX: 0,
      startTime: now,
      lastFrameTime: 0,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const s = state.current;
      if (!s.isDragging) return;
      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;

      // Dead zone: require > 5px to distinguish from tap
      if (!s.hasMoved && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      s.hasMoved = true;

      // Lock axis on first significant movement
      if (!s.lockedAxis) {
        s.lockedAxis = Math.abs(dx) >= Math.abs(dy) ? "horizontal" : "vertical";
      }

      // If locked vertical, release pointer and let the browser scroll
      if (s.lockedAxis === "vertical") {
        s.isDragging = false;
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(s.pointerId!);
        } catch { /* noop */ }
        return;
      }

      // Horizontal drag — prevent scroll and update card transform
      e.preventDefault();
      s.currentX = dx;

      // Frame-drop detection (logs once per session if delta > 32ms)
      s.lastFrameTime = checkFrameDrop(s.lastFrameTime);

      // Track velocity (exponential moving average for smoothness)
      const now = performance.now();
      const dt = now - s.lastMoveTime;
      if (dt > 0) {
        const instantVelocity = (e.clientX - s.lastMoveX) / dt;
        s.velocityX = s.velocityX * 0.3 + instantVelocity * 0.7;
      }
      s.lastMoveTime = now;
      s.lastMoveX = e.clientX;

      updateTransform(dx);
    },
    [updateTransform]
  );

  const onPointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const s = state.current;
      if (!s.isDragging) return;
      s.isDragging = false;

      if (s.pointerId !== null) {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(s.pointerId);
        } catch { /* noop */ }
      }

      if (!s.hasMoved) {
        onTap?.();
        return;
      }

      const dx = s.currentX;
      const absV = Math.abs(s.velocityX);

      // Commit if displacement OR velocity exceeds threshold
      const committed = Math.abs(dx) >= SWIPE_THRESHOLD_PX || absV >= SWIPE_VELOCITY_THRESHOLD;

      if (committed) {
        // Direction from displacement, but if displacement is small, use velocity
        const commitReason: "distance" | "velocity" =
          Math.abs(dx) >= SWIPE_THRESHOLD_PX ? "distance" : "velocity";
        const direction: SwipeDirection =
          commitReason === "distance"
            ? (dx > 0 ? "right" : "left")
            : (s.velocityX > 0 ? "right" : "left");

        // Log swipe metric (fires only on commit, never during drag)
        const ctx = contextRef.current;
        logSwipeMetric({
          listing_id: ctx.listingId ?? "",
          swipe_duration_ms: Math.round(performance.now() - s.startTime),
          drag_distance_px: Math.round(Math.abs(dx)),
          velocity_x: Math.round(s.velocityX * 1000) / 1000,
          commit_reason: commitReason,
          result: direction === "right" ? "favorite" : "pass",
          discipline: ctx.discipline,
          price: ctx.price,
          location: ctx.location,
          seller_id: ctx.sellerId,
        });

        flyOut(direction).then(() => onSwipe(direction));
      } else {
        resetTransform();
      }
    },
    [flyOut, onSwipe, onTap, resetTransform]
  );

  return {
    cardRef,
    likeBadgeRef,
    passBadgeRef,
    handlers: { onPointerDown, onPointerMove, onPointerUp },
    flyOut,
    resetTransform,
  };
}
