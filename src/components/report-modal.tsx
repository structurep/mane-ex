"use client";

import { useState, useActionState, useEffect } from "react";
import { createReport } from "@/actions/reports";
import type { ReportActionState } from "@/actions/reports";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Flag, AlertTriangle, CheckCircle } from "lucide-react";

type ReportModalProps = {
  targetType: "listing" | "user" | "message";
  targetId: string;
  targetName?: string;
  trigger?: React.ReactNode;
};

const REPORT_REASONS = [
  { value: "fraud", label: "Fraud or Scam" },
  { value: "misrepresentation", label: "Misrepresentation" },
  { value: "stolen_photos", label: "Stolen Photos" },
  { value: "animal_welfare", label: "Animal Welfare Concern" },
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
] as const;

const initialState: ReportActionState = {};

export function ReportModal({
  targetType,
  targetId,
  targetName,
  trigger,
}: ReportModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [state, formAction, isPending] = useActionState(
    createReport,
    initialState
  );

  // Auto-close on success after 2 seconds
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success]);

  // Reset form when dialog is opened
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setSelectedReason("");
      setDetails("");
    }
    setOpen(nextOpen);
  }

  const displayName =
    targetName || `this ${targetType}`;

  const charCount = details.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="text-ink-mid gap-1.5">
            <Flag className="size-4" />
            Report
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-paper-cream sm:max-w-md">
        {state.success ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-forest/10">
              <CheckCircle className="size-6 text-forest" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-ink-black">
                Report submitted
              </p>
              <p className="text-sm text-ink-mid">
                Our team will review it. Thank you for helping keep
                ManeExchange safe.
              </p>
            </div>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </DialogClose>
          </div>
        ) : (
          /* ── Report form ── */
          <>
            <DialogHeader>
              <DialogTitle className="text-ink-black">
                Report {displayName}
              </DialogTitle>
              <DialogDescription className="text-ink-mid">
                Help us keep ManeExchange safe. Reports are reviewed by our
                team.
              </DialogDescription>
            </DialogHeader>

            {state.error && (
              <div className="flex items-start gap-2 rounded-md border border-red/20 bg-red-light px-3 py-2.5 text-sm text-red">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-5">
              {/* Hidden fields */}
              <input type="hidden" name="target_type" value={targetType} />
              <input type="hidden" name="target_id" value={targetId} />
              <input type="hidden" name="reason" value={selectedReason} />

              {/* ── Reason selection (radio card grid) ── */}
              <fieldset className="space-y-2">
                <Label asChild>
                  <legend className="text-sm font-medium text-ink-black">
                    What is the issue?
                  </legend>
                </Label>
                {state.fieldErrors?.reason && (
                  <p className="text-xs text-red">{state.fieldErrors.reason}</p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {REPORT_REASONS.map((reason) => {
                    const isSelected = selectedReason === reason.value;
                    return (
                      <label
                        key={reason.value}
                        className={`
                          flex cursor-pointer items-center justify-center rounded-md border
                          px-3 py-2.5 text-center text-sm transition-colors
                          ${
                            isSelected
                              ? "border-ink-black bg-paper-white text-ink-black font-medium"
                              : "border-crease-light bg-paper-white/60 text-ink-mid hover:border-ink-light hover:text-ink-dark"
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="reason_radio"
                          value={reason.value}
                          checked={isSelected}
                          onChange={() => setSelectedReason(reason.value)}
                          className="sr-only"
                        />
                        {reason.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* ── Details textarea ── */}
              <div className="space-y-2">
                <Label htmlFor="report-details" className="text-ink-black">
                  Please describe the issue
                </Label>
                {state.fieldErrors?.details && (
                  <p className="text-xs text-red">
                    {state.fieldErrors.details}
                  </p>
                )}
                <Textarea
                  id="report-details"
                  name="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide as much detail as possible so our team can investigate..."
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  className="bg-paper-white resize-none"
                />
                <p className="text-right text-xs text-ink-light">
                  {charCount}/2000
                </p>
              </div>

              {/* ── Submit ── */}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isPending || !selectedReason || charCount < 10}
                >
                  {isPending ? "Submitting..." : "Submit Report"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
