"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageSellerModal } from "@/components/messaging/message-seller-modal";
import { OfferModal } from "@/components/offers/offer-modal";
import { toggleFavorite } from "@/actions/listings";

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

  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await toggleFavorite(listingId);
      if (result.error) return;
      setSaved(result.favorited);
    });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-crease-light bg-paper-white p-3 shadow-hovering lg:hidden">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg font-bold text-ink-black">
            {priceStr}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label={saved ? "Remove from Dream Barn" : "Save to Dream Barn"}
          onClick={handleSave}
          disabled={isPending}
        >
          <Heart className={`h-5 w-5 ${saved ? "fill-coral text-coral" : ""}`} />
        </Button>
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
                Offer
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
