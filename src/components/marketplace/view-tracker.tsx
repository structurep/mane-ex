"use client";

import { useEffect, useRef } from "react";
import { trackListingView } from "@/actions/analytics";

export function ViewTracker({ listingId }: { listingId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackListingView(listingId).catch(() => {});
  }, [listingId]);

  return null;
}
