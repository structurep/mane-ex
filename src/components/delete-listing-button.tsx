"use client";

import { useState } from "react";
import { archiveListing } from "@/actions/listings";
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
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DeleteListingButton({
  listingId,
  listingName,
}: {
  listingId: string;
  listingName: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    const result = await archiveListing(listingId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Listing removed");
      router.refresh();
    }
    setDeleting(false);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-ink-light hover:text-red"
          title="Remove listing"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-paper-cream">
        <AlertDialogHeader>
          <AlertDialogTitle>Remove listing?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{listingName}&rdquo; will be marked as removed and hidden
            from buyers. You can contact support to restore it later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
