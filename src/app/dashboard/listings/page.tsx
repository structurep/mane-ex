import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Heart, ClipboardList } from "lucide-react";
import type { ListingStatus } from "@/types/listings";
import { DeleteListingButton } from "@/components/delete-listing-button";

export const metadata: Metadata = {
  title: "My Listings",
};

const statusConfig: Record<
  ListingStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  active: { label: "Active", variant: "default" },
  draft: { label: "Draft", variant: "secondary" },
  pending_review: { label: "Pending Review", variant: "outline" },
  under_offer: { label: "Under Offer", variant: "outline" },
  sold: { label: "Sold", variant: "secondary" },
  expired: { label: "Expired", variant: "destructive" },
  removed: { label: "Removed", variant: "destructive" },
};

export default async function MyListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: listings } = await supabase
    .from("horse_listings")
    .select(
      "id, name, slug, status, price, breed, location_state, view_count, favorite_count, created_at, media:listing_media(url, is_primary)"
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const allListings = (listings ?? []) as Array<
    Record<string, unknown> & {
      media?: Array<{ url: string; is_primary: boolean }>;
    }
  >;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
            My Listings
          </h1>
          <p className="mt-1 text-sm text-ink-mid">
            {allListings.length} listing{allListings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Link>
        </Button>
      </div>

      {allListings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border-0 bg-paper-cream p-12 text-center shadow-flat">
          <ClipboardList className="h-10 w-10 text-ink-faint" />
          <div>
            <p className="font-medium text-ink-black">No listings yet</p>
            <p className="mt-1 text-sm text-ink-mid">
              Create your first listing to start attracting buyers.
            </p>
          </div>
          <Button className="mt-2" asChild>
            <Link href="/dashboard/listings/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Listing
            </Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-crease-light rounded-lg border-0 bg-paper-cream shadow-flat">
          {allListings.map((listing) => {
            const config =
              statusConfig[listing.status as ListingStatus];
            const price =
              typeof listing.price === "number"
                ? `$${(listing.price as number / 100).toLocaleString()}`
                : "No price";

            return (
              <div
                key={String(listing.id)}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-paper-warm"
              >
                <Link
                  href={`/horses/${String(listing.slug)}`}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate font-medium text-ink-dark hover:text-primary">
                    {String(listing.name)}
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-ink-mid">
                    <span>{price}</span>
                    {typeof listing.breed === "string" && (
                      <span>&middot; {listing.breed}</span>
                    )}
                    {typeof listing.location_state === "string" && (
                      <span>&middot; {listing.location_state}</span>
                    )}
                    <span>
                      &middot;{" "}
                      {new Date(
                        listing.created_at as string
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </Link>

                <div className="flex items-center gap-4 text-xs text-ink-mid">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {((listing.view_count as number) || 0).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {((listing.favorite_count as number) || 0).toLocaleString()}
                  </span>
                  <Badge variant={config?.variant || "secondary"}>
                    {config?.label || String(listing.status)}
                  </Badge>
                  {listing.status !== "sold" &&
                    listing.status !== "removed" && (
                      <DeleteListingButton
                        listingId={String(listing.id)}
                        listingName={String(listing.name)}
                      />
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
