import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatCentsToDollars } from "@/lib/stripe/config";
import {
  HandCoins,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeftRight,
  Shield,
} from "lucide-react";

export const metadata: Metadata = { title: "Offers" };

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: { label: "Pending", color: "bg-gold/10 text-gold", icon: Clock },
  accepted: {
    label: "Accepted",
    color: "bg-forest/10 text-forest",
    icon: CheckCircle,
  },
  rejected: {
    label: "Declined",
    color: "bg-red/10 text-red",
    icon: XCircle,
  },
  countered: {
    label: "Countered",
    color: "bg-blue/10 text-blue",
    icon: ArrowLeftRight,
  },
  expired: {
    label: "Expired",
    color: "bg-ink-faint/10 text-ink-light",
    icon: Clock,
  },
  withdrawn: {
    label: "Withdrawn",
    color: "bg-ink-faint/10 text-ink-light",
    icon: XCircle,
  },
  in_escrow: {
    label: "In Escrow",
    color: "bg-forest/10 text-forest",
    icon: Shield,
  },
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
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-black">Offers</h1>
        <p className="mt-1 text-sm text-ink-mid">
          Manage offers you&apos;ve received and sent.
        </p>
      </div>

      {isEmpty ? (
        <div className="rounded-lg border-0 bg-paper-cream p-12 text-center shadow-flat">
          <HandCoins className="mx-auto h-10 w-10 text-ink-faint" />
          <h3 className="mt-4 font-medium text-ink-dark">No offers yet</h3>
          <p className="mt-1 text-sm text-ink-mid">
            When you make or receive an offer on a listing, it will appear here.
          </p>
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
  const StatusIcon = config.icon;

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
            <Badge variant="secondary" className={`shrink-0 text-xs ${config.color}`}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {config.label}
            </Badge>
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
