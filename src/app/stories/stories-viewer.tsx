"use client";

import { useState, useEffect, useCallback } from "react";
import { getStoriesListings } from "@/actions/discovery";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronUp,
  ChevronDown,
  X,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface StoryListing {
  id: string;
  name: string;
  slug: string;
  breed: string | null;
  price: number | null;
  height_hands: number | null;
  location_state: string | null;
  location_city: string | null;
  primary_image_url: string | null;
  description: string | null;
  created_at: string;
}

export function StoriesViewer() {
  const [listings, setListings] = useState<StoryListing[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    const { data, hasMore: more, nextCursor } = await getStoriesListings(
      cursor ?? undefined,
      10
    );
    if (data) {
      setListings((prev) => [...prev, ...(data as StoryListing[])]);
      setHasMore(more);
      setCursor(nextCursor);
    }
    setLoading(false);
  }, [cursor]);

  useEffect(() => {
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goNext() {
    if (currentIndex < listings.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
    // Load more when near the end
    if (currentIndex >= listings.length - 3 && hasMore) {
      loadListings();
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "j") goNext();
      if (e.key === "ArrowUp" || e.key === "k") goPrev();
      if (e.key === "Escape") window.history.back();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, listings.length]);

  if (loading && listings.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-paddock text-paper-white">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-paddock text-paper-white">
        <p className="mb-4 text-lg">No listings to show</p>
        <Button variant="outline" asChild>
          <Link href="/browse">Browse instead</Link>
        </Button>
      </div>
    );
  }

  const listing = listings[currentIndex];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-paddock">
      {/* Background image */}
      {typeof listing.primary_image_url === "string" ? (
        <Image
          src={listing.primary_image_url}
          alt={listing.name}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-paper-cream/10 text-ink-light">
          No photo
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Close button */}
      <Link
        href="/discover"
        className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
      >
        <X className="h-5 w-5" />
      </Link>

      {/* Progress dots */}
      <div className="absolute left-4 right-4 top-4 flex gap-1">
        {listings.slice(0, Math.min(listings.length, 20)).map((_, i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 rounded-full transition-colors ${
              i <= currentIndex ? "bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h2 className="font-serif text-3xl font-bold drop-shadow-lg md:text-4xl">
          {listing.name}
        </h2>

        <div className="mt-2 flex items-center gap-3 text-sm opacity-90">
          {typeof listing.breed === "string" && <span>{listing.breed}</span>}
          {typeof listing.height_hands === "number" && (
            <span>{listing.height_hands}hh</span>
          )}
          {(typeof listing.location_city === "string" ||
            typeof listing.location_state === "string") && (
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {[listing.location_city, listing.location_state]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
        </div>

        {typeof listing.price === "number" && (
          <p className="mt-2 font-serif text-2xl font-bold tracking-tight">
            ${(listing.price / 100).toLocaleString()}
          </p>
        )}

        {typeof listing.description === "string" && (
          <p className="mt-2 line-clamp-2 text-sm opacity-80">
            {listing.description}
          </p>
        )}

        <div className="mt-4 flex gap-3">
          <Button asChild className="gap-1.5">
            <Link href={`/horses/${listing.slug}`}>
              View Listing
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <p className="mt-3 text-xs opacity-50">
          {currentIndex + 1} / {listings.length}
          {hasMore ? "+" : ""}
        </p>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goPrev}
        disabled={currentIndex === 0}
        className="absolute left-1/2 top-16 -translate-x-1/2 rounded-full bg-black/30 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white disabled:opacity-30"
      >
        <ChevronUp className="h-6 w-6" />
      </button>
      <button
        onClick={goNext}
        disabled={currentIndex === listings.length - 1 && !hasMore}
        className="absolute bottom-36 left-1/2 -translate-x-1/2 rounded-full bg-black/30 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white disabled:opacity-30"
      >
        <ChevronDown className="h-6 w-6" />
      </button>

      {/* Touch zones for swipe */}
      <div
        className="absolute inset-x-0 top-0 h-1/3 cursor-pointer"
        onClick={goPrev}
      />
      <div
        className="absolute inset-x-0 bottom-44 h-1/4 cursor-pointer"
        onClick={goNext}
      />
    </div>
  );
}
