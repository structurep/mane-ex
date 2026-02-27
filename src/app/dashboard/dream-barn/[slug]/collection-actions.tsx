"use client";

import { useState } from "react";
import { deleteCollection } from "@/actions/collections";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Check, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
    setDeleting(true);
    const result = await deleteCollection(collectionId);
    if (!result.error) {
      toast.success("Collection deleted");
      router.push("/dashboard/dream-barn");
    } else {
      toast.error(result.error);
    }
    setDeleting(false);
  }

  async function handleShare() {
    if (visibility === "private") {
      toast("Make this collection shared or public to share the link.");
      return;
    }
    const url = `${window.location.origin}/collections/${collectionSlug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
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

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-ink-light hover:text-red"
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-paper-cream">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this Dream Barn collection. Saved
              horses won&apos;t be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
