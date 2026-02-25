"use client";

export function PostMediaGrid({
  media,
}: {
  media: Record<string, unknown>[];
}) {
  const count = media.length;

  if (count === 0) return null;

  if (count === 1) {
    const m = media[0];
    return (
      <div className="overflow-hidden">
        <img
          src={m.url as string}
          alt={(m.alt_text as string) ?? ""}
          className="w-full object-cover"
          style={{ maxHeight: 400 }}
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5 overflow-hidden">
        {media.map((m) => (
          <img
            key={m.id as string}
            src={m.url as string}
            alt={(m.alt_text as string) ?? ""}
            className="aspect-square w-full object-cover"
          />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-0.5 overflow-hidden">
        <img
          src={media[0].url as string}
          alt={(media[0].alt_text as string) ?? ""}
          className="row-span-2 h-full w-full object-cover"
        />
        <img
          src={media[1].url as string}
          alt={(media[1].alt_text as string) ?? ""}
          className="aspect-square w-full object-cover"
        />
        <img
          src={media[2].url as string}
          alt={(media[2].alt_text as string) ?? ""}
          className="aspect-square w-full object-cover"
        />
      </div>
    );
  }

  // 4+
  return (
    <div className="grid grid-cols-2 gap-0.5 overflow-hidden">
      {media.slice(0, 4).map((m, i) => (
        <div key={m.id as string} className="relative aspect-square">
          <img
            src={m.url as string}
            alt={(m.alt_text as string) ?? ""}
            className="h-full w-full object-cover"
          />
          {i === 3 && count > 4 && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-black/40">
              <span className="text-lg font-semibold text-paper-white">
                +{count - 4}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
