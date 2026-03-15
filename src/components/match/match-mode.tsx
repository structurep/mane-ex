"use client";

import { useState, useCallback, useRef, useEffect, type PointerEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchStack } from "./match-stack";
import type { BrowseFilters } from "@/hooks/use-match-listings";

function logMatchEvent(event: string, data?: Record<string, string>) {
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", event, data);
  }
  if (process.env.NODE_ENV === "development") {
    console.log(`[Match] ${event}`, data ?? "");
  }
}

/**
 * Match Mode — full-screen mobile swipe interface for horse discovery.
 * Hidden on desktop (lg:hidden). Reads active browse filters from URL params.
 */
export function MatchMode() {
  const [active, setActive] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState<{ seen: number; remaining: number }>({ seen: 0, remaining: 0 });
  const searchParams = useSearchParams();
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startY: 0, currentY: 0, isDragging: false });

  // Extract browse filters from URL params
  const filters: BrowseFilters = {
    q: searchParams.get("q") || undefined,
    discipline: searchParams.get("discipline") || undefined,
    minPrice: searchParams.get("minPrice") || undefined,
    maxPrice: searchParams.get("maxPrice") || undefined,
    state: searchParams.get("state") || undefined,
    gender: searchParams.get("gender") || undefined,
    breed: searchParams.get("breed") || undefined,
    minHeight: searchParams.get("minHeight") || undefined,
    maxHeight: searchParams.get("maxHeight") || undefined,
    minAge: searchParams.get("minAge") || undefined,
    maxAge: searchParams.get("maxAge") || undefined,
    henneke: searchParams.get("henneke") || undefined,
    soundness: searchParams.get("soundness") || undefined,
    region: searchParams.get("region") || undefined,
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const matchDebug = searchParams.get("matchDebug") === "1";

  const handleProgress = useCallback((seen: number, remaining: number) => {
    setProgress({ seen, remaining });
  }, []);

  const open = useCallback(() => {
    setActive(true);
    setAnimating(true);
    logMatchEvent("match_view");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimating(false));
    });
  }, []);

  const close = useCallback(() => {
    setAnimating(true);
    logMatchEvent("match_close", { horses_seen: String(progress.seen) });
    setTimeout(() => {
      setActive(false);
      setAnimating(false);
    }, 300);
  }, [progress.seen]);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (active) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [active]);

  // Escape key to close
  useEffect(() => {
    if (!active) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, close]);

  // Swipe-down-to-close on the header area
  const onHeaderPointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    dragRef.current = { startY: e.clientY, currentY: 0, isDragging: true };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onHeaderPointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return;
    const dy = e.clientY - dragRef.current.startY;
    if (dy < 0) return;
    dragRef.current.currentY = dy;
    const el = overlayRef.current;
    if (el) {
      el.style.transform = `translateY(${dy}px)`;
      el.style.opacity = String(1 - dy / 400);
    }
  }, []);

  const onHeaderPointerUp = useCallback(() => {
    dragRef.current.isDragging = false;
    const el = overlayRef.current;
    if (!el) return;

    if (dragRef.current.currentY > 120) {
      close();
    } else {
      el.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";
      el.style.transform = "translateY(0)";
      el.style.opacity = "1";
      setTimeout(() => {
        el.style.transition = "";
      }, 300);
    }
  }, [close]);

  if (!active) {
    return (
      <div className="lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={open}
          aria-label="Open Match Mode to swipe through horses"
          className="rounded-[var(--radius-card)] border-coral/30 text-coral hover:bg-coral/5 hover:text-coral"
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          Match
          {activeFilterCount > 0 && (
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-paper-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Match Mode">
      {/* Backdrop blur */}
      <div
        className={`absolute inset-0 bg-ink-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          animating ? "opacity-0" : "opacity-100"
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Slide-up panel */}
      <div
        ref={overlayRef}
        className={`absolute inset-0 flex flex-col bg-paper-white transition-transform duration-300 ease-out ${
          animating ? "translate-y-full" : "translate-y-0"
        }`}
      >
        {/* Header — swipe-down handle */}
        <div
          className="flex items-center justify-between border-b border-crease-light px-4 py-3"
          onPointerDown={onHeaderPointerDown}
          onPointerMove={onHeaderPointerMove}
          onPointerUp={onHeaderPointerUp}
          style={{ touchAction: "none" }}
        >
          {/* Drag handle indicator */}
          <div className="absolute left-1/2 top-1.5 h-1 w-8 -translate-x-1/2 rounded-full bg-crease-mid" aria-hidden="true" />

          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-coral" aria-hidden="true" />
            <h2 className="font-serif text-lg font-bold text-ink-black">Match Mode</h2>
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-coral/10 px-1.5 text-[10px] font-bold text-coral">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Progress indicator */}
            {progress.seen > 0 && (
              <span className="text-[11px] tabular-nums text-ink-faint" aria-label={`Reviewed ${progress.seen} horses`}>
                {progress.seen} reviewed
              </span>
            )}
            <button
              type="button"
              onClick={close}
              className="text-sm font-medium text-ink-mid hover:text-ink-dark"
              aria-label="Close Match Mode"
            >
              Done
            </button>
          </div>
        </div>

        {/* Stack */}
        <div className="flex-1 overflow-hidden py-4">
          <MatchStack
            onExit={close}
            filters={filters}
            onAnalytics={logMatchEvent}
            onProgress={handleProgress}
            debug={matchDebug}
          />
        </div>
      </div>
    </div>
  );
}
