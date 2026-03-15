"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { markAllMatchAlertsRead } from "@/lib/match/match-alerts";

export function MarkAllAlertsReadButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      await markAllMatchAlertsRead();
      router.refresh();
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? "Marking..." : "Mark all read"}
    </Button>
  );
}
