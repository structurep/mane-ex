import { Metadata } from "next";
import { Shield } from "lucide-react";
import { EmptyState } from "@/components/tailwind-plus";

export const metadata: Metadata = { title: "Dispute Resolution" };

export default function DisputesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
          Dispute Resolution
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          Manage and track your transaction disputes.
        </p>
      </div>

      {/* Protection banner */}
      <div className="mb-8 rounded-lg border border-forest/20 bg-forest/5 p-5">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
          <div>
            <h2 className="font-medium text-ink-black">
              Buyer &amp; Seller Protection
            </h2>
            <p className="mt-1 text-sm text-ink-mid">
              ManeExchange provides dispute resolution for all escrow
              transactions. Our team reviews every case within 24-48 hours and
              requires clear documentation from both parties.
            </p>
          </div>
        </div>
      </div>

      <EmptyState
        icon={<Shield className="size-8" />}
        title="No disputes"
        description="You don't have any active disputes. If you need to open a dispute on a transaction, contact support from your offer detail page."
      />
    </div>
  );
}
