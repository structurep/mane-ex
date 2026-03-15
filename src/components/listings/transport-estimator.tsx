"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Truck, MapPin, ArrowRight, Locate } from "lucide-react";
import {
  estimateTransportByState,
  nearestState,
  getUSStates,
  type TransportEstimate,
} from "@/lib/transport/estimate-transport";

interface TransportEstimatorProps {
  originState: string;
  originCity?: string | null;
  listingId: string;
  listingName: string;
  /** Pre-fill destination from buyer profile */
  buyerState?: string | null;
}

type LocationSource = "profile" | "geo" | "manual" | null;

export function TransportEstimator({
  originState,
  originCity,
  listingId,
  listingName,
  buyerState,
}: TransportEstimatorProps) {
  const [destState, setDestState] = useState(buyerState ?? "");
  const [estimate, setEstimate] = useState<TransportEstimate | null>(() => {
    if (buyerState) {
      return estimateTransportByState(originState, buyerState);
    }
    return null;
  });
  const [source, setSource] = useState<LocationSource>(buyerState ? "profile" : null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showResult, setShowResult] = useState(!!buyerState);
  const geoAttempted = useRef(false);

  const states = getUSStates();

  // Geolocation fallback — only if no buyerState provided
  useEffect(() => {
    if (buyerState || geoAttempted.current) return;
    geoAttempted.current = true;

    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected = nearestState(pos.coords.latitude, pos.coords.longitude);
        if (detected) {
          setDestState(detected);
          setEstimate(estimateTransportByState(originState, detected));
          setSource("geo");
          // Fade in after a tick
          requestAnimationFrame(() => setShowResult(true));
        }
        setGeoLoading(false);
      },
      () => {
        // Permission denied or error — silent fallback
        setGeoLoading(false);
      },
      { timeout: 5000, maximumAge: 300000 }
    );
  }, [buyerState, originState]);

  const handleDestChange = useCallback(
    (value: string) => {
      setDestState(value);
      setSource(value ? "manual" : null);
      if (value) {
        setEstimate(estimateTransportByState(originState, value));
        setShowResult(true);
      } else {
        setEstimate(null);
        setShowResult(false);
      }
    },
    [originState]
  );

  const originLabel = originCity
    ? `${originCity}, ${originState}`
    : originState;

  const quoteMailto = estimate
    ? `mailto:transport@maneexchange.com?subject=Transport Quote Request&body=${encodeURIComponent(
        `Horse: ${listingName} (ID: ${listingId})\nRoute: ${originState} → ${destState}\nEstimated Distance: ${estimate.distanceMiles} miles\n\nPlease provide a detailed quote for this route.`
      )}`
    : "#";

  const sourceLabel =
    source === "profile"
      ? "From your profile"
      : source === "geo"
        ? "Estimated from your location"
        : null;

  return (
    <div className="paper-flat p-5">
      <div className="mb-3 flex items-center gap-2">
        <Truck className="h-4 w-4 text-[var(--accent-blue)]" />
        <span className="text-sm font-medium text-[var(--ink-dark)]">
          Transport Estimate
        </span>
      </div>

      {/* Origin */}
      <div className="mb-3 flex items-center gap-2 text-xs text-[var(--ink-mid)]">
        <MapPin className="h-3 w-3" />
        <span>From: <span className="font-medium text-[var(--ink-dark)]">{originLabel}</span></span>
      </div>

      {/* Destination selector */}
      <div className="mb-1">
        <label htmlFor="transport-dest" className="body-sm mb-1 block text-[var(--ink-faint)]">
          Your state
        </label>
        <div className="relative">
          <select
            id="transport-dest"
            value={destState}
            onChange={(e) => handleDestChange(e.target.value)}
            className="input-paper w-full text-sm"
          >
            <option value="">Select destination...</option>
            {states.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {geoLoading && (
            <Locate className="absolute right-9 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-pulse text-[var(--accent-blue)]" />
          )}
        </div>
      </div>

      {/* Source indicator */}
      {sourceLabel && (
        <p className="mb-3 flex items-center gap-1 text-[10px] text-[var(--accent-blue)]">
          <Locate className="h-2.5 w-2.5" />
          {sourceLabel}
        </p>
      )}
      {!sourceLabel && <div className="mb-3" />}

      {/* Estimate result — with fade-in */}
      {estimate && showResult && (
        <div className="animate-fade-up space-y-3">
          <div className="crease-divider" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--ink-mid)]">Est. Distance</span>
            <span className="font-medium text-[var(--ink-dark)]">
              {estimate.distanceMiles.toLocaleString()} mi
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--ink-mid)]">Est. Cost</span>
            <span className="font-serif text-lg font-bold text-[var(--ink-black)]">
              ${estimate.estimatedCostLow.toLocaleString()} – ${estimate.estimatedCostHigh.toLocaleString()}
            </span>
          </div>

          <p className="text-[10px] text-[var(--ink-faint)]">
            Estimates based on standard commercial hauler rates. Actual costs vary by carrier, season, and horse count.
          </p>

          <a
            href={quoteMailto}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-card)] border border-[var(--paper-border)] bg-[var(--paper-surface)] px-3 py-2 text-xs font-medium text-[var(--ink-dark)] transition-colors hover:border-[var(--paper-border-strong)] hover:text-[var(--ink-black)]"
          >
            Request Transport Quote
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Loading skeleton */}
      {geoLoading && !estimate && (
        <div className="space-y-2">
          <div className="crease-divider" />
          <div className="h-4 w-2/3 animate-shimmer rounded-[var(--radius-card)]" />
          <div className="h-6 w-1/2 animate-shimmer rounded-[var(--radius-card)]" />
        </div>
      )}

      {!estimate && !geoLoading && destState === "" && (
        <p className="text-[11px] text-[var(--ink-faint)]">
          Select your state to see estimated shipping costs.
        </p>
      )}
    </div>
  );
}
