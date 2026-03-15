"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { ListingWizard } from "../../new/wizard";
import type { SaveStatus } from "@/hooks/use-autosave";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type EditPageClientProps = {
  listingId: string;
  listingName: string;
  listingSlug: string | null;
  initialData: Record<string, unknown>;
};

export function EditPageClient({
  listingId,
  listingName,
  listingSlug,
  initialData,
}: EditPageClientProps) {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const isDirtyRef = useRef(false);
  const retryRef = useRef<(() => void) | null>(null);

  const handleSaveStatus = useCallback((status: SaveStatus) => {
    setSaveStatus(status);
    if (status === "saved") setLastSavedAt(new Date());
  }, []);

  // Keep ref in sync for use inside event handlers
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  // 1) beforeunload — tab close / page refresh
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // 2) popstate — browser back button
  useEffect(() => {
    const editUrl = window.location.href;

    const handler = () => {
      if (!isDirtyRef.current) return;
      // URL already changed; push back to edit page to stay
      window.history.pushState(null, "", editUrl);
      setShowDialog(true);
    };

    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  // 3) "Back to listings" link click
  const handleBackClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDirty) {
        e.preventDefault();
        setShowDialog(true);
      }
    },
    [isDirty],
  );

  const handleDiscard = useCallback(() => {
    isDirtyRef.current = false;
    setIsDirty(false);
    setShowDialog(false);
    router.push("/dashboard/listings");
  }, [router]);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/listings"
          onClick={handleBackClick}
          className="mb-2 inline-flex items-center text-sm text-ink-mid hover:text-ink-dark"
        >
          <ChevronLeft className="mr-0.5 h-4 w-4" />
          Back to listings
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
            Edit Listing
          </h1>
          {listingSlug && (
            <Link
              href={`/horses/${listingSlug}`}
              className="inline-flex items-center gap-1 rounded-md border border-surface-wash px-2.5 py-1 text-xs font-medium text-ink-mid transition-colors hover:border-saddle/30 hover:text-saddle"
            >
              View listing
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm text-ink-mid">
            Update {listingName} — changes are saved without affecting listing
            status.
          </p>
          {saveStatus === "saving" && (
            <span className="text-xs text-ink-mid">Saving…</span>
          )}
          {saveStatus === "saved" && lastSavedAt && (
            <span className="text-xs text-ink-faint">
              Saved at{" "}
              {lastSavedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-1 text-xs text-red">
              Save failed
              <button
                type="button"
                onClick={() => retryRef.current?.()}
                className="underline hover:no-underline"
              >
                Retry
              </button>
            </span>
          )}
        </div>
      </div>

      <ListingWizard
        mode="edit"
        listingId={listingId}
        initialData={initialData}
        onDirtyChange={setIsDirty}
        onSaveStatus={handleSaveStatus}
        retryRef={retryRef}
      />

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you leave now, they&apos;ll be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
