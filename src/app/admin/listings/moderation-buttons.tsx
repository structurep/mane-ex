"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveListing, rejectListing } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export function ModerationButtons({
  listingId,
  status,
}: {
  listingId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    await approveListing(listingId);
    setLoading(false);
    router.refresh();
  }

  async function handleReject() {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    setLoading(true);
    await rejectListing(listingId, reason);
    setLoading(false);
    router.refresh();
  }

  if (status === "active") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleReject}
        disabled={loading}
        className="text-red-600 hover:bg-red-50"
      >
        <X className="mr-1 h-3 w-3" />
        {loading ? "..." : "Reject"}
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleApprove}
        disabled={loading}
        className="text-green-600 hover:bg-green-50"
      >
        <Check className="mr-1 h-3 w-3" />
        {loading ? "..." : "Approve"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleReject}
        disabled={loading}
        className="text-red-600 hover:bg-red-50"
      >
        <X className="mr-1 h-3 w-3" />
        {loading ? "..." : "Reject"}
      </Button>
    </div>
  );
}
