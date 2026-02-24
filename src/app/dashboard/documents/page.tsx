"use client";

import { useState } from "react";
import {
  Search,
  FileText,
  Image,
  Shield,
  Download,
  Share2,
  Eye,
  Upload,
  FolderOpen,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Types & sample data
// ---------------------------------------------------------------------------

type Document = {
  id: string;
  name: string;
  type: "ppe" | "xray" | "vet" | "registration" | "coggins" | "other";
  horse: string;
  horseId: string;
  size: string;
  uploadedAt: string;
  verified: boolean;
  expired: boolean;
  shares: number;
};

const sampleDocuments: Document[] = [
  { id: "1", name: "Pre-Purchase Exam Report", type: "ppe", horse: "Midnight Storm", horseId: "1", size: "2.4 MB", uploadedAt: "2024-12-15", verified: true, expired: false, shares: 3 },
  { id: "2", name: "X-Ray Series - Left Front", type: "xray", horse: "Midnight Storm", horseId: "1", size: "15.8 MB", uploadedAt: "2024-12-14", verified: true, expired: false, shares: 2 },
  { id: "3", name: "Annual Vet Check 2024", type: "vet", horse: "Midnight Storm", horseId: "1", size: "1.1 MB", uploadedAt: "2024-11-20", verified: false, expired: false, shares: 0 },
  { id: "4", name: "AQHA Registration", type: "registration", horse: "Golden Promise", horseId: "2", size: "540 KB", uploadedAt: "2024-10-05", verified: true, expired: false, shares: 1 },
  { id: "5", name: "Coggins Test 2024", type: "coggins", horse: "Golden Promise", horseId: "2", size: "320 KB", uploadedAt: "2024-09-15", verified: true, expired: true, shares: 0 },
  { id: "6", name: "USEF Competition Record", type: "other", horse: "Sapphire Blue", horseId: "3", size: "890 KB", uploadedAt: "2024-08-22", verified: false, expired: false, shares: 4 },
  { id: "7", name: "Pre-Purchase Exam Report", type: "ppe", horse: "Sapphire Blue", horseId: "3", size: "3.2 MB", uploadedAt: "2024-07-10", verified: true, expired: false, shares: 1 },
  { id: "8", name: "Vaccination Records", type: "vet", horse: "Golden Promise", horseId: "2", size: "420 KB", uploadedAt: "2024-06-30", verified: false, expired: false, shares: 0 },
];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

const categories = [
  { key: "all", label: "All Documents", icon: FolderOpen },
  { key: "ppe", label: "PPE Reports", icon: FileText },
  { key: "xray", label: "X-Rays", icon: Image },
  { key: "vet", label: "Vet Records", icon: FileText },
  { key: "registration", label: "Registration", icon: Shield },
  { key: "coggins", label: "Coggins", icon: FileText },
  { key: "other", label: "Other", icon: FolderOpen },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupByHorse(docs: Document[]): Record<string, Document[]> {
  const groups: Record<string, Document[]> = {};
  for (const doc of docs) {
    if (!groups[doc.horse]) {
      groups[doc.horse] = [];
    }
    groups[doc.horse].push(doc);
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function DocumentsVaultPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter by category
  const categoryFiltered =
    activeCategory === "all"
      ? sampleDocuments
      : sampleDocuments.filter((doc) => doc.type === activeCategory);

  // Filter by search
  const filtered = searchQuery
    ? categoryFiltered.filter((doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categoryFiltered;

  // Group by horse
  const grouped = groupByHorse(filtered);

  return (
    <>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-black">
            Documents Vault
          </h1>
          <p className="mt-1 text-sm text-ink-mid">
            Securely manage all your equine documents in one place.
          </p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      {/* Storage meter */}
      <div className="mb-6 rounded-lg border-0 bg-paper-cream p-4 shadow-flat">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-mid">Storage Used</span>
          <span className="font-medium text-ink-black">
            24.7 MB of 500 MB
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-paper-warm">
          <div
            className="h-2 rounded-full bg-blue"
            style={{ width: "5%" }}
          />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        {/* LEFT — Category sidebar */}
        <nav className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${
                activeCategory === cat.key
                  ? "bg-paper-white font-medium text-ink-black shadow-flat"
                  : "text-ink-mid hover:bg-paper-warm"
              }`}
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </button>
          ))}
        </nav>

        {/* RIGHT — Documents list */}
        <div>
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-light" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border-0 bg-paper-white py-2 pl-10 pr-4 text-sm text-ink-black shadow-flat placeholder:text-ink-light focus:shadow-folded focus:outline-none"
            />
          </div>

          {/* Document groups */}
          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-0 bg-paper-cream py-12 text-center shadow-flat">
              <FolderOpen className="mb-3 h-10 w-10 text-ink-light" />
              <p className="font-medium text-ink-black">No documents found</p>
              <p className="mt-1 text-sm text-ink-mid">
                Try a different search or category.
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([horseName, docs]) => (
              <div key={horseName} className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink-black">
                  <ChevronRight className="h-4 w-4" />
                  {horseName}{" "}
                  <span className="text-ink-light">({docs.length})</span>
                </h3>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 rounded-lg border-0 bg-paper-white p-3 shadow-flat"
                    >
                      {/* Icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-paper-cream">
                        <FileText className="h-5 w-5 text-ink-mid" />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink-black">
                          {doc.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-ink-light">
                          <span>{doc.size}</span>
                          <span>&middot;</span>
                          <span>{formatDate(doc.uploadedAt)}</span>
                          {doc.shares > 0 && (
                            <>
                              <span>&middot;</span>
                              <span>{doc.shares} shares</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-1">
                        {doc.verified && (
                          <Badge
                            variant="secondary"
                            className="gap-1 bg-forest/10 text-xs text-forest"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        {doc.expired && (
                          <Badge
                            variant="secondary"
                            className="gap-1 bg-red-light text-xs text-red"
                          >
                            <AlertCircle className="h-3 w-3" />
                            Expired
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button className="rounded-md p-2 text-ink-light hover:bg-paper-cream hover:text-ink-black">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-md p-2 text-ink-light hover:bg-paper-cream hover:text-ink-black">
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button className="rounded-md p-2 text-ink-light hover:bg-paper-cream hover:text-ink-black">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
