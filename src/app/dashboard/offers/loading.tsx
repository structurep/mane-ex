export default function OffersLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 animate-pulse rounded bg-paper-warm" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-48 animate-pulse rounded bg-paper-warm" />
              <div className="h-4 w-24 animate-pulse rounded bg-paper-warm" />
            </div>
            <div className="h-8 w-20 animate-pulse rounded bg-paper-warm" />
          </div>
        </div>
      ))}
    </div>
  );
}
