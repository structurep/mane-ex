"use client";

import { useState, useCallback } from "react";
import { Truck, MapPin, ArrowRight } from "lucide-react";
import {
  estimateTransportByState,
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

  const states = getUSStates();

  const handleDestChange = useCallback(
    (value: string) => {
      setDestState(value);
      if (value) {
        setEstimate(estimateTransportByState(originState, value));
      } else {
        setEstimate(null);
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
      <div className="mb-4">
        <label htmlFor="transport-dest" className="body-sm mb-1 block text-[var(--ink-faint)]">
          Your state
        </label>
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
      </div>

      {/* Estimate result */}
      {estimate && (
        <div className="space-y-3">
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

      {!estimate && destState === "" && (
        <p className="text-[11px] text-[var(--ink-faint)]">
          Select your state to see estimated shipping costs.
        </p>
      )}
    </div>
  );
}
