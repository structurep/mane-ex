"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  acceptOffer,
  rejectOffer,
  withdrawOffer,
  counterOffer,
} from "@/actions/offers";
import { initiateEscrow, confirmDelivery, openDispute } from "@/actions/escrow";
import type { OfferActionState } from "@/actions/offers";
import type { EscrowActionState } from "@/actions/escrow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  ArrowLeftRight,
  DollarSign,
  Truck,
  AlertTriangle,
  Shield,
} from "lucide-react";

type OfferActionsProps = {
  offerId: string;
  offerStatus: string;
  escrowId?: string;
  escrowStatus?: string;
  isBuyer: boolean;
  isSeller: boolean;
  sellerStripeReady: boolean;
};

export function OfferActions({
  offerId,
  offerStatus,
  escrowId,
  escrowStatus,
  isBuyer,
  isSeller,
  sellerStripeReady,
}: OfferActionsProps) {
  const router = useRouter();
  const [showCounter, setShowCounter] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(
    actionName: string,
    action: () => Promise<{ error?: string; success?: boolean }>
  ) {
    setLoading(actionName);
    setError(null);
    const result = await action();
    setLoading(null);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red/20 bg-red-light px-3 py-2.5 text-sm text-red">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Seller actions on pending offer */}
      {isSeller && offerStatus === "pending" && (
        <div className="rounded-lg border border-border bg-paper-cream p-4">
          <p className="mb-3 font-medium text-ink-dark">Respond to this offer</p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() =>
                handleAction("accept", () => acceptOffer(offerId))
              }
              disabled={loading !== null}
              className="gap-1.5"
            >
              <CheckCircle className="h-4 w-4" />
              {loading === "accept" ? "Accepting..." : "Accept"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCounter(!showCounter)}
              disabled={loading !== null}
              className="gap-1.5"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Counter
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                handleAction("reject", () => rejectOffer(offerId))
              }
              disabled={loading !== null}
              className="gap-1.5 text-ink-mid"
            >
              <XCircle className="h-4 w-4" />
              {loading === "reject" ? "Declining..." : "Decline"}
            </Button>
          </div>

          {/* Counter-offer form */}
          {showCounter && (
            <CounterOfferForm
              offerId={offerId}
              onDone={() => {
                setShowCounter(false);
                router.refresh();
              }}
            />
          )}
        </div>
      )}

      {/* Buyer: withdraw pending offer */}
      {isBuyer && offerStatus === "pending" && (
        <Button
          variant="ghost"
          onClick={() =>
            handleAction("withdraw", () => withdrawOffer(offerId))
          }
          disabled={loading !== null}
          className="gap-1.5 text-ink-mid"
        >
          <XCircle className="h-4 w-4" />
          {loading === "withdraw" ? "Withdrawing..." : "Withdraw Offer"}
        </Button>
      )}

      {/* Buyer: initiate escrow after acceptance */}
      {isBuyer && offerStatus === "accepted" && !escrowId && (
        <div className="rounded-lg border border-forest/30 bg-forest/5 p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-forest" />
            <span className="font-medium text-ink-dark">
              Offer accepted — proceed to payment
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-mid">
            Your funds will be held securely in ManeVault escrow until you
            receive and inspect the horse.
          </p>
          {!sellerStripeReady ? (
            <p className="mt-2 text-sm text-gold">
              The seller needs to complete their payment setup before you can
              proceed. They have been notified.
            </p>
          ) : (
            <Button
              onClick={() =>
                handleAction("escrow", async () => {
                  const result = await initiateEscrow(offerId);
                  if (result.error) return result;
                  router.refresh();
                  return { success: true };
                })
              }
              disabled={loading !== null}
              className="mt-3 gap-1.5"
            >
              <DollarSign className="h-4 w-4" />
              {loading === "escrow" ? "Processing..." : "Proceed to Payment"}
            </Button>
          )}
        </div>
      )}

      {/* Buyer: confirm delivery */}
      {isBuyer && escrowStatus === "funds_held" && (
        <div className="rounded-lg border border-border bg-paper-cream p-4">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue" />
            <span className="font-medium text-ink-dark">
              Has the horse been delivered?
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-mid">
            Confirming delivery starts a 14-day review period. You can open a
            dispute during this time if there are issues.
          </p>
          <form
            action={async (formData) => {
              setLoading("delivery");
              setError(null);
              const result = await confirmDelivery({}, formData);
              setLoading(null);
              if (result.error) {
                setError(result.error);
              } else {
                router.refresh();
              }
            }}
            className="mt-3"
          >
            <input type="hidden" name="escrow_id" value={escrowId} />
            <label className="flex items-start gap-2 text-sm text-ink-mid">
              <input
                type="checkbox"
                name="inspection_acknowledged"
                value="true"
                className="mt-1 rounded"
                required
              />
              I understand I have a 5-day inspection period and 14-day dispute
              window after confirming delivery.
            </label>
            <Button
              type="submit"
              disabled={loading !== null}
              className="mt-3 gap-1.5"
            >
              <CheckCircle className="h-4 w-4" />
              {loading === "delivery"
                ? "Confirming..."
                : "Confirm Delivery"}
            </Button>
          </form>
        </div>
      )}

      {/* Buyer: open dispute */}
      {isBuyer && escrowStatus === "delivery_confirmed" && (
        <div className="rounded-lg border border-border bg-paper-cream p-4">
          <Button
            variant="outline"
            onClick={() => setShowDispute(!showDispute)}
            className="gap-1.5 text-ink-mid"
          >
            <AlertTriangle className="h-4 w-4" />
            Open a Dispute
          </Button>

          {showDispute && (
            <form
              action={async (formData) => {
                setLoading("dispute");
                setError(null);
                const result = await openDispute({}, formData);
                setLoading(null);
                if (result.error) {
                  setError(result.error);
                } else {
                  setShowDispute(false);
                  router.refresh();
                }
              }}
              className="mt-4 space-y-3"
            >
              <input type="hidden" name="escrow_id" value={escrowId} />
              <div>
                <Label htmlFor="dispute-reason" className="text-ink-black">
                  Describe the issue
                </Label>
                <Textarea
                  id="dispute-reason"
                  name="reason"
                  placeholder="Please describe the issue in detail — misrepresentation, health issues, non-delivery, etc."
                  minLength={10}
                  maxLength={5000}
                  rows={4}
                  className="mt-1 bg-paper-white resize-none"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="destructive"
                disabled={loading !== null}
                className="gap-1.5"
              >
                {loading === "dispute"
                  ? "Submitting..."
                  : "Submit Dispute"}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function CounterOfferForm({
  offerId,
  onDone,
}: {
  offerId: string;
  onDone: () => void;
}) {
  const initialState: OfferActionState = {};
  const [state, formAction, isPending] = useActionState(
    counterOffer,
    initialState
  );
  const [amountDollars, setAmountDollars] = useState("");

  if (state.offerId) {
    onDone();
  }

  const amountCents = Math.round(Number(amountDollars) * 100) || 0;

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <Separator />
      <input type="hidden" name="offer_id" value={offerId} />
      <input type="hidden" name="counter_amount_cents" value={amountCents} />

      {state.error && (
        <p className="text-sm text-red">{state.error}</p>
      )}

      <div>
        <Label htmlFor="counter-amount" className="text-ink-black">
          Your counter amount
        </Label>
        <div className="relative mt-1">
          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-light" />
          <Input
            id="counter-amount"
            type="number"
            min="1"
            step="1"
            value={amountDollars}
            onChange={(e) => setAmountDollars(e.target.value)}
            className="bg-paper-white pl-9"
            placeholder="Enter amount"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="counter-message" className="text-ink-black">
          Message{" "}
          <span className="font-normal text-ink-light">(optional)</span>
        </Label>
        <Textarea
          id="counter-message"
          name="message"
          placeholder="Explain your counter..."
          maxLength={2000}
          rows={2}
          className="mt-1 bg-paper-white resize-none"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending || !amountCents} size="sm">
          {isPending ? "Sending..." : "Send Counter"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDone}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
