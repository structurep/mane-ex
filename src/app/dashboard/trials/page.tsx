import { getMyTrials, getMyTours } from "@/actions/trials";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/tailwind-plus";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  Route,
} from "lucide-react";
import { TrialActions } from "./trial-actions";
import { TourCard } from "./tour-card";

import type { BadgeVariant } from "@/components/tailwind-plus";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: BadgeVariant }
> = {
  requested: { label: "Requested", variant: "yellow" },
  confirmed: { label: "Confirmed", variant: "forest" },
  rescheduled: { label: "Rescheduled", variant: "gray" },
  completed: { label: "Completed", variant: "gray" },
  cancelled: { label: "Cancelled", variant: "red" },
  no_show: { label: "No Show", variant: "red" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function TrialsPage() {
  const [trialsResult, toursResult] = await Promise.all([
    getMyTrials(),
    getMyTours(),
  ]);

  const trials = trialsResult.data ?? [];
  const tours = toursResult.data ?? [];

  const upcomingTrials = trials.filter((t: { status: string }) =>
    ["requested", "confirmed", "rescheduled"].includes(t.status)
  );
  const pastTrials = trials.filter((t: { status: string }) =>
    ["completed", "cancelled", "no_show"].includes(t.status)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
          Trials & Tours
        </h1>
        <p className="mt-1 text-ink-mid">
          Schedule trial visits and plan multi-barn tours.
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingTrials.length})
          </TabsTrigger>
          <TabsTrigger value="tours">
            Tours ({tours.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastTrials.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Trials */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingTrials.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 border-0 p-12 text-center shadow-flat">
              <Calendar className="h-10 w-10 text-ink-faint" />
              <div>
                <p className="font-medium text-ink-black">No upcoming trials</p>
                <p className="mt-1 text-sm text-ink-mid">
                  Request a trial from any listing to schedule a visit.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/browse">Browse Horses</Link>
              </Button>
            </Card>
          ) : (
            upcomingTrials.map((trial: Record<string, unknown>) => (
              <TrialCard key={trial.id as string} trial={trial} showActions />
            ))
          )}
        </TabsContent>

        {/* Tours */}
        <TabsContent value="tours" className="space-y-4">
          {tours.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 border-0 p-12 text-center shadow-flat">
              <Route className="h-10 w-10 text-ink-faint" />
              <div>
                <p className="font-medium text-ink-black">No tours planned</p>
                <p className="mt-1 text-sm text-ink-mid">
                  Group confirmed trials into a tour itinerary for efficient barn visits.
                </p>
              </div>
            </Card>
          ) : (
            tours.map((tour: Record<string, unknown>) => (
              <TourCard key={tour.id as string} tour={tour} />
            ))
          )}
        </TabsContent>

        {/* Past Trials */}
        <TabsContent value="past" className="space-y-4">
          {pastTrials.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 border-0 p-12 text-center shadow-flat">
              <Clock className="h-10 w-10 text-ink-faint" />
              <div>
                <p className="font-medium text-ink-black">No past trials</p>
                <p className="mt-1 text-sm text-ink-mid">
                  Once you complete a trial visit, it&apos;ll show up here for your records.
                </p>
              </div>
            </Card>
          ) : (
            pastTrials.map((trial: Record<string, unknown>) => (
              <TrialCard key={trial.id as string} trial={trial} showActions={false} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TrialCard({
  trial,
  showActions,
}: {
  trial: Record<string, unknown>;
  showActions: boolean;
}) {
  const listing = trial.listing as Record<string, unknown> | null;
  const seller = trial.seller as Record<string, unknown> | null;
  const status = trial.status as string;
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.requested;

  const displayDate =
    (trial.confirmed_date as string) || (trial.preferred_date as string);

  return (
    <Card className="overflow-hidden border-0 shadow-flat">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: listing + date info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <StatusBadge variant={config.variant}>
              {config.label}
            </StatusBadge>
            {listing && (
              <Link
                href={`/horses/${listing.slug}`}
                className="font-heading text-lg font-medium text-ink-black hover:text-primary"
              >
                {listing.name as string}
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-ink-mid">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(displayDate)}
              {displayDate.includes("T") && ` at ${formatTime(displayDate)}`}
            </span>
            {typeof listing?.location_city === "string" ? (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {String(listing.location_city)}, {String(listing.location_state)}
              </span>
            ) : null}
            {typeof listing?.breed === "string" ? (
              <span>{String(listing.breed)}</span>
            ) : null}
            {typeof listing?.price === "number" ? (
              <span className="font-serif font-medium text-ink-black">
                ${(listing.price / 100).toLocaleString()}
              </span>
            ) : null}
          </div>

          {typeof trial.buyer_notes === "string" ? (
            <p className="text-sm text-ink-mid">
              <span className="font-medium">Your notes:</span>{" "}
              {String(trial.buyer_notes)}
            </p>
          ) : null}

          {typeof trial.seller_notes === "string" ? (
            <p className="text-sm text-ink-mid">
              <span className="font-medium">Seller notes:</span>{" "}
              {String(trial.seller_notes)}
            </p>
          ) : null}

          {typeof trial.alternate_date === "string" && status === "requested" ? (
            <p className="text-xs text-ink-light">
              Alternate date: {formatDate(trial.alternate_date)}
            </p>
          ) : null}
        </div>

        {/* Right: seller info + actions */}
        <div className="flex flex-col items-end gap-3">
          {seller && (
            <div className="text-right text-sm">
              <p className="font-medium text-ink-black">
                {seller.display_name as string}
              </p>
              {typeof seller.phone === "string" ? (
                <p className="text-ink-light">{String(seller.phone)}</p>
              ) : null}
            </div>
          )}

          {showActions && (
            <TrialActions
              trialId={trial.id as string}
              status={status}
              isSeller={false}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
