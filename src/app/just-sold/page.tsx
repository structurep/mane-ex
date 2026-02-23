import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MapPin, Calendar, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Just Sold — ManeExchange",
  description:
    "See horses recently sold on ManeExchange. Real transactions, real trust.",
  openGraph: {
    title: "Just Sold — ManeExchange",
    description: "See horses recently sold on ManeExchange.",
  },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const days = Math.floor(diff / 86400000);

  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default async function JustSoldPage() {
  const supabase = await createClient();

  const { data: soldListings } = await supabase
    .from("horse_listings")
    .select(`
      id, name, slug, breed, gender, age_years, height_hands,
      price, location_city, location_state, updated_at,
      disciplines(name),
      seller:profiles!horse_listings_seller_id_fkey(display_name, avatar_url)
    `)
    .eq("status", "sold")
    .order("updated_at", { ascending: false })
    .limit(50);

  const listings = soldListings ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-red" />
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-black">
            Just Sold
          </h1>
        </div>
        <p className="mt-1 text-ink-mid">
          Recent sales on ManeExchange. Real transactions, real trust.
        </p>
      </div>

      {listings.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-ink-mid">No completed sales yet. Stay tuned!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const seller = listing.seller as unknown as Record<string, unknown> | null;
            const disciplines = (listing.disciplines as { name: string }[]) ?? [];

            return (
              <Card key={listing.id} className="overflow-hidden transition-shadow hover:shadow-folded">
                <div className="flex items-center gap-4 p-4">
                  {/* Sold badge */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red/10">
                    <span className="text-lg font-bold text-red">SOLD</span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/horses/${listing.slug}`}
                        className="truncate font-heading text-lg font-medium text-ink-black hover:text-accent-blue"
                      >
                        {listing.name}
                      </Link>
                      {disciplines.length > 0 && (
                        <Badge variant="secondary" className="shrink-0">
                          {disciplines[0].name}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink-mid">
                      {typeof listing.breed === "string" ? (
                        <span>{listing.breed}</span>
                      ) : null}
                      {typeof listing.age_years === "number" ? (
                        <span>{listing.age_years}yo</span>
                      ) : null}
                      {typeof listing.height_hands === "number" ? (
                        <span>{listing.height_hands}hh</span>
                      ) : null}
                      {typeof listing.gender === "string" ? (
                        <span className="capitalize">{listing.gender}</span>
                      ) : null}
                      {typeof listing.location_state === "string" ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {typeof listing.location_city === "string"
                            ? `${listing.location_city}, `
                            : ""}
                          {listing.location_state}
                        </span>
                      ) : null}
                    </div>

                    {seller && typeof seller.display_name === "string" ? (
                      <p className="mt-1 text-xs text-ink-light">
                        Sold by {String(seller.display_name)}
                      </p>
                    ) : null}
                  </div>

                  {/* Time + optional price */}
                  <div className="shrink-0 text-right">
                    <p className="flex items-center gap-1 text-xs text-ink-light">
                      <Calendar className="h-3 w-3" />
                      {timeAgo(listing.updated_at)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-8 text-xs text-ink-light">
        Sale prices are not displayed to protect buyer and seller privacy.
        All representations are made by the seller. ManeExchange is a marketplace
        that connects buyers and sellers and is not a party to any transaction.
      </p>
    </div>
  );
}
