"use client";

import { useState } from "react";
import { markAllRead } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export function MarkAllReadButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    await markAllRead();
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="gap-1.5"
    >
      <Check className="h-3.5 w-3.5" />
      {loading ? "Marking..." : "Mark all read"}
    </Button>
  );
}
