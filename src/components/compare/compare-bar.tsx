"use client";

import Link from "next/link";
import Image from "next/image";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompareStore, removeFromCompare, clearCompare } from "@/lib/compare-store";

/**
 * Floating comparison bar — appears at the bottom of the screen when ≥1 horse
 * is selected for comparison. CTA activates at ≥2.
 */
export function CompareBar() {
  const items = useCompareStore();

  if (items.length === 0) return null;

  const compareUrl = `/compare?ids=${items.map((i) => i.id).join(",")}`;
  const canCompare = items.length >= 2;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-crease-light bg-paper-white/95 shadow-hovering backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300 fill-mode-both">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5 md:px-8">
        {/* Horse thumbnails */}
        <div className="flex items-center gap-2">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <div className="h-10 w-10 overflow-hidden rounded-lg border border-crease-light bg-paper-cream">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[8px] text-ink-faint">
                    No img
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFromCompare(item.id)}
                aria-label={`Remove ${item.name} from comparison`}
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink-dark text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: 3 - items.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-crease-mid text-[9px] text-ink-faint"
            >
              +
            </div>
          ))}
        </div>

        {/* Status + actions */}
        <div className="ml-auto flex items-center gap-3">
          <p className="hidden text-xs text-ink-mid sm:block">
            {items.length}/3 selected
            {!canCompare && " — add one more"}
          </p>

          <button
            type="button"
            onClick={clearCompare}
            className="text-xs text-ink-light hover:text-ink-mid"
          >
            Clear
          </button>

          {canCompare ? (
            <Button size="sm" asChild>
              <Link href={compareUrl}>
                Compare
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <Button size="sm" disabled>
              Compare
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
