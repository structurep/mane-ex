import { getAdminListings } from "@/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, EmptyState, type BadgeVariant } from "@/components/tailwind-plus";
import Link from "next/link";
import { List } from "lucide-react";
import { ModerationButtons } from "./moderation-buttons";

const statusVariants: Record<string, BadgeVariant> = {
  active: "forest",
  draft: "yellow",
  pending_review: "gold",
  sold: "gray",
  archived: "gray",
};

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const activeFilter = (filter === "reported" || filter === "pending_review") ? filter : "all";
  const listings = await getAdminListings(activeFilter as "all" | "reported" | "pending_review");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
          Listing Moderation
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          {listings.length} listings
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Link
          href="/admin/listings"
          className={`rounded-md px-3 py-1.5 text-sm ${
            activeFilter === "all"
              ? "bg-paddock text-white"
              : "bg-paper-warm text-ink-mid hover:text-ink-black"
          }`}
        >
          All
        </Link>
        <Link
          href="/admin/listings?filter=pending_review"
          className={`rounded-md px-3 py-1.5 text-sm ${
            activeFilter === "pending_review"
              ? "bg-paddock text-white"
              : "bg-paper-warm text-ink-mid hover:text-ink-black"
          }`}
        >
          Pending Review
        </Link>
        <Link
          href="/admin/listings?filter=reported"
          className={`rounded-md px-3 py-1.5 text-sm ${
            activeFilter === "reported"
              ? "bg-paddock text-white"
              : "bg-paper-warm text-ink-mid hover:text-ink-black"
          }`}
        >
          Reported
        </Link>
      </div>

      {/* Listing list */}
      <div className="space-y-3">
        {listings.map(
          (listing: {
            id: string;
            name: string;
            slug: string;
            status: string;
            price: number | null;
            created_at: string;
            moderation_note: string | null;
            moderated_at: string | null;
          }) => (
            <Card key={listing.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/horses/${listing.slug}`}
                      className="text-sm font-medium text-ink-black hover:underline"
                    >
                      {listing.name}
                    </Link>
                    <StatusBadge variant={statusVariants[listing.status] || "gray"}>
                      {listing.status}
                    </StatusBadge>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-light">
                    {listing.price
                      ? `$${listing.price.toLocaleString()}`
                      : "No price"}{" "}
                    &middot;{" "}
                    {new Date(listing.created_at).toLocaleDateString()}
                  </p>
                  {listing.moderation_note && (
                    <p className="mt-1 text-xs text-gold">
                      Note: {listing.moderation_note}
                    </p>
                  )}
                </div>

                <ModerationButtons
                  listingId={listing.id}
                  status={listing.status}
                />
              </CardContent>
            </Card>
          )
        )}

        {listings.length === 0 && (
          <EmptyState
            icon={<List className="size-10" />}
            title="No listings found"
            description={activeFilter === "reported" ? "No reported listings to review." : "There are no listings in the system yet."}
          />
        )}
      </div>
    </div>
  );
}
