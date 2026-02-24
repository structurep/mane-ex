import { getAdminListings } from "@/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ModerationButtons } from "./moderation-buttons";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  sold: "bg-blue-100 text-blue-700",
  archived: "bg-gray-100 text-gray-600",
};

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const activeFilter = filter === "reported" ? "reported" : "all";
  const listings = await getAdminListings(activeFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-black">
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
              ? "bg-ink-black text-white"
              : "bg-paper-warm text-ink-mid hover:text-ink-black"
          }`}
        >
          All
        </Link>
        <Link
          href="/admin/listings?filter=reported"
          className={`rounded-md px-3 py-1.5 text-sm ${
            activeFilter === "reported"
              ? "bg-ink-black text-white"
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
                    <Badge className={statusColors[listing.status] || ""}>
                      {listing.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-light">
                    {listing.price
                      ? `$${listing.price.toLocaleString()}`
                      : "No price"}{" "}
                    &middot;{" "}
                    {new Date(listing.created_at).toLocaleDateString()}
                  </p>
                  {listing.moderation_note && (
                    <p className="mt-1 text-xs text-amber-600">
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
          <p className="py-8 text-center text-sm text-ink-mid">
            No listings found.
          </p>
        )}
      </div>
    </div>
  );
}
