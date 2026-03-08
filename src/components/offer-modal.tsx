"use client";

import { useState, useActionState, useEffect } from "react";
import { createOffer } from "@/actions/offers";
import type { OfferActionState } from "@/actions/offers";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Shield,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  shouldDefaultToACH,
  formatCentsToDollars,
} from "@/lib/stripe/config";

type OfferModalProps = {
  listingId: string;
  listingName: string;
  listingPrice: number | null;
  completenessScore: number;
  trigger?: React.ReactNode;
};

const initialState: OfferActionState = {};

export function OfferModal({
  listingId,
  listingName,
  listingPrice,
  completenessScore,
  trigger,
}: OfferModalProps) {
  const [open, setOpen] = useState(false);
  const [amountDollars, setAmountDollars] = useState(
    listingPrice ? String(listingPrice / 100) : ""
  );
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"ach" | "card">("ach");
  const [state, formAction, isPending] = useActionState(
    createOffer,
    initialState
  );

  const amountCents = Math.round(Number(amountDollars) * 100) || 0;
  const useACH = shouldDefaultToACH(amountCents);

  function handleAmountChange(value: string) {
    setAmountDollars(value);
    const cents = Math.round(Number(value) * 100) || 0;
    if (shouldDefaultToACH(cents)) {
      setPaymentMethod("ach");
    }
  }

  // Toast + redirect on success
  useEffect(() => {
    if (state.offerId) {
      toast.success("Offer submitted", {
        description: "The seller has been notified.",
      });
      const timer = setTimeout(() => {
        setOpen(false);
        window.location.href = `/dashboard/offers/${state.offerId}`;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.offerId]);

  // Toast on error
  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setAmountDollars(listingPrice ? String(listingPrice / 100) : "");
      setMessage("");
    }
    setOpen(nextOpen);
  }

  const tooLowScore = completenessScore < 50;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="lg" className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            Make an Offer
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-paper-cream sm:max-w-md animate-fade-up">
        {state.offerId ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-forest/10">
              <CheckCircle className="size-6 text-forest" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-ink-black">
                Offer submitted
              </p>
              <p className="text-sm text-ink-mid">
                The seller will be notified. You&apos;ll receive updates in your
                dashboard.
              </p>
            </div>
          </div>
        ) : tooLowScore ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-gold/10">
              <Info className="size-6 text-gold" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-ink-black">
                Not enough documentation
              </p>
              <p className="text-sm text-ink-mid">
                This listing needs a completeness score of at least 50 before
                offers can be made. Ask the seller to add more details.
              </p>
            </div>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </DialogClose>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-ink-black">
                Make an Offer
              </DialogTitle>
              <DialogDescription className="text-ink-mid">
                {listingName}
                {listingPrice
                  ? ` — Listed at ${formatCentsToDollars(listingPrice)}`
                  : ""}
              </DialogDescription>
            </DialogHeader>

            {state.error && (
              <div className="flex items-start gap-2 rounded-md border border-red/20 bg-red-light px-3 py-2.5 text-sm text-red">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-5">
              <input type="hidden" name="listing_id" value={listingId} />
              <input type="hidden" name="amount_cents" value={amountCents} />
              <input
                type="hidden"
                name="payment_method"
                value={paymentMethod}
              />

              {/* Offer amount */}
              <div className="space-y-2">
                <Label htmlFor="offer-amount" className="text-ink-black">
                  Your offer
                </Label>
                {state.fieldErrors?.amount_cents && (
                  <p className="text-xs text-red">
                    {state.fieldErrors.amount_cents}
                  </p>
                )}
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-light" />
                  <Input
                    id="offer-amount"
                    type="number"
                    min="1"
                    step="1"
                    value={amountDollars}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="bg-paper-white pl-9"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <Label className="text-ink-black">Payment method</Label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex cursor-pointer flex-col items-center rounded-md border px-3 py-3 text-center text-sm transition-colors ${
                      paymentMethod === "ach"
                        ? "border-ink-black bg-paper-white text-ink-black font-medium"
                        : "border-crease-light bg-paper-white/60 text-ink-mid hover:border-ink-light"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_radio"
                      value="ach"
                      checked={paymentMethod === "ach"}
                      onChange={() => setPaymentMethod("ach")}
                      className="sr-only"
                    />
                    <span>Bank Transfer</span>
                    <span className="mt-0.5 text-xs text-ink-light">
                      $5 max fee
                    </span>
                  </label>
                  <label
                    className={`flex cursor-pointer flex-col items-center rounded-md border px-3 py-3 text-center text-sm transition-colors ${
                      paymentMethod === "card"
                        ? "border-ink-black bg-paper-white text-ink-black font-medium"
                        : "border-crease-light bg-paper-white/60 text-ink-mid hover:border-ink-light"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_radio"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="sr-only"
                    />
                    <span>Credit Card</span>
                    <span className="mt-0.5 text-xs text-ink-light">
                      2.9% + $0.30
                    </span>
                  </label>
                </div>
                {useACH && paymentMethod === "card" && (
                  <p className="text-xs text-gold">
                    Bank transfer recommended for transactions over $5,000 —
                    saves significantly on processing fees.
                  </p>
                )}
              </div>

              {/* Optional message */}
              <div className="space-y-2">
                <Label htmlFor="offer-message" className="text-ink-black">
                  Message to seller{" "}
                  <span className="font-normal text-ink-light">(optional)</span>
                </Label>
                <Textarea
                  id="offer-message"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the seller about yourself and why you're interested..."
                  maxLength={2000}
                  rows={3}
                  className="bg-paper-white resize-none"
                />
              </div>

              {/* ManeVault trust badge */}
              <div className="flex items-start gap-2 rounded-md bg-paper-warm p-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                <p className="text-xs text-ink-mid">
                  <span className="font-medium text-ink-dark">
                    ManeVault Protected.
                  </span>{" "}
                  Funds are held in secure escrow until you receive and inspect
                  the horse. 5-day inspection period included.
                </p>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isPending || !amountCents}
                >
                  {isPending ? "Submitting..." : "Submit Offer"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
