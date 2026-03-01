"use client";

import { useRef, useEffect, useCallback } from "react";
import { updateListing, type ListingActionState } from "@/actions/listings";
import { buildListingFormData } from "@/lib/build-listing-form-data";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

type AutosaveOptions = {
  /** Current wizard form data (from useReducer state.data) */
  data: Record<string, unknown>;
  /** Listing ID for the update action */
  listingId: string;
  /** Enable autosave (false in create mode) */
  enabled: boolean;
  /** Debounce delay in ms */
  delay?: number;
  /** Called on every status transition */
  onStatusChange: (status: SaveStatus) => void;
  /**
   * Called on successful save with the JSON snapshot of the data that was
   * actually persisted. The wizard uses this to reset initialSnapshotRef
   * so dirty tracking stays correct.
   */
  onSaveComplete: (savedSnapshot: string) => void;
  /** Called on save failure */
  onSaveError: (error: string) => void;
};

export function useAutosave({
  data,
  listingId,
  enabled,
  delay = 1200,
  onStatusChange,
  onSaveComplete,
  onSaveError,
}: AutosaveOptions) {
  // --- Refs for stable access inside async callbacks ---
  const dataRef = useRef(data);
  dataRef.current = data;

  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;
  const onSaveCompleteRef = useRef(onSaveComplete);
  onSaveCompleteRef.current = onSaveComplete;
  const onSaveErrorRef = useRef(onSaveError);
  onSaveErrorRef.current = onSaveError;

  // Monotonically increasing counter. Incremented on every data change
  // and on flush/retry. Used to detect stale save responses.
  const versionRef = useRef(0);

  // Debounce timer handle
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prevent state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Snapshot of data that was last successfully saved via autosave.
  // Used to skip redundant saves when data hasn't changed.
  const lastSavedSnapshotRef = useRef<string | null>(null);

  /**
   * Execute a save against the server. Captures version at invocation time
   * and compares on completion — if version changed, the response is stale.
   */
  const executeSave = useCallback(async () => {
    if (!enabled || !listingId) return;

    const saveVersion = versionRef.current;
    const snapshot = JSON.stringify(dataRef.current);

    // Skip if nothing changed since last successful autosave
    if (snapshot === lastSavedSnapshotRef.current) return;

    if (!mountedRef.current) return;
    onStatusChangeRef.current("saving");

    try {
      const formData = buildListingFormData(dataRef.current, listingId);
      const result: ListingActionState = await updateListing({}, formData);

      // Stale response — data changed while save was in flight
      if (versionRef.current !== saveVersion || !mountedRef.current) return;

      if (result.error) {
        onStatusChangeRef.current("error");
        onSaveErrorRef.current(result.error);
      } else {
        lastSavedSnapshotRef.current = snapshot;
        onSaveCompleteRef.current(snapshot);
        // Note: onStatusChange("saved") is called by the wizard's
        // onSaveComplete handler after it resets dirty tracking
      }
    } catch (err) {
      if (versionRef.current !== saveVersion || !mountedRef.current) return;
      onStatusChangeRef.current("error");
      onSaveErrorRef.current(
        err instanceof Error ? err.message : "Network error",
      );
    }
  }, [enabled, listingId]);

  /**
   * Debounce effect: on every data change, bump version, clear timer,
   * schedule a new save after `delay` ms.
   */
  useEffect(() => {
    if (!enabled) return;

    versionRef.current += 1;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      executeSave();
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, enabled, delay, executeSave]);

  /**
   * Cancel pending autosave and bump version so any in-flight response
   * is discarded. Called before manual "Save Changes" form submission.
   */
  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    versionRef.current += 1;
  }, []);

  /**
   * Retry immediately after a failure. Bumps version (so this retry
   * supersedes any prior), then uses latest data (via dataRef).
   */
  const retry = useCallback(() => {
    versionRef.current += 1;
    executeSave();
  }, [executeSave]);

  return { flush, retry };
}
