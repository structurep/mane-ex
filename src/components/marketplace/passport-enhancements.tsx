"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Upload,
  Download,
  QrCode,
  Share2,
  Copy,
  Check,
  Mail,
  ExternalLink,
  Scissors,
  Wrench,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  EyeOff,
  X,
  Calendar,
} from "lucide-react";

/* ════════════════════════════════════════════════════════
   1. VERIFICATION TRUST BADGES
   ════════════════════════════════════════════════════════ */

export type VerificationLevel =
  | "registry_verified"
  | "vet_verified"
  | "document_verified"
  | "self_reported"
  | "unverified";

const VERIFICATION_CONFIG: Record<
  VerificationLevel,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
  }
> = {
  registry_verified: {
    label: "Registry Verified",
    icon: ShieldCheck,
    color: "text-forest",
    bgColor: "bg-forest/10",
  },
  vet_verified: {
    label: "Vet Verified",
    icon: ShieldCheck,
    color: "text-blue",
    bgColor: "bg-blue/10",
  },
  document_verified: {
    label: "Document on File",
    icon: Shield,
    color: "text-gold",
    bgColor: "bg-gold/10",
  },
  self_reported: {
    label: "Self-Reported",
    icon: Shield,
    color: "text-ink-light",
    bgColor: "bg-paper-warm",
  },
  unverified: {
    label: "Unverified",
    icon: ShieldAlert,
    color: "text-ink-faint",
    bgColor: "bg-paper-cream",
  },
};

export function VerificationBadge({
  level,
  compact = false,
}: {
  level: VerificationLevel;
  compact?: boolean;
}) {
  const config = VERIFICATION_CONFIG[level];
  const Icon = config.icon;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-[var(--radius-card)] ${config.bgColor} px-2 py-0.5 text-[10px] font-medium ${config.color}`}
        title={config.label}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-card)] ${config.bgColor} px-3 py-1 text-xs font-medium ${config.color}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   2. DOCUMENT VAULT
   ════════════════════════════════════════════════════════ */

export type PassportDocument = {
  id: string;
  name: string;
  type: "ppe_report" | "xray" | "coggins" | "insurance" | "registration" | "health_cert" | "other";
  uploadedAt: string;
  uploadedBy: string;
  fileSize: string;
  verified: boolean;
};

const DOC_TYPE_LABELS: Record<string, string> = {
  ppe_report: "PPE Report",
  xray: "X-Ray",
  coggins: "Coggins Test",
  insurance: "Insurance Certificate",
  registration: "Registration Papers",
  health_cert: "Health Certificate",
  other: "Other Document",
};

export function DocumentVault({
  documents,
  isOwner,
}: {
  documents: PassportDocument[];
  isOwner: boolean;
}) {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div>
      {/* Header with upload button */}
      {isOwner && (
        <div className="mb-3 flex items-center justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowUpload(!showUpload)}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Upload Document
          </Button>
        </div>
      )}

      {/* Upload area (collapsed by default) */}
      {showUpload && (
        <div className="mb-4 rounded-lg border-2 border-dashed border-crease-mid bg-paper-cream p-6 text-center">
          <Upload className="mx-auto h-8 w-8 text-ink-light" />
          <p className="mt-2 text-sm font-medium text-ink-black">
            Drop files here or click to browse
          </p>
          <p className="mt-1 text-xs text-ink-light">
            PDF, JPG, PNG up to 10MB. PPE reports, X-rays, Coggins,
            registration papers, insurance certificates.
          </p>
          <Button size="sm" className="mt-3" onClick={() => setShowUpload(false)}>
            Select Files
          </Button>
        </div>
      )}

      {/* Document list */}
      {documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-md bg-paper-cream p-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-paper-warm">
                <FileText className="h-4 w-4 text-ink-mid" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink-black">
                    {doc.name}
                  </p>
                  {doc.verified && (
                    <ShieldCheck className="h-3.5 w-3.5 text-forest" />
                  )}
                </div>
                <p className="text-xs text-ink-light">
                  {DOC_TYPE_LABELS[doc.type]} · {doc.fileSize} · Uploaded{" "}
                  {new Date(doc.uploadedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Button size="sm" variant="ghost">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-crease-mid bg-paper-cream p-6 text-center">
          <FileText className="mx-auto h-8 w-8 text-ink-light" />
          <p className="mt-2 text-sm text-ink-mid">No documents uploaded yet</p>
          <p className="mt-1 text-xs text-ink-light">
            Upload PPE reports, X-rays, and registration papers to build a
            complete provenance record.
          </p>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   3. QR CODE GENERATOR
   ════════════════════════════════════════════════════════ */

export function PassportQRCode({
  passportId,
  horseName,
  passportUrl,
}: {
  passportId: string;
  horseName: string;
  passportUrl: string;
}) {
  // Generate a visual QR code placeholder (real QR would use a library)
  // Using a grid pattern that represents a QR code visually
  const size = 8;
  const pattern = generateQRPattern(passportId, size);

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-crease-light bg-paper-white p-4">
      {/* QR Code visual */}
      <div className="rounded-md bg-paper-white p-2">
        <div
          className="grid gap-0"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
        >
          {pattern.map((filled, i) => (
            <div
              key={i}
              className={`h-3 w-3 ${filled ? "bg-ink-black" : "bg-paper-white"}`}
            />
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] font-medium tracking-widest text-ink-light">
          {passportId}
        </p>
        <p className="text-xs text-ink-mid">{horseName}</p>
      </div>

      <p className="text-[10px] text-ink-light text-center">
        Scan or share this code to view the digital passport.
        Print it for barn use or show documentation.
      </p>
    </div>
  );
}

// Deterministic pattern generator based on passport ID
function generateQRPattern(id: string, size: number): boolean[] {
  const grid: boolean[] = [];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }

  for (let i = 0; i < size * size; i++) {
    // Fixed corners (finder patterns)
    const row = Math.floor(i / size);
    const col = i % size;
    if (
      (row < 2 && col < 2) ||
      (row < 2 && col >= size - 2) ||
      (row >= size - 2 && col < 2)
    ) {
      grid.push(true);
    } else {
      hash = ((hash << 3) ^ (hash >>> 2) ^ i) | 0;
      grid.push((hash & (1 << (i % 31))) !== 0);
    }
  }
  return grid;
}

/* ════════════════════════════════════════════════════════
   4. SHARE / EXPORT CONTROLS
   ════════════════════════════════════════════════════════ */

export function PassportShareControls({
  passportUrl,
  horseName,
  passportId,
}: {
  passportUrl: string;
  horseName: string;
  passportId: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(passportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={copyLink}>
          {copied ? (
            <Check className="mr-1.5 h-3.5 w-3.5 text-forest" />
          ) : (
            <Copy className="mr-1.5 h-3.5 w-3.5" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowShareModal(true)}
        >
          <Share2 className="mr-1.5 h-3.5 w-3.5" />
          Share
        </Button>

        <Button size="sm" variant="outline">
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export PDF
        </Button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-paper-white shadow-hovering">
            <div className="flex items-center justify-between border-b border-crease-light px-6 py-4">
              <h3 className="font-heading text-base font-semibold text-ink-black">
                Share Passport
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="rounded-full p-1.5 text-ink-light hover:bg-paper-warm hover:text-ink-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <p className="text-sm text-ink-mid">
                Share {horseName}&apos;s passport with your trainer, vet, or
                potential buyers.
              </p>

              {/* Quick share options */}
              <div className="space-y-2">
                <button
                  onClick={copyLink}
                  className="flex w-full items-center gap-3 rounded-md bg-paper-cream p-3 text-left transition-colors hover:bg-paper-warm"
                >
                  <Copy className="h-4 w-4 text-ink-mid" />
                  <div>
                    <p className="text-sm font-medium text-ink-black">
                      Copy Link
                    </p>
                    <p className="text-xs text-ink-light">
                      Anyone with the link can view
                    </p>
                  </div>
                </button>

                <button className="flex w-full items-center gap-3 rounded-md bg-paper-cream p-3 text-left transition-colors hover:bg-paper-warm">
                  <Mail className="h-4 w-4 text-ink-mid" />
                  <div>
                    <p className="text-sm font-medium text-ink-black">
                      Send via Email
                    </p>
                    <p className="text-xs text-ink-light">
                      Send passport link directly
                    </p>
                  </div>
                </button>

                <button className="flex w-full items-center gap-3 rounded-md bg-paper-cream p-3 text-left transition-colors hover:bg-paper-warm">
                  <ExternalLink className="h-4 w-4 text-ink-mid" />
                  <div>
                    <p className="text-sm font-medium text-ink-black">
                      Send to Trainer
                    </p>
                    <p className="text-xs text-ink-light">
                      Notify a ManeExchange trainer
                    </p>
                  </div>
                </button>
              </div>

              {/* Privacy note */}
              <div className="rounded-md bg-paper-warm p-3">
                <div className="flex items-center gap-2 text-xs">
                  <Eye className="h-3.5 w-3.5 text-ink-light" />
                  <span className="text-ink-mid">
                    Shared passports show all public sections. Health notes and
                    financial details require owner permission.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════
   5. HENNEKE BCS HISTORY
   ════════════════════════════════════════════════════════ */

type BCSEntry = {
  date: string;
  score: number;
  assessedBy: string;
};

const BCS_COLORS: Record<number, string> = {
  1: "bg-red", 2: "bg-red", 3: "bg-amber-500",
  4: "bg-forest", 5: "bg-forest", 6: "bg-forest",
  7: "bg-amber-500", 8: "bg-red", 9: "bg-red",
};

export function HennekeBCSHistory({
  entries,
  currentScore,
}: {
  entries: BCSEntry[];
  currentScore: number | null;
}) {
  if (!currentScore && entries.length === 0) return null;

  const trend =
    entries.length >= 2
      ? entries[0].score - entries[entries.length - 1].score
      : 0;

  return (
    <div>
      {/* Current Score */}
      {currentScore && (
        <div className="mb-4 flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-paper-white ${BCS_COLORS[currentScore] || "bg-ink-light"}`}
          >
            {currentScore}
          </div>
          <div>
            <p className="text-sm font-medium text-ink-black">
              Current BCS: {currentScore}/9
            </p>
            <p className="text-xs text-ink-mid">
              {currentScore >= 4 && currentScore <= 6
                ? "Ideal range"
                : currentScore < 4
                  ? "Below ideal — monitor nutrition"
                  : "Above ideal — monitor diet"}
            </p>
            {trend !== 0 && (
              <span
                className={`inline-flex items-center gap-1 text-xs ${
                  Math.abs(trend) <= 1 ? "text-forest" : "text-amber-500"
                }`}
              >
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                {trend > 0 ? "+" : ""}
                {trend} over {entries.length} assessments
              </span>
            )}
          </div>
        </div>
      )}

      {/* History timeline */}
      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-md bg-paper-cream p-2.5"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-paper-white ${BCS_COLORS[entry.score] || "bg-ink-light"}`}
              >
                {entry.score}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-black">
                  BCS {entry.score}/9
                </p>
                <p className="text-[10px] text-ink-light">
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {entry.assessedBy}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   6. FARRIER & MAINTENANCE LOG
   ════════════════════════════════════════════════════════ */

type FarrierEntry = {
  date: string;
  type: "trim" | "full_shoe" | "front_only" | "corrective" | "pull_shoes";
  farrier: string;
  notes?: string;
  nextDue?: string;
};

const FARRIER_TYPE_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  trim: { label: "Barefoot Trim", icon: Scissors },
  full_shoe: { label: "Full Set (4 shoes)", icon: Wrench },
  front_only: { label: "Front Shoes Only", icon: Wrench },
  corrective: { label: "Corrective Shoeing", icon: Wrench },
  pull_shoes: { label: "Shoes Pulled", icon: Scissors },
};

export function FarrierLog({
  entries,
  nextDue,
}: {
  entries: FarrierEntry[];
  nextDue?: string;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-ink-light">
        No farrier records have been added to this passport.
      </p>
    );
  }

  return (
    <div>
      {/* Next due alert */}
      {nextDue && (
        <div className="mb-3 flex items-center gap-2 rounded-md bg-gold/10 px-3 py-2 text-xs font-medium text-gold">
          <Calendar className="h-3.5 w-3.5" />
          Next appointment:{" "}
          {new Date(nextDue).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      )}

      {/* Entry list */}
      <div className="space-y-2">
        {entries.map((entry, i) => {
          const typeConfig = FARRIER_TYPE_LABELS[entry.type] || {
            label: entry.type,
            icon: Wrench,
          };
          const Icon = typeConfig.icon;

          return (
            <div
              key={i}
              className="flex items-start gap-3 rounded-md bg-paper-cream p-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-warm">
                <Icon className="h-4 w-4 text-ink-mid" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-black">
                  {typeConfig.label}
                </p>
                <p className="text-xs text-ink-light">
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {entry.farrier}
                </p>
                {entry.notes && (
                  <p className="mt-1 text-xs text-ink-mid">{entry.notes}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   7. VISIBILITY CONTROLS (Owner only)
   ════════════════════════════════════════════════════════ */

export function SectionVisibilityToggle({
  section,
  isVisible,
  onToggle,
}: {
  section: string;
  isVisible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1 rounded-[var(--radius-card)] bg-paper-warm px-2 py-0.5 text-[10px] font-medium text-ink-light transition-colors hover:text-ink-mid"
      title={isVisible ? `Hide ${section} from public view` : `Show ${section} publicly`}
    >
      {isVisible ? (
        <Eye className="h-3 w-3" />
      ) : (
        <EyeOff className="h-3 w-3" />
      )}
      {isVisible ? "Public" : "Hidden"}
    </button>
  );
}
