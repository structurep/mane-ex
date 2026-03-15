import { getMyIsos, getIsoMatches } from "@/actions/isos";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/tailwind-plus";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { CloseIsoButton } from "./close-iso-button";

function formatPriceCents(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`;
}

import type { BadgeVariant } from "@/components/tailwind-plus";

const STATUS_STYLES: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: "Active", variant: "forest" },
  paused: { label: "Paused", variant: "yellow" },
  fulfilled: { label: "Fulfilled", variant: "blue" },
  expired: { label: "Expired", variant: "gray" },
  closed: { label: "Closed", variant: "gray" },
};

export default async function DashboardIsosPage() {
  const { data: isos } = await getMyIsos();
  const allIsos = (isos ?? []) as Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    min_price: number | null;
    max_price: number | null;
    min_height_hands: number | null;
    max_height_hands: number | null;
    gender: string[];
    breeds: string[];
    preferred_states: string[];
    level: string | null;
    match_count: number;
    created_at: string;
    expires_at: string;
  }>;

  const activeCount = allIsos.filter((i) => i.status === "active").length;

  // Fetch matches for active ISOs
  const matchesByIso: Record<string, Array<Record<string, unknown>>> = {};
  for (const iso of allIsos.filter((i) => i.status === "active" && i.match_count > 0)) {
    const { data } = await getIsoMatches(iso.id);
    if (data) {
      matchesByIso[iso.id] = data as Array<Record<string, unknown>>;
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
            My ISOs
          </h1>
          <p className="mt-1 text-ink-mid">
            Manage your &ldquo;In Search Of&rdquo; requests and view matched horses.
          </p>
        </div>
        <Button asChild>
          <Link href="/iso/new" className="gap-2">
            <Plus className="h-4 w-4" />
            New ISO
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 p-4 text-center shadow-flat">
          <p className="font-serif text-3xl font-bold text-ink-black">{allIsos.length}</p>
          <p className="mt-1 text-xs text-ink-light">Total ISOs</p>
        </Card>
        <Card className="border-0 p-4 text-center shadow-flat">
          <p className="font-serif text-3xl font-bold text-saddle">{activeCount}</p>
          <p className="mt-1 text-xs text-ink-light">Active</p>
        </Card>
        <Card className="border-0 p-4 text-center shadow-flat">
          <p className="font-serif text-3xl font-bold text-ink-black">
            {allIsos.reduce((sum, i) => sum + i.match_count, 0)}
          </p>
          <p className="mt-1 text-xs text-ink-light">Total Matches</p>
        </Card>
      </div>

      {/* ISO List */}
      {allIsos.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 border-0 p-12 text-center shadow-flat">
          <Search className="h-10 w-10 text-ink-faint" />
          <div>
            <p className="font-medium text-ink-black">No ISOs yet</p>
            <p className="mt-1 text-sm text-ink-mid">
              Post what you&apos;re looking for and sellers will match their horses.
            </p>
          </div>
          <Button asChild>
            <Link href="/iso/new">Post an ISO</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {allIsos.map((iso) => {
            const style = STATUS_STYLES[iso.status] ?? STATUS_STYLES.closed;
            const matches = matchesByIso[iso.id] ?? [];

            return (
              <Card key={iso.id} className="overflow-hidden border-0 shadow-flat">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-lg font-medium text-ink-black">
                          {iso.title}
                        </h3>
                        <StatusBadge variant={style.variant}>{style.label}</StatusBadge>
                      </div>
                      <p className="line-clamp-2 text-sm text-ink-mid">
                        {iso.description}
                      </p>

                      {/* Criteria summary */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(iso.min_price !== null || iso.max_price !== null) && (
                          <StatusBadge variant="gold" dot={false}>
                            {iso.min_price ? formatPriceCents(iso.min_price) : "Any"}
                            {" – "}
                            {iso.max_price ? formatPriceCents(iso.max_price) : "Any"}
                          </StatusBadge>
                        )}
                        {iso.gender.length > 0 && (
                          <StatusBadge variant="blue" dot={false}>
                            {iso.gender.map((g) => g.charAt(0).toUpperCase() + g.slice(1)).join(", ")}
                          </StatusBadge>
                        )}
                        {iso.breeds.length > 0 && (
                          <StatusBadge variant="blue" dot={false}>
                            {iso.breeds.join(", ")}
                          </StatusBadge>
                        )}
                        {iso.preferred_states.length > 0 && (
                          <StatusBadge variant="blue" dot={false}>
                            {iso.preferred_states.join(", ")}
                          </StatusBadge>
                        )}
                        {typeof iso.level === "string" && (
                          <StatusBadge variant="blue" dot={false}>
                            {iso.level}
                          </StatusBadge>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col items-end gap-2">
                      {iso.match_count > 0 && (
                        <StatusBadge variant="indigo" dot={false}>
                          {iso.match_count} match{iso.match_count !== 1 ? "es" : ""}
                        </StatusBadge>
                      )}
                      {iso.status === "active" && (
                        <CloseIsoButton isoId={iso.id} />
                      )}
                    </div>
                  </div>

                  {/* Matches section */}
                  {matches.length > 0 && (
                    <div className="mt-4 pt-4">
                      <div className="crease-divider mb-4" />
                      <p className="overline mb-3 text-ink-light">MATCHED HORSES</p>
                      <div className="space-y-2">
                        {matches.map((match) => {
                          const listing = match.listing as Record<string, unknown> | null;
                          const matcher = match.matcher as Record<string, unknown> | null;

                          return (
                            <div
                              key={String(match.id)}
                              className="flex items-center justify-between rounded-md border-0 bg-paper-cream p-3 shadow-flat"
                            >
                              <div className="space-y-0.5">
                                {listing ? (
                                  <Link
                                    href={`/horses/${String(listing.slug)}`}
                                    className="font-medium text-ink-black hover:text-blue"
                                  >
                                    {String(listing.name)}
                                  </Link>
                                ) : (
                                  <span className="text-ink-mid">Listing unavailable</span>
                                )}
                                <div className="flex items-center gap-3 text-xs text-ink-light">
                                  {listing && typeof listing.breed === "string" && (
                                    <span>{listing.breed}</span>
                                  )}
                                  {listing && typeof listing.price === "number" && (
                                    <span>{formatPriceCents(listing.price as number)}</span>
                                  )}
                                  {listing && typeof listing.location_state === "string" && (
                                    <span>{listing.location_state}</span>
                                  )}
                                </div>
                                {typeof match.message === "string" && (
                                  <p className="mt-1 text-xs text-ink-mid italic">
                                    &ldquo;{match.message}&rdquo;
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-ink-light">
                                {matcher && typeof matcher.display_name === "string" && (
                                  <span>from {matcher.display_name}</span>
                                )}
                                <MatchStatusIcon status={String(match.status)} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Browse link */}
      <div className="text-center">
        <Link
          href="/iso"
          className="text-sm text-ink-mid hover:text-ink-black"
        >
          Browse all ISOs &rarr;
        </Link>
      </div>
    </div>
  );
}

function MatchStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "interested":
      return <CheckCircle className="h-4 w-4 text-forest" />;
    case "dismissed":
      return <XCircle className="h-4 w-4 text-ink-light" />;
    default:
      return <Clock className="h-4 w-4 text-gold" />;
  }
}
