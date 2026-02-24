import { Skeleton } from "@/components/ui/skeleton";

export default function ListingLoading() {
  return (
    <div className="min-h-screen bg-paper-white">
      {/* Header skeleton */}
      <div className="h-[4.5rem] border-b border-border bg-paper-white" />

      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
        {/* Breadcrumb */}
        <Skeleton className="mb-4 h-4 w-48" />

        {/* Gallery mosaic */}
        <div className="mb-2 lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-1.5">
              <Skeleton className="col-span-2 row-span-2 aspect-[4/3] rounded-lg" />
              <Skeleton className="aspect-[4/3] rounded-none" />
              <Skeleton className="aspect-[4/3] rounded-none" />
            </div>
            <Skeleton className="aspect-[4/3] rounded-lg lg:hidden" />
          </div>
          <div className="hidden lg:block" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-12 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
            {/* Quick facts grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-md" />
              ))}
            </div>
            {/* Tab bar */}
            <Skeleton className="h-10 w-full" />
            {/* Tab content */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Price sidebar */}
          <div className="hidden space-y-4 lg:block">
            <div className="rounded-lg bg-paper-cream p-6 shadow-folded">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="mt-4 h-11 w-full rounded-md" />
              <Skeleton className="mt-2 h-11 w-full rounded-md" />
              <Skeleton className="mt-2 h-11 w-full rounded-md" />
              <div className="mt-4 border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            </div>
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
