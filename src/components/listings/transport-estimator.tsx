"use client";

import { useState, useCallback, useEffect, useRef, useTransition } from "react";
import { Truck, MapPin, ArrowRight, Locate, MessageCircle, CheckCircle2 } from "lucide-react";
import {
  estimateTransportByState,
  nearestState,
  getUSStates,
  type TransportEstimate,
} from "@/lib/transport/estimate-transport";
import { submitTransportRequest } from "@/actions/transport";

interface TransportEstimatorProps {
  originState: string;
  originCity?: string | null;
  listingId: string;
  listingName: string;
  sellerId: string;
  sellerName: string;
  /** Pre-fill destination from buyer profile */
  buyerState?: string | null;
}

type LocationSource = "profile" | "geo" | "manual" | null;

export function TransportEstimator({
  originState,
  originCity,
  listingId,
  listingName,
  sellerId,
  sellerName,
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
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
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
          requestAnimationFrame(() => setShowResult(true));
        }
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      },
      { timeout: 5000, maximumAge: 300000 }
    );
  }, [buyerState, originState]);

  const handleDestChange = useCallback(
    (value: string) => {
      setDestState(value);
      setSource(value ? "manual" : null);
      setRequestSent(false);
      setRequestError(null);
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

  const handleTransportRequest = () => {
    if (!estimate || !destState) return;

    startTransition(async () => {
      const result = await submitTransportRequest({
        listingId,
        originState,
        destinationState: destState,
        estimatedLow: estimate.estimatedCostLow,
        estimatedHigh: estimate.estimatedCostHigh,
        distanceMiles: estimate.distanceMiles,
      });

      if (result.error) {
        setRequestError(result.error);
      } else {
        setRequestSent(true);
        setRequestError(null);
      }
    });
  };

  const originLabel = originCity
    ? `${originCity}, ${originState}`
    : originState;

  const contactMessage = estimate
    ? `Hello — I'm interested in ${listingName} and would like to discuss shipping to ${destState}.\n\nEstimated transport range shown was $${estimate.estimatedCostLow.toLocaleString()}–$${estimate.estimatedCostHigh.toLocaleString()}.\nIs transport assistance available?`
    : `Hello — I'm interested in ${listingName} and would like to discuss shipping options.`;

  const sourceLabel =
    source === "profile"
      ? "From your profile"
      : source === "geo"
        ? "Estimated from your location"
        : null;

  return (
    <div className="paper-flat p-5">
      <div className="mb-3 flex items-center gap-2">
        <Truck className="h-4 w-4 text-blue" />
        <span className="text-sm font-medium text-ink-dark">
          Transport Estimate
        </span>
      </div>

      {/* Origin */}
      <div className="mb-3 flex items-center gap-2 text-xs text-ink-mid">
        <MapPin className="h-3 w-3" />
        <span>From: <span className="font-medium text-ink-dark">{originLabel}</span></span>
      </div>

      {/* Destination selector */}
      <div className="mb-1">
        <label htmlFor="transport-dest" className="body-sm mb-1 block text-ink-faint">
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
            <Locate className="absolute right-9 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-pulse text-blue" />
          )}
        </div>
      </div>

      {/* Source indicator */}
      {sourceLabel && (
        <p className="mb-3 flex items-center gap-1 text-[10px] text-blue">
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
            <span className="text-ink-mid">Est. Distance</span>
            <span className="font-medium text-ink-dark">
              {estimate.distanceMiles.toLocaleString()} mi
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-mid">Est. Cost</span>
            <span className="font-serif text-lg font-bold text-ink">
              ${estimate.estimatedCostLow.toLocaleString()} – ${estimate.estimatedCostHigh.toLocaleString()}
            </span>
          </div>

          <p className="text-[10px] text-ink-faint">
            Estimates based on standard commercial hauler rates. Actual costs vary by carrier, season, and horse count.
          </p>

          {/* ── Lead capture actions ── */}
          {!requestSent ? (
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-ink-mid">
                Need help arranging transport?
              </p>

              <div className="grid grid-cols-2 gap-2">
                {/* Contact Seller — scrolls to message modal */}
                <a
                  href={`#contact-seller?message=${encodeURIComponent(contactMessage)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    // Find and click the message seller button on the page
                    const msgBtn = document.querySelector<HTMLButtonElement>('[data-contact-seller]');
                    if (msgBtn) {
                      msgBtn.click();
                    } else {
                      // Fallback: scroll to contact section
                      document.getElementById("contact-seller")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-glass bg-warmwhite px-2 py-2 text-[11px] font-medium text-ink-dark transition-colors hover:border-[var(--paper-border-strong)] hover:text-ink"
                >
                  <MessageCircle className="h-3 w-3" />
                  Contact Seller
                </a>

                {/* Request Transport Help — inserts DB row */}
                <button
                  type="button"
                  onClick={handleTransportRequest}
                  disabled={isPending}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-blue/30 bg-blue/5 px-2 py-2 text-[11px] font-medium text-blue transition-colors hover:bg-blue/10 disabled:opacity-50"
                >
                  <Truck className="h-3 w-3" />
                  {isPending ? "Sending..." : "Transport Help"}
                </button>
              </div>

              {requestError && (
                <p className="text-[10px] text-[var(--accent-red)]">{requestError}</p>

              )}
            </div>
          ) : (
            <div className="animate-fade-up flex items-start gap-2 rounded-xl bg-sage/5 p-3">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" />
              <div>
                <p className="text-xs font-medium text-sage">
                  Transport request sent
                </p>
                <p className="mt-0.5 text-[10px] text-ink-mid">
                  A transporter will contact you soon.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {geoLoading && !estimate && (
        <div className="space-y-2">
          <div className="crease-divider" />
          <div className="h-4 w-2/3 animate-shimmer rounded-xl" />
          <div className="h-6 w-1/2 animate-shimmer rounded-xl" />
        </div>
      )}

      {!estimate && !geoLoading && destState === "" && (
        <p className="text-[11px] text-ink-faint">
          Select your state to see estimated shipping costs.
        </p>
      )}
    </div>
  );
}
