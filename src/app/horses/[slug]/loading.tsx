export default function ListingLoading() {
  return (
    <div className="min-h-screen bg-paper-white">
      {/* Header skeleton */}
      <div className="h-16 border-b border-border bg-paper-white" />

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="grid gap-8 md:grid-cols-[1fr_360px]">
          {/* Main column */}
          <div className="space-y-6">
            {/* Image */}
            <div className="aspect-[4/3] animate-pulse rounded-lg bg-paper-warm" />
            {/* Title + badges */}
            <div className="space-y-2">
              <div className="h-8 w-2/3 animate-pulse rounded bg-paper-warm" />
              <div className="flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded-full bg-paper-warm" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-paper-warm" />
              </div>
            </div>
            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-16 animate-pulse rounded bg-paper-warm" />
                  <div className="h-5 w-24 animate-pulse rounded bg-paper-warm" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-6">
              <div className="h-8 w-32 animate-pulse rounded bg-paper-warm" />
              <div className="mt-4 h-10 w-full animate-pulse rounded bg-paper-warm" />
              <div className="mt-3 h-10 w-full animate-pulse rounded bg-paper-warm" />
            </div>
            {/* Seller card */}
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-paper-warm" />
                <div className="space-y-1">
                  <div className="h-4 w-24 animate-pulse rounded bg-paper-warm" />
                  <div className="h-3 w-16 animate-pulse rounded bg-paper-warm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
