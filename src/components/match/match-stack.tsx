"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { Heart, X, RotateCcw, Grid, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwipeCard, type SwipeCardHandle } from "./swipe-card";
import { useMatchListings, type MatchAction, type BrowseFilters } from "@/hooks/use-match-listings";
import type { SwipeDirection } from "@/hooks/use-swipe-gesture";
import type { MatchListing, ScoredMatchListing } from "@/actions/match";
import { logInteraction, type InteractionType, type InteractionMethod } from "@/actions/interactions";
import { recordMetric } from "@/lib/match/matchMetrics";
import { flushSwipeMetrics } from "@/lib/match/swipeMetrics";
import { recordSwipe, getSessionStats, resetSession, type SessionStats } from "@/lib/match/sessionStats";

/** Client-side throttle: block duplicate (listingId + type) within 2s */
const recentInteractions = new Map<string, number>();
function throttledLogInteraction(input: Parameters<typeof logInteraction>[0]) {
  const key = `${input.listingId}:${input.type}`;
  const now = Date.now();
  const last = recentInteractions.get(key);
  if (last && now - last < 2000) return;
  recentInteractions.set(key, now);
  // Prune old entries periodically
  if (recentInteractions.size > 100) {
    for (const [k, t] of recentInteractions) {
      if (now - t > 5000) recentInteractions.delete(k);
    }
  }
  logInteraction(input);
}

type MatchStackProps = {
  onExit: () => void;
  filters?: BrowseFilters;
  onAnalytics?: (event: string, data?: Record<string, string>) => void;
  /** Callback to update progress display in parent header */
  onProgress?: (seen: number, remaining: number) => void;
  /** Show scoring debug overlay */
  debug?: boolean;
};

function haptic() {
  try { navigator.vibrate?.(10); } catch { /* unsupported */ }
}

function enrichedPayload(listing: MatchListing, extra?: Record<string, string>): Record<string, string> {
  const data: Record<string, string> = { listing_id: listing.id };
  if (listing.price) data.price = String(listing.price);
  if (listing.breed) data.breed = listing.breed;
  if (listing.location_state) data.state = listing.location_state;
  if (listing.gender) data.gender = listing.gender;
  return { ...data, ...extra };
}

export function MatchStack({ onExit, filters = {}, onAnalytics, onProgress, debug = false }: MatchStackProps) {
  const {
    current,
    next,
    stack2,
    upcoming,
    remaining,
    totalSeen,
    loading,
    exhausted,
    advance,
    reload,
  } = useMatchListings(filters, debug);

  const cardRef = useRef<SwipeCardHandle>(null);
  const processingRef = useRef(false);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);

  // Report progress to parent
  useEffect(() => {
    onProgress?.(totalSeen, remaining);
  }, [totalSeen, remaining, onProgress]);

  // Flush telemetry + reset session on unmount
  useEffect(() => {
    return () => {
      flushSwipeMetrics();
      resetSession();
    };
  }, []);

  const logEvent = useCallback(
    (event: string, data?: Record<string, string>) => {
      onAnalytics?.(event, data);
    },
    [onAnalytics]
  );

  /** Dual-log: client analytics + database interaction */
  const trackInteraction = useCallback(
    (listing: MatchListing, type: InteractionType, method: InteractionMethod) => {
      const payload = enrichedPayload(listing, { method, index: String(totalSeen) });
      const eventName = type === "favorite" ? "match_swipe_right"
        : type === "pass" ? "match_swipe_left"
        : type === "open" ? "match_open_listing"
        : "match_view";
      logEvent(eventName, payload);
      // Record session metrics
      if (type === "favorite" || type === "pass" || type === "open") recordMetric(type);
      // Fire-and-forget DB write (throttled)
      throttledLogInteraction({
        listingId: listing.id,
        type,
        method,
        price: listing.price,
        discipline: listing.discipline_ids?.[0] ?? null,
        location: listing.location_state,
      });
    },
    [logEvent, totalSeen]
  );

  const updateSessionStats = useCallback(
    (result: "favorite" | "pass", listing: MatchListing) => {
      recordSwipe({
        result,
        swipe_duration_ms: 0, // actual duration tracked in gesture hook
        drag_distance_px: 0,
        discipline: listing.discipline_ids?.[0] ?? null,
        price: listing.price,
      });
      if (debug) setSessionStats(getSessionStats());
    },
    [debug]
  );

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (processingRef.current) return;
      processingRef.current = true;
      haptic();
      const action: MatchAction = direction === "right" ? "favorite" : "pass";
      if (current) {
        trackInteraction(current, action === "favorite" ? "favorite" : "pass", "swipe");
        updateSessionStats(action, current);
      }
      advance(action);
      // Release lock after stack promotion settles (~160ms)
      setTimeout(() => { processingRef.current = false; }, 180);
    },
    [advance, current, trackInteraction, updateSessionStats]
  );

  const handleButton = useCallback(
    async (action: MatchAction) => {
      if (processingRef.current || !cardRef.current) return;
      processingRef.current = true;
      haptic();
      const direction: SwipeDirection = action === "favorite" ? "right" : "left";
      if (current) {
        trackInteraction(current, action === "favorite" ? "favorite" : "pass", "button");
        updateSessionStats(action === "favorite" ? "favorite" : "pass", current);
      }
      await cardRef.current.flyOut(direction);
      advance(action);
      // Release lock after stack promotion settles
      setTimeout(() => { processingRef.current = false; }, 180);
    },
    [advance, current, trackInteraction, updateSessionStats]
  );

  // Keyboard: left arrow = pass, right arrow = favorite
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleButton("pass");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleButton("favorite");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleButton]);

  // Loading state
  if (loading && !current) {
    return (
      <div className="flex flex-col items-center px-4" role="status" aria-label="Loading horses">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-sm">
          <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-card)] bg-paper-warm">
            <div className="h-full w-full animate-shimmer" />
            <div className="absolute inset-x-0 bottom-0 space-y-3 p-5">
              <div className="h-7 w-2/3 animate-shimmer rounded bg-paper-white/20" />
              <div className="h-5 w-1/3 animate-shimmer rounded bg-paper-white/20" />
              <div className="h-3 w-1/2 animate-shimmer rounded bg-paper-white/20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty / exhausted state
  if (exhausted && !current) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center" role="status">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-paper-cream">
          <Sparkles className="h-8 w-8 text-saddle" />
        </div>
        <h3 className="mb-2 font-serif text-2xl text-ink-black">
          {totalSeen > 0 ? "You\u2019ve seen them all!" : "No horses available"}
        </h3>
        <p className="mb-2 max-w-xs text-sm text-ink-mid">
          {totalSeen > 0
            ? `You reviewed ${totalSeen} ${totalSeen === 1 ? "horse" : "horses"}. Check back later for new listings.`
            : "No listings match your current filters."}
        </p>
        {totalSeen > 0 && (
          <p className="mb-6 text-xs text-ink-faint">
            Your favorites are saved in your Dream Barn.
          </p>
        )}
        <div className="flex gap-3">
          <Button variant="outline" onClick={reload} aria-label="Start over and see all horses again">
            <RotateCcw className="mr-2 h-4 w-4" />
            Start Over
          </Button>
          <Button onClick={onExit} aria-label="Switch to grid browsing view">
            <Grid className="mr-2 h-4 w-4" />
            Browse Grid
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4" role="region" aria-label="Match Mode card stack">
      {/* Preload upcoming card images via link preload (faster than hidden <Image>) */}
      {upcoming.map((l) => {
        const img = l.media?.find((m) => m.is_primary) ?? l.media?.[0];
        return img ? (
          <link key={l.id} rel="preload" as="image" href={img.url} />
        ) : null;
      })}

      {/* Card stack — 3 cards deep */}
      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm">
        {/* Third card (deepest) */}
        {stack2 && (
          <SwipeCard key={stack2.id} listing={stack2} onSwipe={() => {}} active={false} stackIndex={2} />
        )}

        {/* Second card */}
        {next && (
          <SwipeCard key={next.id} listing={next} onSwipe={() => {}} active={false} stackIndex={1} />
        )}

        {/* Current card (interactive) */}
        {current && (
          <SwipeCard
            key={current.id}
            ref={cardRef}
            listing={current}
            onSwipe={handleSwipe}
            onAnalytics={() => trackInteraction(current, "open", "tap")}
            active
            stackIndex={0}
          />
        )}
      </div>

      {/* Debug overlay — scoring + session stats */}
      {debug && (
        <div className="mt-2 flex gap-2">
          {/* Scoring debug */}
          {current && (current as ScoredMatchListing)._debug && (() => {
            const d = (current as ScoredMatchListing)._debug!;
            return (
              <div className="flex-1 rounded-lg bg-ink-black/80 px-3 py-2 font-mono text-[10px] text-paper-white/80">
                <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-ink-faint">Score</div>
                <div className="flex justify-between">
                  <span>final</span><span className="font-bold">{d.finalScore}</span>
                </div>
                <div className="flex justify-between"><span>rank</span><span>#{d.rankPosition}</span></div>
                <div className="flex justify-between"><span>recency</span><span>{d.recency}</span></div>
                <div className="flex justify-between"><span>complete</span><span>{d.completeness}</span></div>
                <div className="flex justify-between"><span>disc</span><span>{d.discipline}</span></div>
                <div className="flex justify-between"><span>price</span><span>{d.price}</span></div>
                <div className="flex justify-between"><span>location</span><span>{d.location}</span></div>
                {d.sellerPenalty < 1 && (
                  <div className="flex justify-between text-saddle"><span>seller</span><span>×{d.sellerPenalty}</span></div>
                )}
                {d.exploration && <div className="mt-1 text-center text-gold">exploration</div>}
              </div>
            );
          })()}

          {/* Session stats debug */}
          {sessionStats && (
            <div className="flex-1 rounded-lg bg-ink-black/80 px-3 py-2 font-mono text-[10px] text-paper-white/80">
              <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-ink-faint">Session</div>
              <div className="flex justify-between"><span>seen</span><span>{sessionStats.cards_seen}</span></div>
              <div className="flex justify-between"><span>fav_rate</span><span className="font-bold">{sessionStats.favorite_rate}%</span></div>
              <div className="flex justify-between"><span>avg_time</span><span>{sessionStats.avg_swipe_time}ms</span></div>
              <div className="flex justify-between"><span>avg_dist</span><span>{sessionStats.avg_drag_distance}px</span></div>
              <div className="flex justify-between"><span>favs</span><span className="text-saddle">{sessionStats.favorites}</span></div>
              <div className="flex justify-between"><span>passes</span><span className="text-ink-mid">{sessionStats.passes}</span></div>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-6 flex items-center gap-8">
        <button
          type="button"
          onClick={() => handleButton("pass")}
          aria-label="Pass on this horse"
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-crease-light bg-paper-white text-ink-mid shadow-folded transition-all hover:border-saddle hover:text-saddle active:scale-90"
        >
          <X className="h-7 w-7" strokeWidth={2.5} />
        </button>

        <button
          type="button"
          onClick={() => handleButton("favorite")}
          aria-label="Favorite this horse"
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-coral bg-coral text-paper-white shadow-lifted transition-all hover:bg-coral-hover active:scale-90"
        >
          <Heart className="h-8 w-8" fill="currentColor" strokeWidth={0} />
        </button>
      </div>

      {/* Counter + keyboard hint + exit */}
      <div className="mt-4 flex items-center gap-4">
        <p className="text-[12px] text-ink-faint">
          {remaining} {remaining === 1 ? "horse" : "horses"} remaining
        </p>
        <span className="hidden text-[11px] text-ink-faint/60 sm:inline" aria-hidden="true">
          ← → keys
        </span>
        <button
          type="button"
          onClick={onExit}
          className="text-[12px] font-medium text-ink-mid underline decoration-ink-faint/40 underline-offset-2 hover:text-ink-dark"
        >
          Exit Match Mode
        </button>
      </div>
    </div>
  );
}
