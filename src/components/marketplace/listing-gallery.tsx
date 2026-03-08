"use client";

import { type ReactNode, useState, useCallback } from "react";
import Image from "next/image";
import { Play, Images } from "lucide-react";
import dynamic from "next/dynamic";

const Lightbox = dynamic(
  () => import("@/components/marketplace/lightbox").then((m) => m.Lightbox),
  { ssr: false }
);

type MediaItem = {
  id: string;
  url: string;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
  is_primary: boolean;
  type: "photo" | "video";
};

export function ListingGallery({ media, heroImage }: { media: MediaItem[]; heroImage?: ReactNode }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Photo-first sorting: photos float to top so a photo is the LCP hero,
  // then primary, then sort_order. Videos stay accessible in strip/lightbox.
  const sorted = [...media].sort((a, b) => {
    if (a.type === "photo" && b.type !== "photo") return -1;
    if (a.type !== "photo" && b.type === "photo") return 1;
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.sort_order - b.sort_order;
  });

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  if (!sorted.length) {
    return (
      <div className="mb-6 flex aspect-[4/3] items-center justify-center rounded-lg bg-paper-warm text-ink-light">
        No photos yet
      </div>
    );
  }

  const lightboxItems = sorted.map((m) => ({
    url: m.url,
    alt: m.alt_text || "Listing media",
    type: m.type,
  }));

  // Find first photo URL for use as video poster
  const firstPhotoUrl = sorted.find((m) => m.type === "photo")?.url;

  // How many items to show in the mosaic grid (desktop)
  const mosaicCount = Math.min(sorted.length, 3);
  const extraCount = sorted.length - mosaicCount;

  return (
    <div className="mb-6">
      {/* Desktop mosaic (lg+): hero left + 2 stacked right */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-3 gap-1.5 overflow-hidden rounded-lg">
          {/* Hero cell — spans 2 cols, full height */}
          <button
            onClick={() => openLightbox(0)}
            className="group relative col-span-2 row-span-2 aspect-[4/3] overflow-hidden bg-paper-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crease-light"
          >
            {heroImage || <GalleryMedia item={sorted[0]} priority posterUrl={firstPhotoUrl} />}
          </button>

          {/* Right column — 2 stacked cells */}
          {mosaicCount >= 2 && (
            <button
              onClick={() => openLightbox(1)}
              className="group relative aspect-[4/3] overflow-hidden bg-paper-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crease-light"
            >
              <GalleryMedia item={sorted[1]} posterUrl={firstPhotoUrl} />
            </button>
          )}
          {mosaicCount >= 3 ? (
            <button
              onClick={() => openLightbox(2)}
              className="group relative aspect-[4/3] overflow-hidden bg-paper-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crease-light"
            >
              <GalleryMedia item={sorted[2]} posterUrl={firstPhotoUrl} />
              {/* "View all" overlay on last mosaic cell */}
              {extraCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink-black/40 transition-colors group-hover:bg-ink-black/50">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-paper-white">
                    <Images className="h-4 w-4" />
                    +{extraCount} more
                  </span>
                </div>
              )}
            </button>
          ) : mosaicCount < 3 ? (
            <div className="aspect-[4/3] bg-paper-warm" />
          ) : null}
        </div>
      </div>

      {/* Mobile layout: single image + thumbnail strip */}
      <div className="lg:hidden">
        <button
          onClick={() => openLightbox(0)}
          className="group relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-paper-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crease-light"
        >
          {heroImage || <GalleryMedia item={sorted[0]} priority posterUrl={firstPhotoUrl} />}
          {/* Photo count badge */}
          {sorted.length > 1 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-ink-black/60 px-2.5 py-1 text-xs text-paper-white">
              <Images className="h-3 w-3" />
              {sorted.length}
            </div>
          )}
        </button>

        {/* Thumbnail strip with scroll-snap */}
        {sorted.length > 1 && (
          <div className="relative mt-2">
            <div className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {sorted.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => openLightbox(i)}
                  aria-label={`View ${item.type === "video" ? "video" : "photo"} ${i + 1} of ${sorted.length}`}
                  className={`relative h-14 w-[4.5rem] flex-shrink-0 snap-start overflow-hidden rounded-md border-2 transition-all ${
                    i === 0
                      ? "border-primary ring-1 ring-primary/30"
                      : "border-transparent opacity-70 hover:opacity-100"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crease-light`}
                >
                  {item.type === "video" ? (
                    <div className="flex h-full w-full items-center justify-center bg-ink-black/80">
                      <Play className="h-4 w-4 text-paper-white" />
                    </div>
                  ) : (
                    <Image
                      src={item.url}
                      alt={item.alt_text || ""}
                      fill
                      sizes="72px"
                      loading="lazy"
                      className="object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
            {/* Fade edge to hint scrollability */}
            {sorted.length > 4 && (
              <div className="pointer-events-none absolute right-0 top-0 h-14 w-8 bg-gradient-to-l from-background to-transparent" />
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          items={lightboxItems}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}

/** Renders a single media cell (photo with reveal animation, or video with play overlay) */
function GalleryMedia({
  item,
  priority,
  posterUrl,
}: {
  item: MediaItem;
  priority?: boolean;
  posterUrl?: string;
}) {
  if (item.type === "video") {
    return (
      <>
        <video
          src={item.url}
          muted
          playsInline
          className="h-full w-full object-cover"
          poster={posterUrl || undefined}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-ink-black/60 p-3 transition-transform group-hover:scale-110">
            <Play className="h-6 w-6 text-paper-white" fill="white" />
          </div>
        </div>
      </>
    );
  }

  return (
    <Image
      src={item.url}
      alt={item.alt_text || "Listing photo"}
      fill
      sizes="(min-width: 1024px) 66vw, 100vw"
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
    />
  );
}
