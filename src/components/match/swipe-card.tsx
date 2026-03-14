"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Ruler, Calendar } from "lucide-react";
import type { MatchListing } from "@/actions/match";
import { useSwipeGesture, type SwipeDirection } from "@/hooks/use-swipe-gesture";
import { forwardRef, useImperativeHandle, useCallback } from "react";
import {
  PROMOTION_TRANSITION,
  BADGE_SCALE_MIN,
  BADGE_ROTATION_DEG,
  GPU_STYLE,
} from "@/lib/match/motion";

export type SwipeCardHandle = {
  flyOut: (direction: SwipeDirection) => Promise<void>;
};

type SwipeCardProps = {
  listing: MatchListing;
  onSwipe: (direction: SwipeDirection) => void;
  active?: boolean;
  onAnalytics?: (event: string) => void;
  /** Stack position: 0 = current, 1 = next, 2 = third */
  stackIndex?: number;
};

const STACK_STYLES: Record<number, { transform: string; opacity: string }> = {
  1: { transform: "scale(0.97) translateY(8px)", opacity: "0.7" },
  2: { transform: "scale(0.94) translateY(16px)", opacity: "0.5" },
};

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
  function SwipeCard({ listing: l, onSwipe, active = false, onAnalytics, stackIndex = 0 }, ref) {
    const router = useRouter();

    const handleTap = useCallback(() => {
      onAnalytics?.("match_open_listing");
      router.push(`/horses/${l.slug}`);
    }, [router, l.slug, onAnalytics]);

    const { cardRef, likeBadgeRef, passBadgeRef, handlers, flyOut } = useSwipeGesture({
      onSwipe,
      onTap: handleTap,
    });

    useImperativeHandle(ref, () => ({ flyOut }), [flyOut]);

    const priceStr = l.price
      ? `$${(l.price / 100).toLocaleString()}`
      : "Contact for Price";

    const primary = l.media?.find((m) => m.is_primary) ?? l.media?.[0];
    const bgStyle = active
      ? { transform: undefined as string | undefined, opacity: undefined as string | undefined }
      : (STACK_STYLES[stackIndex] ?? { transform: "scale(0.94) translateY(16px)", opacity: "0.5" });

    return (
      <div
        ref={cardRef}
        role={active ? "button" : undefined}
        aria-label={active ? `${l.name}, ${priceStr}. Swipe right to like, left to pass, or tap for details` : undefined}
        className={`absolute inset-0 select-none overflow-hidden rounded-2xl bg-ink-black ${
          active ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        style={{
          touchAction: active ? "pan-y" : "auto",
          transform: active ? undefined : bgStyle.transform,
          opacity: active ? undefined : bgStyle.opacity,
          transition: active ? undefined : PROMOTION_TRANSITION,
          zIndex: active ? 10 : 5 - stackIndex,
          ...GPU_STYLE,
        }}
        {...(active ? handlers : {})}
      >
        {/* Full-bleed image */}
        <div className="relative h-full w-full">
          {primary ? (
            <Image
              src={primary.url}
              alt={l.name}
              fill
              sizes="(max-width: 640px) 92vw, 400px"
              className="object-cover"
              priority={active || stackIndex === 1}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-paper-warm text-ink-faint">
              No photo
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 via-ink-black/20 to-transparent" />

          {/* LIKE badge — ref-driven opacity (no React re-renders during drag) */}
          {active && (
            <div
              ref={likeBadgeRef}
              className="pointer-events-none absolute left-4 top-4 z-20 rounded-lg border-[3px] border-forest bg-forest/20 px-5 py-2 backdrop-blur-sm"
              style={{ opacity: 0, transform: `rotate(-${BADGE_ROTATION_DEG}deg) scale(${BADGE_SCALE_MIN})` }}
            >
              <span className="text-lg font-black tracking-wider text-forest">LIKE</span>
            </div>
          )}

          {/* PASS badge — ref-driven opacity */}
          {active && (
            <div
              ref={passBadgeRef}
              className="pointer-events-none absolute right-4 top-4 z-20 rounded-lg border-[3px] border-oxblood bg-oxblood/20 px-5 py-2 backdrop-blur-sm"
              style={{ opacity: 0, transform: `rotate(${BADGE_ROTATION_DEG}deg) scale(${BADGE_SCALE_MIN})` }}
            >
              <span className="text-lg font-black tracking-wider text-oxblood">PASS</span>
            </div>
          )}

          {/* Info overlay */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-5">
            <h3 className="font-serif text-[28px] font-bold leading-tight tracking-tight text-paper-white">
              {l.name}
            </h3>
            <p className="mt-1 font-serif text-xl font-bold text-paper-white/90">
              {priceStr}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-paper-white/70">
              {l.breed && <span>{l.breed}</span>}
              {l.gender && <span>{l.gender}</span>}
              {l.age_years != null && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {l.age_years}yo
                </span>
              )}
              {l.height_hands != null && (
                <span className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  {l.height_hands}hh
                </span>
              )}
            </div>

            {l.location_state && (
              <div className="mt-2 flex items-center gap-1 text-[13px] text-paper-white/60">
                <MapPin className="h-3 w-3" />
                {l.location_city ? `${l.location_city}, ${l.location_state}` : l.location_state}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
