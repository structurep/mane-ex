"use client";

import { useState } from "react";
import { respondToReview } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

export function RespondForm({ reviewId }: { reviewId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("review_id", reviewId);

    const result = await respondToReview(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setDone(true);
    }
    setLoading(false);
  }

  if (done) {
    return (
      <p className="ml-4 text-sm text-forest">Response submitted.</p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="ml-4 flex items-center gap-1 text-sm text-ink-mid hover:text-ink-black"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Respond to this review
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="ml-4 space-y-2">
      <Textarea
        name="seller_response"
        placeholder="Write a thoughtful response..."
        rows={3}
        required
        minLength={5}
        maxLength={2000}
        className="input-swiss"
      />
      {error && <p className="text-sm text-red">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Submit Response"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          type="button"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
