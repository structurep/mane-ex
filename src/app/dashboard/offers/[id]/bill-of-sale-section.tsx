"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateBillOfSale, acceptBillOfSale } from "@/lib/legal/bill-of-sale";
import { BillOfSale } from "@/components/bill-of-sale";
import { Button } from "@/components/ui/button";
import type { BillOfSaleData } from "@/types/offers";
import { FileText, CheckCircle, Loader2 } from "lucide-react";

type BillOfSaleSectionProps = {
  escrowId: string;
  billOfSaleData: any; // JSONB from DB
  isBuyer: boolean;
  isSeller: boolean;
};

export function BillOfSaleSection({
  escrowId,
  billOfSaleData,
  isBuyer,
  isSeller,
}: BillOfSaleSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFull, setShowFull] = useState(false);

  const bos = billOfSaleData as BillOfSaleData | null;
  const hasAccepted = isBuyer
    ? bos?.accepted_by_buyer_at
    : bos?.accepted_by_seller_at;
  const fullyAccepted = bos?.accepted_by_buyer_at && bos?.accepted_by_seller_at;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    const result = await generateBillOfSale(escrowId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setShowFull(true);
      router.refresh();
    }
  }

  async function handleAccept() {
    setLoading(true);
    setError(null);
    const result = await acceptBillOfSale(escrowId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-ink-black">
        Bill of Sale
      </h2>

      {error && (
        <p className="mb-3 text-sm text-red">{error}</p>
      )}

      {!bos ? (
        // Bill of Sale not yet generated
        <div className="rounded-lg border border-dashed border-crease-mid bg-paper-cream p-6 text-center">
          <FileText className="mx-auto h-8 w-8 text-ink-faint" />
          <p className="mt-2 text-sm text-ink-mid">
            A UCC-compliant Bill of Sale will be generated for this transaction.
            Both buyer and seller must review and accept it.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-4 gap-1.5"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {loading ? "Generating..." : "Generate Bill of Sale"}
          </Button>
        </div>
      ) : (
        // Bill of Sale exists
        <div className="space-y-4">
          {/* Summary card */}
          <div className="rounded-lg border border-border bg-paper-cream p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-ink-mid" />
                <span className="text-sm font-medium text-ink-dark">
                  Equine Bill of Sale
                </span>
              </div>
              {fullyAccepted ? (
                <span className="flex items-center gap-1 text-xs text-forest">
                  <CheckCircle className="h-3 w-3" />
                  Fully accepted
                </span>
              ) : (
                <span className="text-xs text-gold">Pending acceptance</span>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFull(!showFull)}
              >
                {showFull ? "Hide" : "View"} Bill of Sale
              </Button>
              {!hasAccepted && (
                <Button
                  size="sm"
                  onClick={handleAccept}
                  disabled={loading}
                  className="gap-1.5"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {loading ? "Accepting..." : "Accept Bill of Sale"}
                </Button>
              )}
              {hasAccepted && !fullyAccepted && (
                <p className="flex items-center gap-1 text-xs text-ink-light">
                  <CheckCircle className="h-3 w-3 text-forest" />
                  You accepted. Waiting for the other party.
                </p>
              )}
            </div>
          </div>

          {/* Full Bill of Sale */}
          {showFull && (
            <BillOfSale data={bos} escrowId={escrowId} />
          )}
        </div>
      )}
    </div>
  );
}
