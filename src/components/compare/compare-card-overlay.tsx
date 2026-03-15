"use client";

import { CompareToggle } from "./compare-toggle";
import type { CompareItem } from "@/lib/compare-store";

/**
 * Client-side wrapper that provides the CompareToggle as a ReactNode
 * for the ListingCard overlay slot. This bridges the server→client boundary.
 */
export function CompareCardOverlay({ item }: { item: CompareItem }) {
  return <CompareToggle item={item} />;
}
