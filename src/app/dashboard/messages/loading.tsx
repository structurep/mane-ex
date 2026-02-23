export default function MessagesLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 animate-pulse rounded bg-paper-warm" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border border-border p-4"
        >
          <div className="h-10 w-10 animate-pulse rounded-full bg-paper-warm" />
          <div className="flex-1 space-y-1">
            <div className="h-4 w-36 animate-pulse rounded bg-paper-warm" />
            <div className="h-3 w-64 animate-pulse rounded bg-paper-warm" />
          </div>
          <div className="h-3 w-12 animate-pulse rounded bg-paper-warm" />
        </div>
      ))}
    </div>
  );
}
