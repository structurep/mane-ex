"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getMatchBatch, passListing, type MatchListing } from "@/actions/match";
import { toggleFavorite } from "@/actions/listings";

const BATCH_SIZE = 20;
const REFETCH_THRESHOLD = 5;
const STORAGE_KEY = "mane-match-session";
const SEED_KEY = "mane-match-seed";
const MAX_SEEN_IDS = 500;

export type MatchAction = "favorite" | "pass";

export type BrowseFilters = {
  q?: string;
  discipline?: string;
  minPrice?: string;
  maxPrice?: string;
  state?: string;
  gender?: string;
  breed?: string;
  minHeight?: string;
  maxHeight?: string;
  minAge?: string;
  maxAge?: string;
  henneke?: string;
  soundness?: string;
  region?: string;
};

type PersistedSession = {
  stack: MatchListing[];
  seenIds: string[];
  filters: BrowseFilters;
  totalSeen: number;
  timestamp: number;
};

function getSessionSeed(): number {
  try {
    const raw = sessionStorage.getItem(SEED_KEY);
    if (raw) return parseInt(raw, 10);
    const seed = Date.now();
    sessionStorage.setItem(SEED_KEY, String(seed));
    return seed;
  } catch {
    return Date.now();
  }
}

function loadSession(filters: BrowseFilters): PersistedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: PersistedSession = JSON.parse(raw);
    if (Date.now() - session.timestamp > 30 * 60 * 1000) return null;
    if (JSON.stringify(session.filters) !== JSON.stringify(filters)) return null;
    return session;
  } catch {
    return null;
  }
}

function saveSession(
  stack: MatchListing[],
  seenIds: Set<string>,
  filters: BrowseFilters,
  totalSeen: number
) {
  try {
    // Cap persisted seenIds to prevent localStorage bloat
    const ids = Array.from(seenIds);
    const session: PersistedSession = {
      stack,
      seenIds: ids.slice(-MAX_SEEN_IDS),
      filters,
      totalSeen,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch { /* noop */ }
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SEED_KEY);
  } catch { /* noop */ }
}

export function useMatchListings(filters: BrowseFilters = {}, debug = false) {
  const [stack, setStack] = useState<MatchListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [totalSeen, setTotalSeen] = useState(0);
  const [lastAction, setLastAction] = useState<{
    action: MatchAction;
    listing: MatchListing;
  } | null>(null);
  const seenIds = useRef(new Set<string>());
  const fetchingRef = useRef(false);
  const filtersRef = useRef(filters);
  const seedRef = useRef<number>(0);
  filtersRef.current = filters;

  const fetchBatch = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);

    // Cap excludeIds sent to server
    const allSeen = Array.from(seenIds.current);
    const excludeIds = allSeen.slice(-MAX_SEEN_IDS);
    if (!seedRef.current) seedRef.current = getSessionSeed();

    const { listings } = await getMatchBatch(excludeIds, BATCH_SIZE, filtersRef.current, debug, seedRef.current);

    if (listings.length === 0) {
      setExhausted(true);
    } else {
      listings.forEach((l) => seenIds.current.add(l.id));
      setStack((prev) => {
        const updated = [...prev, ...listings];
        saveSession(updated, seenIds.current, filtersRef.current, totalSeen);
        return updated;
      });
      setExhausted(false);
    }

    setLoading(false);
    fetchingRef.current = false;
  // totalSeen is read but not a reactive dependency here — we just save whatever the current value is
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debug]);

  // Restore session or fetch on mount
  useEffect(() => {
    seedRef.current = getSessionSeed();
    const session = loadSession(filters);
    if (session && session.stack.length > 0) {
      setStack(session.stack);
      setTotalSeen(session.totalSeen || 0);
      session.seenIds.forEach((id) => seenIds.current.add(id));
    } else {
      fetchBatch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advance = useCallback(
    async (action: MatchAction) => {
      const current = stack[0];
      if (!current) return { needsAuth: false };

      setLastAction({ action, listing: current });
      const newTotalSeen = totalSeen + 1;
      setTotalSeen(newTotalSeen);

      if (action === "favorite") {
        const result = await toggleFavorite(current.id);
        if (result.error) {
          return { needsAuth: true };
        }
      } else {
        passListing(current.id);
      }

      seenIds.current.add(current.id);
      setStack((prev) => {
        const updated = prev.slice(1);
        saveSession(updated, seenIds.current, filtersRef.current, newTotalSeen);
        return updated;
      });

      if (stack.length - 1 <= REFETCH_THRESHOLD && !fetchingRef.current) {
        fetchBatch();
      }

      return { needsAuth: false };
    },
    [stack, fetchBatch, totalSeen]
  );

  const reload = useCallback(() => {
    seenIds.current.clear();
    clearSession();
    setStack([]);
    setExhausted(false);
    setLastAction(null);
    setTotalSeen(0);
    fetchBatch();
  }, [fetchBatch]);

  return {
    current: stack[0] ?? null,
    next: stack[1] ?? null,
    stack2: stack[2] ?? null,
    upcoming: stack.slice(1, 4),
    remaining: stack.length,
    totalSeen,
    loading,
    exhausted,
    lastAction,
    fetchBatch,
    advance,
    reload,
  };
}
