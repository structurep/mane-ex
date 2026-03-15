import { Skeleton } from "@/components/ui/skeleton";

export default function BrowseLoading() {
  return (
    <div className="min-h-screen bg-paper-white">
      {/* Header skeleton */}
      <div className="h-[4.5rem] border-b border-crease-light bg-paper-white" />

      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
        {/* Title */}
        <div className="mb-8">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters sidebar skeleton */}
          <aside className="lg:col-span-1">
            <div className="space-y-6 rounded-lg bg-paper-cream p-4 shadow-flat">
              <Skeleton className="h-9 w-full" />
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-20 rounded-[var(--radius-card)]" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
              <Skeleton className="h-9 w-full" />
              <div className="flex gap-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-16 rounded-[var(--radius-card)]" />
                ))}
              </div>
            </div>
          </aside>

          {/* Card grid skeleton */}
          <div className="lg:col-span-3">
            {/* Count bar */}
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg bg-paper-white shadow-flat"
                >
                  <Skeleton className="aspect-[3/2] w-full rounded-none" />
                  <div className="space-y-2 p-3.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
