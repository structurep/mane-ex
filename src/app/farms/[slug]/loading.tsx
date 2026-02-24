import { Skeleton } from "@/components/ui/skeleton";

export default function FarmLoading() {
  return (
    <div className="min-h-screen bg-paper-white">
      <div className="h-[4.5rem] border-b border-border bg-paper-white" />
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        {/* Farm header */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-20 w-full" />
        </div>
        {/* Listings */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg shadow-flat">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 p-3.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
