import { Skeleton } from "@/components/ui/skeleton";

export default function OffersLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border-0 p-4 shadow-flat">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
