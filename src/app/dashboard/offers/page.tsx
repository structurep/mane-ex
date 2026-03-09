import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCentsToDollars } from "@/lib/stripe/config";
import {
  HandCoins,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeftRight,
  Shield,
} from "lucide-react";
import { StatusBadge, EmptyState } from "@/components/tailwind-plus";

export const metadata: Metadata = { title: "Offers" };

type BadgeVariant = "gray" | "green" | "red" | "yellow" | "blue" | "forest";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: BadgeVariant; icon: React.ElementType }
> = {
  pending: { label: "Pending", variant: "yellow", icon: Clock },
  accepted: { label: "Accepted", variant: "green", icon: CheckCircle },
  rejected: { label: "Declined", variant: "red", icon: XCircle },
  countered: { label: "Countered", variant: "blue", icon: ArrowLeftRight },
  expired: { label: "Expired", variant: "gray", icon: Clock },
  withdrawn: { label: "Withdrawn", variant: "gray", icon: XCircle },
  in_escrow: { label: "In Escrow", variant: "forest", icon: Shield },
};

export default async function OffersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch received offers (as seller)
  const { data: receivedOffers } = await supabase
    .from("offers")
    .select(
      `
      *,
      listing:horse_listings!listing_id(id, name, slug, price),
      buyer:profiles!buyer_id(id, display_name, avatar_url)
    `
    )
    .eq("seller_id", user.id)
    .is("parent_offer_id", null)
    .order("created_at", { ascending: false });

  // Fetch sent offers (as buyer)
  const { data: sentOffers } = await supabase
    .from("offers")
    .select(
      `
      *,
      listing:horse_listings!listing_id(id, name, slug, price),
      seller:profiles!seller_id(id, display_name, avatar_url)
    `
    )
    .eq("buyer_id", user.id)
    .is("parent_offer_id", null)
    .order("created_at", { ascending: false });

  const received = receivedOffers ?? [];
  const sent = sentOffers ?? [];
  const isEmpty = received.length === 0 && sent.length === 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">Offers</h1>
        <p className="mt-1 text-sm text-ink-mid">
          Manage offers you&apos;ve received and sent.
        </p>
      </div>

      {isEmpty ? (
        <div className="rounded-lg border-0 bg-paper-cream shadow-flat">
          <EmptyState
            icon={<HandCoins className="size-10" />}
            title="No offers yet"
            description="When you make or receive an offer on a listing, it will appear here."
            actionLabel="Browse Listings"
            actionHref="/browse"
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Received offers */}
          {received.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-ink-black">
                Received
                <span className="ml-2 text-sm font-normal text-ink-light">
                  ({received.length})
                </span>
              </h2>
              <div className="space-y-3">
                {received.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    otherParty={offer.buyer}
                    otherPartyLabel="From"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Sent offers */}
          {sent.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-ink-black">
                Sent
                <span className="ml-2 text-sm font-normal text-ink-light">
                  ({sent.length})
                </span>
              </h2>
              <div className="space-y-3">
                {sent.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    otherParty={offer.seller}
                    otherPartyLabel="To"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function OfferCard({
  offer,
  otherParty,
  otherPartyLabel,
}: {
  offer: { id: string; status: string; amount_cents: number; created_at: string; message?: string | null; listing?: { name?: string } | null };
  otherParty: { display_name?: string | null } | null;
  otherPartyLabel: string;
}) {
  const config = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.pending;

  return (
    <Link
      href={`/dashboard/offers/${offer.id}`}
      className="block rounded-lg border-0 bg-paper-cream p-4 shadow-flat transition-elevation hover-lift hover:shadow-lifted"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-ink-black">
              {offer.listing?.name ?? "Unknown listing"}
            </p>
            <StatusBadge label={config.label} variant={config.variant} />
          </div>
          <p className="mt-1 text-sm text-ink-mid">
            {otherPartyLabel}{" "}
            <span className="font-medium text-ink-dark">
              {otherParty?.display_name ?? "Unknown"}
            </span>
          </p>
          {offer.message && (
            <p className="mt-1 truncate text-sm text-ink-light">
              &ldquo;{offer.message}&rdquo;
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-serif text-lg font-bold text-ink-black">
            {formatCentsToDollars(offer.amount_cents)}
          </p>
          <p className="text-xs text-ink-light">
            {new Date(offer.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
