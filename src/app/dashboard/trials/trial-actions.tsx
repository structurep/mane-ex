"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cancelTrial, completeTrial, respondTrial } from "@/actions/trials";

export function TrialActions({
  trialId,
  status,
  isSeller,
}: {
  trialId: string;
  status: string;
  isSeller: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    await cancelTrial(trialId);
    setLoading(false);
  }

  async function handleComplete() {
    setLoading(true);
    const formData = new FormData();
    formData.set("trial_id", trialId);
    await completeTrial(formData);
    setLoading(false);
  }

  async function handleConfirm() {
    setLoading(true);
    const formData = new FormData();
    formData.set("trial_id", trialId);
    formData.set("status", "confirmed");
    await respondTrial(formData);
    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      {/* Seller can confirm requested trials */}
      {isSeller && status === "requested" && (
        <Button size="sm" onClick={handleConfirm} disabled={loading}>
          Confirm
        </Button>
      )}

      {/* Both can complete confirmed trials */}
      {status === "confirmed" && (
        <Button size="sm" variant="outline" onClick={handleComplete} disabled={loading}>
          Mark Complete
        </Button>
      )}

      {/* Both can cancel non-final trials */}
      {["requested", "confirmed", "rescheduled"].includes(status) && (
        <Button
          size="sm"
          variant="ghost"
          className="text-ink-light hover:text-red"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      )}
    </div>
  );
}
