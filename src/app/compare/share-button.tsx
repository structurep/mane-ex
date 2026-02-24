"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Link2 } from "lucide-react";

export function CompareShareButton({ ids }: { ids: string[] }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/compare?ids=${ids.join(",")}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Compare Horses on ManeExchange",
          text: "Check out this horse comparison!",
          url,
        });
        return;
      } catch {
        // User cancelled share — fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
      {copied ? (
        <>
          <Check className="h-4 w-4 text-forest" />
          Link Copied
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" />
          Share Comparison
        </>
      )}
    </Button>
  );
}
