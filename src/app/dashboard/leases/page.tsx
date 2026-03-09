import { Metadata } from "next";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/tailwind-plus/empty-states/empty-state";

export const metadata: Metadata = { title: "Lease Management" };

export default function LeasesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
          Lease Management
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          Manage your horse leases and trial agreements.
        </p>
      </div>

      <EmptyState
        icon={<FileText className="size-8" />}
        title="No leases"
        description="Lease management is coming soon. You'll be able to create, track, and manage horse lease agreements directly through ManeExchange."
      />
    </div>
  );
}
