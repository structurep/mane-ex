import { getCollectionWithItems } from "@/actions/collections";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Globe,
  Link2,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { CollectionActions } from "./collection-actions";

interface CollectionDetailProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionDetailPage({
  params,
}: CollectionDetailProps) {
  const { slug } = await params;
  const { data: collection, error } = await getCollectionWithItems(slug);

  if (error || !collection) {
    notFound();
  }

  const items = (collection.items ?? []) as Array<{
    id: string;
    listing_id: string;
    price_at_added: number | null;
    price_change_cents: number | null;
    added_at: string;
    listing: Record<string, unknown> | null;
  }>;

  const visConfig: Record<string, { label: string; icon: React.ElementType }> = {
    private: { label: "Private", icon: Lock },
    shared: { label: "Shared", icon: Link2 },
    public: { label: "Public", icon: Globe },
  };
  const vis = visConfig[collection.visibility] ?? visConfig.private;
  const VisIcon = vis.icon;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/dream-barn"
        className="flex items-center gap-1 text-sm text-ink-mid hover:text-ink-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Dream Barn
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-semibold text-ink-black">
              {collection.name}
            </h1>
            <Badge variant="secondary" className="gap-1">
              <VisIcon className="h-3 w-3" />
              {vis.label}
            </Badge>
          </div>
          {typeof collection.description === "string" ? (
            <p className="mt-1 text-ink-mid">{collection.description}</p>
          ) : null}
          <p className="mt-1 text-sm text-ink-light">
            {items.length} {items.length === 1 ? "horse" : "horses"}
          </p>
        </div>
        <CollectionActions
          collectionId={collection.id}
          collectionSlug={collection.slug}
          visibility={collection.visibility}
        />
      </div>

      <div className="crease-divider" />

      {/* Items grid */}
      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 border-0 p-12 text-center shadow-flat">
          <p className="font-medium text-ink-black">No horses yet</p>
          <p className="mt-1 text-sm text-ink-mid">
            Save horses from the browse page to add them here.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/browse">Browse Horses</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const listing = item.listing;
            if (!listing) return null;

            const currentPrice = typeof listing.price === "number" ? listing.price : null;
            const priceChange = item.price_change_cents;

            return (
              <Card key={item.id} className="group overflow-hidden border-0 shadow-flat transition-elevation hover-lift hover:shadow-lifted">
                {/* Placeholder image area */}
                <div className="flex h-40 items-center justify-center bg-paper-cream">
                  <span className="text-sm text-crease-mid">No image</span>
                </div>

                <div className="space-y-2 p-4">
                  <Link
                    href={`/horses/${listing.slug}`}
                    className="font-heading font-medium text-ink-black group-hover:text-primary"
                  >
                    {String(listing.name)}
                  </Link>

                  <div className="flex flex-wrap gap-2 text-xs text-ink-mid">
                    {typeof listing.breed === "string" ? (
                      <span>{String(listing.breed)}</span>
                    ) : null}
                    {typeof listing.age_years === "number" ? (
                      <span>{listing.age_years}yo</span>
                    ) : null}
                    {typeof listing.height_hands === "number" ? (
                      <span>{listing.height_hands}hh</span>
                    ) : null}
                    {typeof listing.location_state === "string" ? (
                      <span>{String(listing.location_state)}</span>
                    ) : null}
                  </div>

                  {/* Price + change */}
                  <div className="flex items-center justify-between">
                    {currentPrice !== null ? (
                      <span className="font-serif font-medium text-ink-black">
                        ${(currentPrice / 100).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm text-ink-light">Contact for price</span>
                    )}

                    {priceChange !== null && priceChange !== 0 ? (
                      <span
                        className={`flex items-center gap-0.5 text-xs font-medium ${
                          priceChange < 0 ? "text-forest" : "text-red"
                        }`}
                      >
                        {priceChange < 0 ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : (
                          <TrendingUp className="h-3 w-3" />
                        )}
                        ${Math.abs(priceChange / 100).toLocaleString()}
                      </span>
                    ) : priceChange === 0 ? (
                      <span className="flex items-center gap-0.5 text-xs text-ink-light">
                        <Minus className="h-3 w-3" />
                        No change
                      </span>
                    ) : null}
                  </div>

                  {listing.status === "sold" && (
                    <Badge variant="secondary" className="bg-ink-light/10 text-ink-mid">
                      Sold
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
