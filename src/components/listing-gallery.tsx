"use client";

import { useState, useCallback } from "react";
import { Play, Images } from "lucide-react";
import { Lightbox } from "@/components/lightbox";

type MediaItem = {
  id: string;
  url: string;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
  is_primary: boolean;
  type: "photo" | "video";
};

export function ListingGallery({ media }: { media: MediaItem[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Video-first sorting: videos float to top, then primary, then sort_order
  const sorted = [...media].sort((a, b) => {
    if (a.type === "video" && b.type !== "video") return -1;
    if (a.type !== "video" && b.type === "video") return 1;
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
            <GalleryMedia item={sorted[0]} priority />
          </button>

          {/* Right column — 2 stacked cells */}
          {mosaicCount >= 2 && (
            <button
              onClick={() => openLightbox(1)}
              className="group relative aspect-[4/3] overflow-hidden bg-paper-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crease-light"
            >
              <GalleryMedia item={sorted[1]} />
            </button>
          )}
          {mosaicCount >= 3 ? (
            <button
              onClick={() => openLightbox(2)}
              className="group relative aspect-[4/3] overflow-hidden bg-paper-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crease-light"
            >
              <GalleryMedia item={sorted[2]} />
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
          <GalleryMedia item={sorted[0]} priority />
          {/* Photo count badge */}
          {sorted.length > 1 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-ink-black/60 px-2.5 py-1 text-xs text-paper-white">
              <Images className="h-3 w-3" />
              {sorted.length}
            </div>
          )}
        </button>

        {/* Thumbnail strip */}
        {sorted.length > 1 && (
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {sorted.map((item, i) => (
              <button
                key={item.id}
                onClick={() => openLightbox(i)}
                className={`relative h-14 w-[4.5rem] flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                  i === 0
                    ? "border-red ring-1 ring-red/30"
                    : "border-transparent opacity-70 hover:opacity-100"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crease-light`}
              >
                {item.type === "video" ? (
                  <div className="flex h-full w-full items-center justify-center bg-ink-black/80">
                    <Play className="h-4 w-4 text-paper-white" />
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.url}
                    alt={item.alt_text || ""}
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            ))}
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
}: {
  item: MediaItem;
  priority?: boolean;
}) {
  if (item.type === "video") {
    return (
      <>
        <video
          src={item.url}
          muted
          playsInline
          className="h-full w-full object-cover"
          poster=""
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
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={item.url}
      alt={item.alt_text || "Listing photo"}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      loading={priority ? "eager" : "lazy"}
    />
  );
}
