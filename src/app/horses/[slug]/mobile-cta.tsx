"use client";

import { Button } from "@/components/ui/button";
import { MessageSellerModal } from "@/components/message-seller-modal";
import { OfferModal } from "@/components/offer-modal";

type Props = {
  listingId: string;
  listingName: string;
  sellerId: string;
  sellerName: string;
  price: number | null;
  completenessScore: number;
  status: string;
};

export function MobileCTA({
  listingId,
  listingName,
  sellerId,
  sellerName,
  price,
  completenessScore,
  status,
}: Props) {
  const priceStr = price
    ? `$${(price / 100).toLocaleString()}`
    : "Contact for Price";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-paper-white p-3 md:hidden">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="font-serif text-lg font-bold text-ink-black">
            {priceStr}
          </p>
        </div>
        <MessageSellerModal
          sellerId={sellerId}
          sellerName={sellerName}
          listingId={listingId}
          listingName={listingName}
          trigger={
            <Button size="sm">
              Message
            </Button>
          }
        />
        {status === "active" && (
          <OfferModal
            listingId={listingId}
            listingName={listingName}
            listingPrice={price}
            completenessScore={completenessScore}
            trigger={
              <Button variant="outline" size="sm">
                Make Offer
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
