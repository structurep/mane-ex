import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <Skeleton className="h-8 w-48" />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border-0 p-4 shadow-flat">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Recent listings table */}
      <div className="rounded-lg border-0 shadow-flat">
        <div className="border-b border-crease-light p-4">
          <Skeleton className="h-5 w-32" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-crease-light p-4 last:border-0">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
