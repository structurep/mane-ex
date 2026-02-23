export default function SellerLoading() {
  return (
    <div className="min-h-screen bg-paper-white">
      <div className="h-16 border-b border-border bg-paper-white" />
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        {/* Profile header */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-paper-warm" />
          <div className="space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-paper-warm" />
            <div className="h-4 w-32 animate-pulse rounded bg-paper-warm" />
          </div>
        </div>
        {/* Score */}
        <div className="mt-6 h-24 animate-pulse rounded-lg bg-paper-warm" />
        {/* Listings grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-border">
              <div className="aspect-[4/3] animate-pulse bg-paper-warm" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-3/4 animate-pulse rounded bg-paper-warm" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-paper-warm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
