"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Truck,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle,
  Send,
  Package,
  Shield,
  FileText,
  X,
} from "lucide-react";

/* ─── Transport Quote Request ─── */

export function TransportQuoteForm({
  onClose,
  carrierName,
}: {
  onClose: () => void;
  carrierName?: string;
}) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/50 p-4">
        <div className="w-full max-w-md rounded-lg bg-paper-white p-8 text-center shadow-hovering">
          <CheckCircle className="mx-auto h-12 w-12 text-forest" />
          <h3 className="mt-4 font-serif text-xl font-bold text-ink-black">
            Quote Requested
          </h3>
          <p className="mt-2 text-sm text-ink-mid">
            {carrierName
              ? `${carrierName} will respond within their typical response time.`
              : "Matching carriers in your route will respond within 24 hours."}
            {" "}You&apos;ll receive responses in your ManeExchange inbox.
          </p>
          <Button className="mt-6" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-paper-white shadow-hovering">
        <div className="flex items-center justify-between border-b border-crease-light px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Truck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-base font-semibold text-ink-black">
                Request Transport Quote
              </h3>
              {carrierName && (
                <p className="text-xs text-ink-light">from {carrierName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-light transition-colors hover:bg-paper-warm hover:text-ink-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="space-y-4 p-6"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pickup_city" className="text-xs">
                Pickup Location
              </Label>
              <Input
                id="pickup_city"
                placeholder="City, State"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="dropoff_city" className="text-xs">
                Delivery Location
              </Label>
              <Input
                id="dropoff_city"
                placeholder="City, State"
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pickup_date" className="text-xs">
                Preferred Pickup Date
              </Label>
              <Input id="pickup_date" type="date" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="horse_count" className="text-xs">
                Number of Horses
              </Label>
              <Input
                id="horse_count"
                type="number"
                min="1"
                max="10"
                defaultValue="1"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="horse_details" className="text-xs">
              Horse Details
            </Label>
            <Input
              id="horse_details"
              placeholder="Breed, size, temperament"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Special Requirements</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {[
                "Climate control",
                "Individual stall",
                "Hay & water",
                "GPS tracking",
                "Insurance required",
                "Overnight layover OK",
              ].map((req) => (
                <label
                  key={req}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full bg-paper-cream px-2.5 py-1 text-xs text-ink-mid transition-colors hover:bg-paper-warm"
                >
                  <input type="checkbox" className="h-3 w-3 accent-primary" />
                  {req}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-xs">
              Additional Notes
            </Label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Gate code, special loading needs, health cert details..."
              className="mt-1 w-full rounded-md border border-crease-light bg-paper-white px-3 py-2 text-sm placeholder:text-ink-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-ink-light">
              Free to request · No obligation
            </p>
            <Button type="submit">
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Send Quote Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Transport Tracking Timeline ─── */

export type TransportStatus =
  | "booked"
  | "health_cert"
  | "pickup_scheduled"
  | "in_transit"
  | "rest_stop"
  | "delivered"
  | "cancelled";

type TrackingStep = {
  status: TransportStatus;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const TRACKING_STEPS: TrackingStep[] = [
  {
    status: "booked",
    label: "Booked",
    description: "Transport confirmed with carrier",
    icon: Package,
  },
  {
    status: "health_cert",
    label: "Health Cert",
    description: "Coggins & health certificate verified",
    icon: FileText,
  },
  {
    status: "pickup_scheduled",
    label: "Pickup Scheduled",
    description: "Carrier en route to pickup location",
    icon: Calendar,
  },
  {
    status: "in_transit",
    label: "In Transit",
    description: "Horse on the road, GPS tracking active",
    icon: Truck,
  },
  {
    status: "rest_stop",
    label: "Rest Stop",
    description: "Scheduled rest, hay & water provided",
    icon: Clock,
  },
  {
    status: "delivered",
    label: "Delivered",
    description: "Horse safely arrived at destination",
    icon: CheckCircle,
  },
];

function getStepState(
  stepIndex: number,
  currentIndex: number,
  isCancelled: boolean
): "complete" | "active" | "upcoming" | "cancelled" {
  if (isCancelled) return stepIndex <= currentIndex ? "cancelled" : "upcoming";
  if (stepIndex < currentIndex) return "complete";
  if (stepIndex === currentIndex) return "active";
  return "upcoming";
}

export function TransportTracker({
  currentStatus,
  carrierName,
  pickupLocation,
  deliveryLocation,
  pickupDate,
  estimatedDelivery,
}: {
  currentStatus: TransportStatus;
  carrierName: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  estimatedDelivery: string;
}) {
  const currentIndex = TRACKING_STEPS.findIndex(
    (s) => s.status === currentStatus
  );
  const isCancelled = currentStatus === "cancelled";

  return (
    <div className="rounded-lg border-0 bg-paper-white p-5 shadow-flat">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-forest" />
          <span className="text-sm font-medium text-ink-black">
            {carrierName}
          </span>
        </div>
        {isCancelled ? (
          <span className="flex items-center gap-1 rounded-full bg-red/10 px-2 py-0.5 text-xs font-medium text-red">
            <AlertCircle className="h-3 w-3" />
            Cancelled
          </span>
        ) : currentStatus === "delivered" ? (
          <span className="flex items-center gap-1 rounded-full bg-forest/10 px-2 py-0.5 text-xs font-medium text-forest">
            <CheckCircle className="h-3 w-3" />
            Delivered
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <Truck className="h-3 w-3" />
            In Progress
          </span>
        )}
      </div>

      {/* Route summary */}
      <div className="mb-4 flex items-center gap-2 text-sm text-ink-mid">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span>{pickupLocation}</span>
        <span className="text-ink-light">→</span>
        <span>{deliveryLocation}</span>
      </div>

      <div className="mb-4 flex gap-4 text-xs text-ink-light">
        <span>Pickup: {pickupDate}</span>
        <span>ETA: {estimatedDelivery}</span>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {TRACKING_STEPS.map((step, i) => {
          const state = getStepState(i, currentIndex, isCancelled);
          const Icon = step.icon;

          return (
            <div key={step.status} className="flex gap-3">
              {/* Line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    state === "complete"
                      ? "bg-forest text-paper-white"
                      : state === "active"
                        ? "bg-primary text-paper-white"
                        : state === "cancelled"
                          ? "bg-red/20 text-red"
                          : "bg-paper-warm text-ink-light"
                  }`}
                >
                  {state === "complete" ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : state === "cancelled" ? (
                    <AlertCircle className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </div>
                {i < TRACKING_STEPS.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 ${
                      state === "complete"
                        ? "bg-forest"
                        : state === "cancelled"
                          ? "bg-red/20"
                          : "bg-crease-light"
                    }`}
                    style={{ minHeight: "16px" }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-3">
                <p
                  className={`text-sm font-medium ${
                    state === "complete" || state === "active"
                      ? "text-ink-black"
                      : state === "cancelled"
                        ? "text-red"
                        : "text-ink-light"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-ink-light">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Route Cost Estimator ─── */

export function RouteCostEstimator() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [result, setResult] = useState<{
    distance: number;
    lowEstimate: number;
    highEstimate: number;
    transitDays: number;
  } | null>(null);

  function estimate() {
    // Simplified distance heuristic based on region keywords
    const regions: Record<string, [number, number]> = {
      // [lat-approx, lng-approx] — very rough
      fl: [28, -82], wellington: [26.6, -80.3], ocala: [29.1, -82.1],
      ky: [38, -85], lexington: [38, -84.5],
      va: [37.5, -79], middleburg: [39, -77.7],
      sc: [34, -81], aiken: [33.5, -81.7],
      ny: [43, -75], ca: [37, -120],
      tx: [31, -97], co: [39, -105],
    };

    const findCoord = (input: string): [number, number] | null => {
      const lower = input.toLowerCase().replace(/[^a-z ]/g, "");
      for (const [key, coord] of Object.entries(regions)) {
        if (lower.includes(key)) return coord;
      }
      return null;
    };

    const oCoord = findCoord(origin);
    const dCoord = findCoord(destination);

    if (!oCoord || !dCoord) {
      // Fallback: random reasonable estimate
      setResult({
        distance: 800,
        lowEstimate: 1200,
        highEstimate: 2800,
        transitDays: 2,
      });
      return;
    }

    // Haversine-ish rough distance in miles
    const dLat = Math.abs(oCoord[0] - dCoord[0]);
    const dLng = Math.abs(oCoord[1] - dCoord[1]);
    const miles = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 69);

    const low = Math.max(400, Math.round(miles * 1.5));
    const high = Math.max(800, Math.round(miles * 3.5));
    const days = Math.max(1, Math.ceil(miles / 500));

    setResult({
      distance: miles,
      lowEstimate: low,
      highEstimate: high,
      transitDays: days,
    });
  }

  return (
    <div className="rounded-lg border-0 bg-paper-white p-5 shadow-flat">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-primary" />
        <h3 className="font-heading text-sm font-semibold text-ink-black">
          Route Cost Estimator
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="route_origin" className="text-xs">
            From
          </Label>
          <Input
            id="route_origin"
            placeholder="e.g., Wellington, FL"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="route_dest" className="text-xs">
            To
          </Label>
          <Input
            id="route_dest"
            placeholder="e.g., Lexington, KY"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <Button
        size="sm"
        className="mt-3 w-full"
        onClick={estimate}
        disabled={!origin || !destination}
      >
        Estimate Cost
      </Button>

      {result && (
        <div className="mt-3 rounded-lg bg-paper-cream p-3">
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-lg font-bold text-ink-black">
              ${result.lowEstimate.toLocaleString()} – ${result.highEstimate.toLocaleString()}
            </span>
            <span className="text-xs text-ink-light">
              ~{result.distance} mi
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-mid">
            Estimated {result.transitDays} day{result.transitDays > 1 ? "s" : ""} transit
          </p>
          <p className="mt-1 text-[10px] text-ink-light">
            Actual pricing varies by carrier, season, and requirements.
          </p>
        </div>
      )}
    </div>
  );
}
