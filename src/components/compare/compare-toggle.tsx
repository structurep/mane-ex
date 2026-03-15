"use client";

import { useCallback } from "react";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  toggleCompare,
  useCompareStore,
  type CompareItem,
} from "@/lib/compare-store";
import { trackCompareEvent } from "@/lib/compare-analytics";

interface CompareToggleProps {
  item: CompareItem;
  className?: string;
}

/**
 * Compare checkbox overlay — position absolute over a listing card image.
 * Stops event propagation so the parent <Link> doesn't navigate.
 * When active: shows saddle ring around image container + dim overlay.
 */
export function CompareToggle({ item, className }: CompareToggleProps) {
  const compareItems = useCompareStore();
  const active = compareItems.some((i) => i.id === item.id);
  const full = compareItems.length >= 3 && !active;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (full) return;
      const wasActive = active;
      toggleCompare(item);
      trackCompareEvent(wasActive ? "compare_remove" : "compare_add", {
        listingId: item.id,
        listingName: item.name,
        count: wasActive ? compareItems.length - 1 : compareItems.length + 1,
      });
    },
    [item, full]
  );

  return (
    <>
      {/* Selection ring + dim overlay */}
      {active && (
        <div className="pointer-events-none absolute inset-0 z-10 rounded-[var(--radius-card)] ring-2 ring-inset ring-saddle">
          <div className="absolute inset-0 bg-saddle/10" />
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? `Remove ${item.name} from comparison` : `Add ${item.name} to comparison`}
        title={full ? "Remove a horse to compare another" : active ? "Remove from compare" : "Add to compare"}
        className={cn(
          "absolute bottom-2 left-2 z-20 flex items-center gap-1.5 rounded-[var(--radius-badge)] px-2.5 py-1.5 text-[11px] font-semibold backdrop-blur-sm transition-all",
          active
            ? "bg-saddle text-white shadow-lifted"
            : "bg-[var(--ink-black)]/50 text-white hover:bg-[var(--ink-black)]/70",
          full && !active && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <Scale className="h-3 w-3" />
        {active ? "Comparing" : "Compare"}
      </button>
    </>
  );
}
