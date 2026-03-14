"use client";

import { useRef, useCallback, type PointerEvent } from "react";

export type SwipeDirection = "left" | "right";

type UseSwipeGestureOptions = {
  onSwipe: (direction: SwipeDirection) => void;
  onTap?: () => void;
  threshold?: number;
  maxRotation?: number;
};

type SwipeState = {
  startX: number;
  startY: number;
  currentX: number;
  isDragging: boolean;
  hasMoved: boolean;
  pointerId: number | null;
  lockedAxis: "horizontal" | "vertical" | null;
};

/**
 * Pointer-based swipe gesture engine.
 * - Tap detection (< 5px movement)
 * - Axis locking: once horizontal intent is detected, vertical scroll is blocked
 * - Real-time transform on the cardRef element (no React re-renders)
 * - Badge refs updated via direct DOM access (likeBadgeRef / passBadgeRef)
 */
export function useSwipeGesture({
  onSwipe,
  onTap,
  threshold = 80,
  maxRotation = 15,
}: UseSwipeGestureOptions) {
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
  });

  const updateTransform = useCallback(
    (dx: number) => {
      const el = cardRef.current;
      if (!el) return;
      const progress = Math.min(Math.abs(dx) / threshold, 1);
      const rotation = (dx / threshold) * maxRotation;
      el.style.transition = "none";
      el.style.transform = `translateX(${dx}px) rotate(${rotation}deg)`;
      el.style.opacity = String(1 - progress * 0.15);

      // Update badge opacity via DOM — no React re-render
      const likeOp = dx > 10 ? progress : 0;
      const passOp = dx < -10 ? progress : 0;
      if (likeBadgeRef.current) {
        likeBadgeRef.current.style.opacity = String(likeOp);
        likeBadgeRef.current.style.transform = `rotate(-12deg) scale(${0.8 + likeOp * 0.2})`;
      }
      if (passBadgeRef.current) {
        passBadgeRef.current.style.opacity = String(passOp);
        passBadgeRef.current.style.transform = `rotate(12deg) scale(${0.8 + passOp * 0.2})`;
      }
    },
    [threshold, maxRotation]
  );

  const resetTransform = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";
    el.style.transform = "translateX(0) rotate(0deg)";
    el.style.opacity = "1";
    if (likeBadgeRef.current) {
      likeBadgeRef.current.style.opacity = "0";
      likeBadgeRef.current.style.transform = "rotate(-12deg) scale(0.8)";
    }
    if (passBadgeRef.current) {
      passBadgeRef.current.style.opacity = "0";
      passBadgeRef.current.style.transform = "rotate(12deg) scale(0.8)";
    }
  }, []);

  const flyOut = useCallback(
    (direction: SwipeDirection): Promise<void> => {
      return new Promise((resolve) => {
        const el = cardRef.current;
        if (!el) { resolve(); return; }
        const x = direction === "right" ? window.innerWidth * 1.2 : -window.innerWidth * 1.2;
        const rot = direction === "right" ? maxRotation * 1.5 : -maxRotation * 1.5;
        el.style.transition = "transform 0.35s ease-in, opacity 0.35s ease-in";
        el.style.transform = `translateX(${x}px) rotate(${rot}deg)`;
        el.style.opacity = "0";
        setTimeout(resolve, 350);
      });
    },
    [maxRotation]
  );

  const onPointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    state.current = {
      startX: e.clientX,
      startY: e.clientY,
      currentX: 0,
      isDragging: true,
      hasMoved: false,
      pointerId: e.pointerId,
      lockedAxis: null,
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
      if (Math.abs(dx) >= threshold) {
        const direction: SwipeDirection = dx > 0 ? "right" : "left";
        flyOut(direction).then(() => onSwipe(direction));
      } else {
        resetTransform();
      }
    },
    [threshold, flyOut, onSwipe, onTap, resetTransform]
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
