"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startConversation } from "@/actions/messages";
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
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Shield } from "lucide-react";
import { AlertBanner } from "@/components/tailwind-plus";
import { toast } from "sonner";
import { BuyerBadge } from "@/components/buyer/buyer-badge";
import type { QualificationBadge } from "@/lib/buyer/qualification-score";

type Props = {
  sellerId: string;
  sellerName: string;
  listingId: string;
  listingName: string;
  trigger?: React.ReactNode;
  /** Buyer's qualification badge (passed from server context) */
  buyerBadge?: QualificationBadge | null;
};

export function MessageSellerModal({
  sellerId,
  sellerName,
  listingId,
  listingName,
  trigger,
  buyerBadge,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const trimmed = message.trim();
    if (!trimmed) return;

    setSending(true);
    setError(null);

    const result = await startConversation(sellerId, listingId, trimmed);

    setSending(false);

    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Message sent", {
      description: `${sellerName} has been notified.`,
    });
    setOpen(false);
    setMessage("");
    router.push(`/dashboard/messages/${result.conversationId}`);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setMessage("");
      setError(null);
    }
    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="w-full" size="lg" data-contact-seller>
            <MessageCircle className="mr-2 h-4 w-4" />
            Message Seller
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-paper-cream sm:max-w-md animate-fade-up">
        <DialogHeader>
          <DialogTitle className="text-ink-black">
            Message {sellerName}
          </DialogTitle>
          <DialogDescription className="text-ink-mid">
            <span>About: {listingName}</span>
            {buyerBadge && (
              <span className="ml-2 inline-block align-middle">
                <BuyerBadge badge={buyerBadge} />
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <AlertBanner variant="error">{error}</AlertBanner>
        )}

        <div className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself and ask about the horse..."
            maxLength={5000}
            rows={4}
            className="bg-paper-white resize-none"
          />
          <p className="text-xs text-ink-light">
            {message.length}/5,000 characters
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-md bg-paper-warm p-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
          <p className="text-xs text-ink-mid">
            Messages are private between you and the seller. Never share bank
            account numbers, SSNs, or other financial credentials. Use ManeVault
            escrow for all payments.
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSend}
            disabled={sending || !message.trim()}
          >
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
