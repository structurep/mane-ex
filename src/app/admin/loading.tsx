import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border-0 p-4 shadow-flat">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity */}
      <div className="rounded-lg border-0 shadow-flat">
        <div className="border-b border-crease-light p-4">
          <Skeleton className="h-5 w-32" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between border-b border-crease-light p-4 last:border-0">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
