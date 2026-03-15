import { Check, X, ShieldCheck, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationTier } from "@/lib/listings/verification-tier";
import { VerificationBadge } from "./verification-badge";

type VerificationData = {
  verification_tier: VerificationTier;
  seller_identity_verified: boolean;
  trainer_endorsed: boolean;
  standardized_video_complete: boolean;
  ppe_on_file: boolean;
  show_record_linked: boolean;
  hp_trainer_name?: string | null;
  ppe_document_url?: string | null;
  show_record_url?: string | null;
};

interface VerificationChecklistProps {
  listing: VerificationData;
  className?: string;
}

function CheckItem({ checked, label, detail }: { checked: boolean; label: string; detail?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className={cn(
        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
        checked ? "bg-forest/10 text-forest" : "bg-ink-black/5 text-ink-faint"
      )}>
        {checked ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm", checked ? "font-medium text-ink-dark" : "text-ink-light")}>
          {label}
        </p>
        {detail && <div className="mt-0.5 text-xs text-ink-mid">{detail}</div>}
      </div>
    </div>
  );
}

/**
 * Full HorseProof verification section for listing detail pages.
 * Shows current tier badge + checklist of all verification items.
 */
export function VerificationChecklist({ listing, className }: VerificationChecklistProps) {
  const l = listing;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-ink-mid" />
          <h3 className="text-base font-semibold text-ink-black">HorseProof Verification</h3>
        </div>
        <VerificationBadge tier={l.verification_tier} />
      </div>

      <div className="divide-y divide-crease-light">
        <CheckItem
          checked={l.seller_identity_verified}
          label="Seller identity verified"
        />
        <CheckItem
          checked={l.trainer_endorsed}
          label="Trainer endorsed"
          detail={l.hp_trainer_name && l.trainer_endorsed ? `Endorsed by ${l.hp_trainer_name}` : undefined}
        />
        <CheckItem
          checked={l.standardized_video_complete}
          label="Standardized video complete"
        />
        <CheckItem
          checked={l.ppe_on_file}
          label="Pre-purchase exam on file"
          detail={l.ppe_on_file && l.ppe_document_url ? (
            <a href={l.ppe_document_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-oxblood hover:underline">
              View PPE document <ExternalLink className="h-3 w-3" />
            </a>
          ) : undefined}
        />
        <CheckItem
          checked={l.show_record_linked}
          label="Show record linked"
          detail={l.show_record_linked && l.show_record_url ? (
            <a href={l.show_record_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-oxblood hover:underline">
              View show record <ExternalLink className="h-3 w-3" />
            </a>
          ) : undefined}
        />
      </div>
    </div>
  );
}
