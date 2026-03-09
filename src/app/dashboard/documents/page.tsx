import { Metadata } from "next";
import { EmptyState } from "@/components/tailwind-plus";
import { FolderOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Documents Vault",
};

export default function DocumentsVaultPage() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
          Documents Vault
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          Securely manage all your equine documents in one place.
        </p>
      </div>

      {/* Coming soon */}
      <div className="rounded-lg border border-dashed border-crease-mid bg-paper-cream">
        <EmptyState
          icon={<FolderOpen className="size-10" />}
          title="Document management is coming soon"
          description="Upload and share PPE reports, X-rays, Coggins tests, registration papers, and vet records — all in one secure vault."
        />
      </div>
    </div>
  );
}
