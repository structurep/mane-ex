export default function BrowseLoading() {
  return (
    <div className="min-h-screen bg-paper-white">
      {/* Header skeleton */}
      <div className="h-16 border-b border-border bg-paper-white" />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Title */}
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-paper-warm" />

        {/* Filters bar */}
        <div className="mb-8 flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-28 animate-pulse rounded-md bg-paper-warm"
            />
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-border">
              <div className="aspect-[4/3] animate-pulse bg-paper-warm" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-3/4 animate-pulse rounded bg-paper-warm" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-paper-warm" />
                <div className="h-6 w-24 animate-pulse rounded bg-paper-warm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
