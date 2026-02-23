"use client";

import { useState } from "react";
import { requestTrial } from "@/actions/trials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";

export function TrialRequestModal({
  listingId,
  horseName,
}: {
  listingId: string;
  horseName: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("listing_id", listingId);

    const result = await requestTrial(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    }
  }

  // Min date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          Book Trial
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Request a Trial — {horseName}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-forest/10">
              <Calendar className="h-6 w-6 text-forest" />
            </div>
            <p className="font-medium text-ink-black">Trial Requested!</p>
            <p className="mt-1 text-sm text-ink-mid">
              The seller will confirm your visit date.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preferred_date">Preferred Date & Time</Label>
              <Input
                id="preferred_date"
                name="preferred_date"
                type="datetime-local"
                min={`${minDate}T08:00`}
                required
                className="input-swiss"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternate_date">
                Alternate Date <span className="text-ink-light">(optional)</span>
              </Label>
              <Input
                id="alternate_date"
                name="alternate_date"
                type="datetime-local"
                min={`${minDate}T08:00`}
                className="input-swiss"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer_notes">
                Notes for Seller <span className="text-ink-light">(optional)</span>
              </Label>
              <Textarea
                id="buyer_notes"
                name="buyer_notes"
                placeholder="What would you like to do during the trial? Flat work, jumping, trail ride..."
                rows={3}
                maxLength={2000}
                className="input-swiss"
              />
            </div>

            {error && (
              <p className="text-sm text-red">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending Request..." : "Request Trial"}
            </Button>

            <p className="text-center text-xs text-ink-light">
              The seller will be notified and can confirm, reschedule, or decline.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
