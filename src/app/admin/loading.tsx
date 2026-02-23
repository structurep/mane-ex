export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-paper-warm" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-paper-warm" />
              <div className="space-y-1">
                <div className="h-6 w-12 animate-pulse rounded bg-paper-warm" />
                <div className="h-3 w-20 animate-pulse rounded bg-paper-warm" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border p-4">
          <div className="h-5 w-32 animate-pulse rounded bg-paper-warm" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between border-b border-border p-4 last:border-0">
            <div className="flex items-center gap-3">
              <div className="h-5 w-16 animate-pulse rounded bg-paper-warm" />
              <div className="h-4 w-40 animate-pulse rounded bg-paper-warm" />
            </div>
            <div className="h-3 w-12 animate-pulse rounded bg-paper-warm" />
          </div>
        ))}
      </div>
    </div>
  );
}
