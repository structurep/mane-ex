"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resolveReport } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export function ResolveReportButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleResolve() {
    const resolution = prompt("Resolution note:");
    if (!resolution) return;

    setLoading(true);
    await resolveReport(reportId, resolution);
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleResolve}
      disabled={loading}
      className="text-forest hover:bg-forest/10"
    >
      <CheckCircle className="mr-1 h-3 w-3" />
      {loading ? "..." : "Resolve"}
    </Button>
  );
}
