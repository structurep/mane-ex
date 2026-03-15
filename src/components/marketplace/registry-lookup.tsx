"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ─── Registry types ─── */

export type RegistryType =
  | "aqha"
  | "usef"
  | "usdf"
  | "ushja"
  | "jockey_club"
  | "other";

const registries: {
  value: RegistryType;
  label: string;
  placeholder: string;
  pattern: string;
  website: string;
}[] = [
  {
    value: "aqha",
    label: "AQHA",
    placeholder: "e.g. 5678901",
    pattern: "7-digit AQHA number",
    website: "https://www.aqha.com",
  },
  {
    value: "usef",
    label: "USEF",
    placeholder: "e.g. 5234567",
    pattern: "7-digit USEF number",
    website: "https://www.usef.org",
  },
  {
    value: "usdf",
    label: "USDF",
    placeholder: "e.g. 12345",
    pattern: "USDF horse ID",
    website: "https://www.usdf.org",
  },
  {
    value: "ushja",
    label: "USHJA",
    placeholder: "e.g. US12345",
    pattern: "USHJA registration",
    website: "https://www.ushja.org",
  },
  {
    value: "jockey_club",
    label: "Jockey Club (TB)",
    placeholder: "e.g. AB1234567",
    pattern: "Jockey Club registration",
    website: "https://www.jockeyclub.com",
  },
  {
    value: "other",
    label: "Other Registry",
    placeholder: "Registration number",
    pattern: "Registry-specific format",
    website: "",
  },
];

export interface RegistryRecord {
  registry: RegistryType;
  registrationNumber: string;
  registeredName?: string;
  verificationStatus: "pending" | "verified" | "unverified" | "not_found";
  verifiedAt?: string;
}

/* ─── Lookup component (listing wizard) ─── */

interface RegistryLookupProps {
  records: RegistryRecord[];
  onChange: (records: RegistryRecord[]) => void;
}

export function RegistryLookup({ records, onChange }: RegistryLookupProps) {
  const [selectedRegistry, setSelectedRegistry] = useState<RegistryType>("usef");
  const [regNumber, setRegNumber] = useState("");
  const [registeredName, setRegisteredName] = useState("");
  const [isLooking, setIsLooking] = useState(false);
  const [lookupResult, setLookupResult] = useState<
    "idle" | "found" | "not_found"
  >("idle");

  const registry = registries.find((r) => r.value === selectedRegistry)!;

  async function handleLookup() {
    if (!regNumber.trim()) return;

    setIsLooking(true);
    setLookupResult("idle");

    // Simulate API lookup (will be replaced with real registry APIs)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // For now, all lookups return "pending verification"
    // Real integration would call AQHA/USEF APIs and return verified data
    setIsLooking(false);
    setLookupResult("found");
  }

  function addRecord() {
    const newRecord: RegistryRecord = {
      registry: selectedRegistry,
      registrationNumber: regNumber.trim(),
      registeredName: registeredName.trim() || undefined,
      verificationStatus: "pending",
    };

    onChange([...records, newRecord]);
    setRegNumber("");
    setRegisteredName("");
    setLookupResult("idle");
  }

  function removeRecord(index: number) {
    onChange(records.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <Label className="text-sm font-medium text-ink-black">
          Registry Verification
        </Label>
        <span className="text-[10px] text-ink-light">
          Verified listings attract more serious inquiries
        </span>
      </div>

      {/* Existing records */}
      {records.length > 0 && (
        <div className="space-y-2">
          {records.map((record, i) => {
            const reg = registries.find((r) => r.value === record.registry);
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-crease-light bg-paper-white p-3"
              >
                <div className="flex items-center gap-3">
                  <VerificationBadge status={record.verificationStatus} />
                  <div>
                    <p className="text-sm font-medium text-ink-black">
                      {reg?.label} — {record.registrationNumber}
                    </p>
                    {record.registeredName && (
                      <p className="text-xs text-ink-mid">
                        {record.registeredName}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeRecord(i)}
                  className="text-xs text-ink-light hover:text-red"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new record */}
      <div className="rounded-lg border border-crease-light bg-paper-cream p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Registry selector */}
          <div>
            <Label className="text-xs">Registry</Label>
            <select
              value={selectedRegistry}
              onChange={(e) => {
                setSelectedRegistry(e.target.value as RegistryType);
                setLookupResult("idle");
              }}
              className="mt-1 w-full rounded-md border border-crease-light bg-paper-white px-3 py-2 text-sm text-ink-black focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {registries.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Registration number */}
          <div>
            <Label className="text-xs">Registration Number</Label>
            <div className="relative mt-1">
              <Input
                value={regNumber}
                onChange={(e) => {
                  setRegNumber(e.target.value);
                  setLookupResult("idle");
                }}
                placeholder={registry.placeholder}
                className="pr-10"
              />
              {regNumber && (
                <button
                  type="button"
                  onClick={handleLookup}
                  disabled={isLooking}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-light hover:text-primary"
                  title="Look up registration"
                >
                  {isLooking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            <p className="mt-0.5 text-[10px] text-ink-light">
              {registry.pattern}
            </p>
          </div>
        </div>

        {/* Registered name (optional) */}
        <div className="mt-3">
          <Label className="text-xs">Registered Name (if different from listing name)</Label>
          <Input
            value={registeredName}
            onChange={(e) => setRegisteredName(e.target.value)}
            placeholder="Official registered name"
            className="mt-1"
          />
        </div>

        {/* Lookup result */}
        {lookupResult === "found" && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-forest/5 px-3 py-2 text-sm text-forest">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>
              Registration number recorded. We&apos;ll verify with{" "}
              {registry.label} and update your listing.
            </span>
          </div>
        )}

        {lookupResult === "not_found" && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-gold/10 px-3 py-2 text-sm text-gold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Could not verify automatically. You can still add it — we&apos;ll
              review manually.
            </span>
          </div>
        )}

        {/* Add button */}
        <div className="mt-3 flex items-center justify-between">
          <Button
            type="button"
            size="sm"
            onClick={addRecord}
            disabled={!regNumber.trim()}
          >
            <Shield className="mr-1.5 h-3.5 w-3.5" />
            Add Registration
          </Button>
          {registry.website && (
            <a
              href={registry.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {registry.label} website
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs text-ink-light">
        Registry verification links your horse to official breed and competition
        records. Verified registrations appear as badges on your listing and
        increase your Mane Score.
      </p>
    </div>
  );
}

/* ─── Verification badge ─── */

function VerificationBadge({
  status,
}: {
  status: RegistryRecord["verificationStatus"];
}) {
  switch (status) {
    case "verified":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest/10">
          <CheckCircle className="h-4 w-4 text-forest" />
        </span>
      );
    case "pending":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10">
          <Loader2 className="h-4 w-4 text-gold" />
        </span>
      );
    case "not_found":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-light">
          <AlertCircle className="h-4 w-4 text-red" />
        </span>
      );
    default:
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-warm">
          <Shield className="h-4 w-4 text-ink-light" />
        </span>
      );
  }
}

/* ─── Display badges (for listing detail page) ─── */

interface RegistryBadgesProps {
  records: RegistryRecord[];
}

export function RegistryBadges({ records }: RegistryBadgesProps) {
  if (!records || records.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {records.map((record, i) => {
        const reg = registries.find((r) => r.value === record.registry);
        const isVerified = record.verificationStatus === "verified";

        return (
          <span
            key={i}
            className={`inline-flex items-center gap-1.5 rounded-[var(--radius-card)] px-3 py-1 text-xs font-medium ${
              isVerified
                ? "bg-forest/10 text-forest"
                : "bg-paper-warm text-ink-mid"
            }`}
            title={`${reg?.label} #${record.registrationNumber}${
              isVerified ? " — Verified" : " — Pending verification"
            }`}
          >
            {isVerified ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <Shield className="h-3 w-3" />
            )}
            {reg?.label}
            {isVerified && " Verified"}
          </span>
        );
      })}
    </div>
  );
}
