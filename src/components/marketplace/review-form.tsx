"use client";

import { useState } from "react";
import { createReview } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, AlertBanner } from "@/components/tailwind-plus";
import { StarRating } from "@/components/marketplace/star-rating";
import { toast } from "sonner";

interface ReviewFormProps {
  sellerId: string;
  listingId?: string;
  offerId?: string;
  stage: "inquiry" | "trial" | "offer" | "completion";
  onSuccess?: () => void;
}

const STAGE_LABELS: Record<string, string> = {
  inquiry: "After Inquiry",
  trial: "After Trial",
  offer: "After Offer",
  completion: "After Purchase",
};

export function ReviewForm({
  sellerId,
  listingId,
  offerId,
  stage,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("seller_id", sellerId);
    formData.set("stage", stage);
    formData.set("rating", String(rating));
    if (listingId) formData.set("listing_id", listingId);
    if (offerId) formData.set("offer_id", offerId);

    const result = await createReview(formData);

    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      setSuccess(true);
      toast.success("Review submitted — thank you!");
      onSuccess?.();
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="rounded-lg border border-oxblood/20 bg-oxblood/5 p-6 text-center">
        <p className="font-medium text-oxblood">Thank you for your review!</p>
        <p className="mt-1 text-sm text-ink-mid">
          Your feedback helps the ManeExchange community.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        <StatusBadge variant="blue">{STAGE_LABELS[stage]}</StatusBadge>
      </div>

      <div className="space-y-2">
        <Label>Rating</Label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-ink-light">(optional)</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Summarize your experience"
          maxLength={200}
          className="input-swiss"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Your Review</Label>
        <Textarea
          id="body"
          name="body"
          placeholder="Share details about your experience with this seller..."
          rows={4}
          required
          minLength={10}
          maxLength={2000}
          className="input-swiss"
        />
        <p className="text-xs text-ink-light">Minimum 10 characters</p>
      </div>

      {error && <AlertBanner variant="error">{error}</AlertBanner>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
