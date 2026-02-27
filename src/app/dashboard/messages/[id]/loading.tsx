import { Skeleton } from "@/components/ui/skeleton";

export default function MessageThreadLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-crease-light px-4 py-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 p-4">
        {/* Incoming message */}
        <div className="flex justify-start">
          <Skeleton className="h-16 w-3/5 rounded-lg" />
        </div>
        {/* Outgoing message */}
        <div className="flex justify-end">
          <Skeleton className="h-12 w-2/5 rounded-lg" />
        </div>
        {/* Incoming */}
        <div className="flex justify-start">
          <Skeleton className="h-20 w-1/2 rounded-lg" />
        </div>
        {/* Outgoing */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-1/3 rounded-lg" />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-crease-light p-3">
        <div className="flex items-end gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
