import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatCentsToDollars, calculatePlatformFee, calculateSellerNet, DISPUTE_WINDOW_DAYS } from "@/lib/stripe/config";
import {
  ChevronLeft,
  ArrowLeftRight,
  Shield,
} from "lucide-react";
import { OfferActions } from "./offer-actions";
import { InterstateChecklist } from "@/components/interstate-checklist";
import { BillOfSaleSection } from "./bill-of-sale-section";
import { TransactionTimeline } from "@/components/transaction-timeline";
import { EscrowMilestonePreview } from "@/components/smart-escrow";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = { title: "Offer Details" };

export default async function OfferDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch offer with joined data
  const { data: offer, error } = await supabase
    .from("offers")
    .select(
      `
      *,
      listing:horse_listings!listing_id(id, name, slug, price, breed, location_state, completeness_score, warranty, seller_state),
      buyer:profiles!buyer_id(id, display_name, avatar_url, location_state),
      seller:profiles!seller_id(id, display_name, avatar_url, stripe_onboarding_complete)
    `
    )
    .eq("id", id)
    .single();

  if (error || !offer) {
    notFound();
  }

  // Verify access
  if (offer.buyer_id !== user.id && offer.seller_id !== user.id) {
    notFound();
  }

  const isBuyer = offer.buyer_id === user.id;
  const isSeller = offer.seller_id === user.id;

  // Fetch escrow if exists
  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("*")
    .eq("offer_id", id)
    .maybeSingle();

  // Fetch counter-offers in chain
  const { data: counterOffers } = await supabase
    .from("offers")
    .select("*")
    .eq("parent_offer_id", id)
    .order("created_at", { ascending: true });

  const isInterstate =
    offer.buyer?.location_state &&
    offer.listing?.seller_state &&
    offer.buyer.location_state !== offer.listing.seller_state;

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard/offers"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-mid hover:text-ink-black"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to offers
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-ink-black">
                  {formatCentsToDollars(offer.amount_cents)}
                </h1>
                <p className="mt-1 text-ink-mid">
                  Offer on{" "}
                  <Link
                    href={`/horses/${offer.listing?.slug}`}
                    className="font-medium text-blue underline-offset-2 hover:underline"
                  >
                    {offer.listing?.name}
                  </Link>
                </p>
              </div>
              <OfferStatusBadge status={offer.status} />
            </div>

            <div className="mt-4 flex gap-6 text-sm text-ink-mid">
              <div>
                <p className="overline text-ink-light">
                  {isBuyer ? "SELLER" : "BUYER"}
                </p>
                <p className="font-medium text-ink-dark">
                  {isBuyer
                    ? offer.seller?.display_name
                    : offer.buyer?.display_name}
                </p>
              </div>
              <div>
                <p className="overline text-ink-light">SUBMITTED</p>
                <p className="font-medium text-ink-dark">
                  {new Date(offer.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="overline text-ink-light">PAYMENT</p>
                <p className="font-medium text-ink-dark">
                  {offer.payment_method === "ach"
                    ? "Bank Transfer"
                    : "Credit Card"}
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          {offer.message && (
            <div className="rounded-lg bg-paper-warm p-4">
              <p className="overline mb-2 text-ink-light">
                BUYER&apos;S MESSAGE
              </p>
              <p className="whitespace-pre-line text-sm text-ink-mid">
                {offer.message}
              </p>
            </div>
          )}

          {/* Counter-offer chain */}
          {counterOffers && counterOffers.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-ink-black">
                Negotiation History
              </h2>
              <div className="space-y-3">
                {counterOffers.map((co) => (
                  <div
                    key={co.id}
                    className="flex items-center justify-between rounded-md border-0 bg-paper-white p-3 shadow-flat"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight className="h-4 w-4 text-blue" />
                      <span className="text-sm text-ink-mid">
                        Counter-offer
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-ink-black">
                        {formatCentsToDollars(co.amount_cents)}
                      </p>
                      <p className="text-xs text-ink-light">
                        {new Date(co.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full transaction timeline — always visible */}
          <TransactionTimeline
            offerStatus={offer.status}
            escrowStatus={escrow?.status}
            createdAt={offer.created_at}
            respondedAt={offer.responded_at}
            deliveryConfirmedAt={escrow?.delivery_confirmed_at}
            autoReleaseAt={escrow?.auto_release_at}
            disputeOpenedAt={escrow?.dispute_opened_at}
            disputeReason={escrow?.dispute_reason}
            shippingTracking={escrow?.shipping_tracking}
            expectedDeliveryDate={escrow?.expected_delivery_date}
            isBuyer={isBuyer}
          />

          {/* Interstate transport checklist */}
          {isInterstate && escrow && (
            <InterstateChecklist
              sellerState={offer.listing?.seller_state ?? ""}
              buyerState={offer.buyer?.location_state ?? ""}
            />
          )}

          {/* Bill of Sale */}
          {escrow && escrow.status !== "awaiting_payment" && escrow.status !== "payment_processing" && (
            <BillOfSaleSection
              escrowId={escrow.id}
              billOfSaleData={escrow.bill_of_sale_data}
              isBuyer={isBuyer}
            />
          )}

          {/* Actions */}
          <OfferActions
            offerId={offer.id}
            offerStatus={offer.status}
            escrowId={escrow?.id}
            escrowStatus={escrow?.status}
            isBuyer={isBuyer}
            isSeller={isSeller}
            sellerStripeReady={offer.seller?.stripe_onboarding_complete ?? false}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            {/* Listing card */}
            <div className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat">
              <div className="mb-3 aspect-[4/3] rounded-md bg-paper-warm" />
              <p className="font-medium text-ink-black">
                {offer.listing?.name}
              </p>
              <p className="text-sm text-ink-mid">
                {[offer.listing?.breed, offer.listing?.location_state]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {offer.listing?.price && (
                <p className="mt-1 text-sm text-ink-light">
                  Listed at {formatCentsToDollars(offer.listing.price)}
                </p>
              )}
            </div>

            {/* Fee breakdown */}
            <div className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat">
              <p className="overline mb-3 text-ink-light">TRANSACTION SUMMARY</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-mid">Offer amount</span>
                  <span className="font-medium text-ink-black">
                    {formatCentsToDollars(offer.amount_cents)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-mid">Platform fee</span>
                  <span className="text-ink-mid">
                    {formatCentsToDollars(
                      calculatePlatformFee(offer.amount_cents)
                    )}
                  </span>
                </div>
                <div className="crease-divider" />
                <div className="flex justify-between">
                  <span className="font-medium text-ink-dark">
                    Seller receives
                  </span>
                  <span className="font-bold text-ink-black">
                    {formatCentsToDollars(
                      calculateSellerNet(offer.amount_cents)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* ManeVault badge */}
            <div className="rounded-lg border-0 bg-paper-warm p-4 shadow-flat">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-forest" />
                <span className="text-sm font-medium text-ink-dark">
                  ManeVault Protected
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-mid">
                Funds held in escrow. 5-day inspection period.{" "}
                {DISPUTE_WINDOW_DAYS}-day dispute window after delivery.
              </p>

              {/* Smart Escrow Milestones */}
              {escrow && (
                <div className="mt-3 border-t border-crease-light pt-3">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-light">
                    Escrow Milestones
                  </p>
                  <EscrowMilestonePreview />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfferStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-gold/10 text-gold" },
    accepted: { label: "Accepted", className: "bg-forest/10 text-forest" },
    rejected: { label: "Declined", className: "bg-red/10 text-red" },
    countered: { label: "Countered", className: "bg-blue/10 text-blue" },
    expired: { label: "Expired", className: "bg-ink-faint/10 text-ink-light" },
    withdrawn: { label: "Withdrawn", className: "bg-ink-faint/10 text-ink-light" },
    in_escrow: { label: "In Escrow", className: "bg-forest/10 text-forest" },
  };
  const c = configs[status] ?? configs.pending;
  return (
    <Badge variant="secondary" className={c.className}>
      {c.label}
    </Badge>
  );
}

