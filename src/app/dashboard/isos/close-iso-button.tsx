"use client";

import { useState } from "react";
import { closeIso } from "@/actions/isos";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function CloseIsoButton({ isoId }: { isoId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClose() {
    if (!confirm("Close this ISO? It will no longer receive matches.")) return;
    setLoading(true);
    const result = await closeIso(isoId);
    if (!result.error) {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleClose}
      disabled={loading}
      className="text-xs text-ink-light hover:text-red"
    >
      {loading ? "Closing..." : "Close"}
    </Button>
  );
}
