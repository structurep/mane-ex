"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteTour } from "@/actions/trials";
import Link from "next/link";
import {
  Route,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";

const TOUR_STATUS_COLORS: Record<string, string> = {
  planning: "bg-amber-100 text-amber-800",
  confirmed: "bg-forest/10 text-forest",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-ink-light/10 text-ink-mid",
  cancelled: "bg-red-100 text-red-800",
};

export function TourCard({ tour }: { tour: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const stops = (tour.stops as Record<string, unknown>[]) ?? [];
  const status = tour.status as string;

  async function handleDelete() {
    if (!confirm("Delete this tour? Trial requests will not be affected.")) return;
    setDeleting(true);
    await deleteTour(tour.id as string);
    setDeleting(false);
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        {/* Tour header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-ink-mid" />
              <h3 className="font-heading text-lg font-medium text-ink-black">
                {tour.name as string}
              </h3>
              <Badge className={TOUR_STATUS_COLORS[status]} variant="secondary">
                {status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-ink-mid">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(tour.tour_date as string).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>{stops.length} stop{stops.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-ink-light hover:text-red"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {typeof tour.notes === "string" ? (
          <p className="mt-2 text-sm text-ink-mid">{String(tour.notes)}</p>
        ) : null}

        {/* Stops list (expandable) */}
        {expanded && stops.length > 0 && (
          <div className="mt-4 space-y-3 border-t border-crease-light pt-4">
            <p className="overline text-ink-light">ITINERARY</p>
            {stops
              .sort(
                (a, b) =>
                  (a.stop_order as number) - (b.stop_order as number)
              )
              .map((stop, idx) => {
                const trial = stop.trial as Record<string, unknown> | null;
                const listing = trial?.listing as Record<string, unknown> | null;

                return (
                  <div
                    key={stop.id as string}
                    className="flex items-center gap-3 rounded-md bg-paper-cream p-3"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-black text-xs font-medium text-paper-white">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      {listing ? (
                        <Link
                          href={`/horses/${listing.slug}`}
                          className="font-medium text-ink-black hover:text-accent-blue"
                        >
                          {listing.name as string}
                        </Link>
                      ) : (
                        <span className="text-ink-mid">Listing unavailable</span>
                      )}
                      {typeof listing?.location_city === "string" ? (
                        <p className="flex items-center gap-1 text-xs text-ink-light">
                          <MapPin className="h-3 w-3" />
                          {String(listing.location_city)},{" "}
                          {String(listing.location_state)}
                        </p>
                      ) : null}
                    </div>
                    {typeof listing?.price === "number" ? (
                      <span className="text-sm font-medium text-ink-black">
                        ${(listing.price / 100).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                );
              })}
          </div>
        )}

        {expanded && stops.length === 0 && (
          <div className="mt-4 border-t border-crease-light pt-4 text-center">
            <p className="text-sm text-ink-light">
              No stops added yet. Confirm trial requests, then add them to this tour.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
