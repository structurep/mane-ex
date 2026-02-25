"use client";

import { useState } from "react";
import { deleteCollection } from "@/actions/collections";
import { Button } from "@/components/ui/button";
import { Trash2, Check, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CollectionActions({
  collectionId,
  collectionSlug,
  visibility,
}: {
  collectionId: string;
  collectionSlug: string;
  visibility: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this collection? This cannot be undone.")) return;
    setDeleting(true);
    const result = await deleteCollection(collectionId);
    if (!result.error) {
      router.push("/dashboard/dream-barn");
    }
    setDeleting(false);
  }

  async function handleShare() {
    // Only shareable if public or shared
    if (visibility === "private") {
      alert("Make this collection shared or public to share the link.");
      return;
    }
    const url = `${window.location.origin}/collections/${collectionSlug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleShare}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-forest" />
            Copied
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" />
            Share
          </>
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-ink-light hover:text-red"
        onClick={handleDelete}
        disabled={deleting}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
