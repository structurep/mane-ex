"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { suspendUser, unsuspendUser } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function SuspendUserButton({
  userId,
  isSuspended,
}: {
  userId: string;
  isSuspended: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (isSuspended) {
      setLoading(true);
      await unsuspendUser(userId);
      setLoading(false);
      router.refresh();
      return;
    }

    const reason = prompt("Reason for suspension:");
    if (!reason) return;

    setLoading(true);
    await suspendUser(userId, reason);
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      variant={isSuspended ? "outline" : "destructive"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
    >
      {loading
        ? "..."
        : isSuspended
          ? "Unsuspend"
          : "Suspend"}
    </Button>
  );
}
