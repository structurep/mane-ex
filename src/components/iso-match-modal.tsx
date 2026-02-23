"use client";

import { useState, useEffect } from "react";
import { matchIso } from "@/actions/isos";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createBrowserClient } from "@supabase/ssr";
import { CheckCircle, Loader2, Send } from "lucide-react";

interface Listing {
  id: string;
  name: string;
  breed: string | null;
  price: number | null;
  status: string;
}

interface IsoMatchModalProps {
  isoId: string;
  isoTitle: string;
  children: React.ReactNode;
}

export function IsoMatchModal({
  isoId,
  isoTitle,
  children,
}: IsoMatchModalProps) {
  const [open, setOpen] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch user's active listings when modal opens
  useEffect(() => {
    if (!open) return;
    setLoadingListings(true);
    setError(null);
    setSuccess(false);
    setSelectedListingId(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setError("You must be logged in to match a horse.");
        setLoadingListings(false);
        return;
      }

      supabase
        .from("horse_listings")
        .select("id, name, breed, price, status")
        .eq("seller_id", user.id)
        .eq("status", "active")
        .order("name")
        .then(({ data, error: fetchError }) => {
          if (fetchError) {
            setError(fetchError.message);
          } else {
            setListings((data ?? []) as Listing[]);
          }
          setLoadingListings(false);
        });
    });
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedListingId) return;

    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("iso_id", isoId);
    formData.set("listing_id", selectedListingId);

    const result = await matchIso(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Match a Horse</DialogTitle>
          <p className="text-sm text-ink-mid">
            Match one of your listings to &ldquo;{isoTitle}&rdquo;
          </p>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle className="h-10 w-10 text-forest" />
            <p className="font-medium text-ink-black">Match submitted!</p>
            <p className="text-sm text-ink-mid">
              The buyer will be notified about your horse.
            </p>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Listing selector */}
            <div className="space-y-2">
              <Label>Select a listing</Label>
              {loadingListings ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-ink-light" />
                </div>
              ) : listings.length === 0 ? (
                <p className="py-4 text-center text-sm text-ink-mid">
                  You don&apos;t have any active listings to match.
                </p>
              ) : (
                <div className="max-h-48 space-y-1.5 overflow-y-auto">
                  {listings.map((listing) => (
                    <button
                      key={listing.id}
                      type="button"
                      onClick={() => setSelectedListingId(listing.id)}
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                        selectedListingId === listing.id
                          ? "border-ink-black bg-ink-black text-paper-white"
                          : "border-crease-light text-ink-mid hover:border-ink-black"
                      }`}
                    >
                      <span className="font-medium">{listing.name}</span>
                      {typeof listing.breed === "string" && (
                        <span className="ml-2 text-xs opacity-70">
                          {listing.breed}
                        </span>
                      )}
                      {typeof listing.price === "number" && (
                        <span className="ml-2 text-xs opacity-70">
                          ${(listing.price / 100).toLocaleString()}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Optional message */}
            <div className="space-y-2">
              <Label htmlFor="match-message">
                Message <span className="text-ink-light">(optional)</span>
              </Label>
              <Textarea
                id="match-message"
                name="message"
                placeholder="Why this horse is a great fit..."
                rows={3}
                maxLength={1000}
                className="input-swiss"
              />
            </div>

            {error && <p className="text-sm text-red">{error}</p>}

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={!selectedListingId || submitting || listings.length === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Match
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
