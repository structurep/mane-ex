"use client";

import { useState } from "react";
import { Play } from "lucide-react";

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
  const sorted = [...media].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.sort_order - b.sort_order;
  });

  const [selected, setSelected] = useState(0);
  const current = sorted[selected];

  if (!sorted.length) {
    return (
      <div className="mb-6 flex aspect-[4/3] items-center justify-center rounded-lg bg-paper-warm text-ink-light">
        No photos yet
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Main image / video */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-paper-warm">
        {current.type === "video" ? (
          <video
            key={current.id}
            src={current.url}
            controls
            playsInline
            className="h-full w-full object-cover"
            poster=""
          />
        ) : (
          <img
            key={current.id}
            src={current.url}
            alt={current.alt_text || "Listing photo"}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {sorted.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setSelected(i)}
              className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                i === selected
                  ? "border-red ring-1 ring-red/30"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {item.type === "video" ? (
                <div className="flex h-full w-full items-center justify-center bg-ink-black/80">
                  <Play className="h-5 w-5 text-paper-white" />
                </div>
              ) : (
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
  );
}
