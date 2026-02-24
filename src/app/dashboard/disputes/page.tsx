"use client";

import { useState } from "react";
import {
  Shield,
  MessageSquare,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Types & sample data
// ---------------------------------------------------------------------------

type Dispute = {
  id: string;
  title: string;
  status: "in_review" | "in_mediation" | "resolved" | "escalated";
  horse: string;
  amount: number;
  description: string;
  messageCount: number;
  fileCount: number;
  mediator: string | null;
  createdAt: string;
  updatedAt: string;
  resolution: string | null;
};

const sampleDisputes: Dispute[] = [
  {
    id: "1",
    title: "Horse condition not as described",
    status: "in_mediation",
    horse: "Midnight Storm",
    amount: 45000,
    description:
      "Horse arrived with undisclosed lameness in left front. Vet exam shows pre-existing condition.",
    messageCount: 12,
    fileCount: 3,
    mediator: "ManeExchange Trust Team",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-22",
    resolution: null,
  },
  {
    id: "2",
    title: "Delayed delivery beyond agreed date",
    status: "in_review",
    horse: "Golden Promise",
    amount: 28000,
    description:
      "Seller has not shipped horse within 7-day window. No communication since payment.",
    messageCount: 5,
    fileCount: 1,
    mediator: null,
    createdAt: "2025-01-20",
    updatedAt: "2025-01-21",
    resolution: null,
  },
  {
    id: "3",
    title: "Missing registration papers",
    status: "resolved",
    horse: "Thunder Road",
    amount: 15000,
    description:
      "Registration transfer documents were not provided at delivery.",
    messageCount: 8,
    fileCount: 2,
    mediator: "ManeExchange Trust Team",
    createdAt: "2024-12-01",
    updatedAt: "2025-01-05",
    resolution:
      "Seller provided registration transfer within 14 days. Funds released with mutual agreement.",
  },
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

const statusColors: Record<string, string> = {
  in_review: "bg-gold/10 text-gold",
  in_mediation: "bg-blue/10 text-blue",
  resolved: "bg-forest/10 text-forest",
  escalated: "bg-red-light text-red",
};

const statusLabels: Record<string, string> = {
  in_review: "In Review",
  in_mediation: "In Mediation",
  resolved: "Resolved",
  escalated: "Escalated",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const tabs = ["Active", "Resolved", "All"] as const;
type Tab = (typeof tabs)[number];

export default function DisputesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Active");

  const filtered = sampleDisputes.filter((d) => {
    if (activeTab === "Active")
      return d.status === "in_review" || d.status === "in_mediation" || d.status === "escalated";
    if (activeTab === "Resolved") return d.status === "resolved";
    return true; // "All"
  });

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-black">
          Dispute Resolution
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          Manage and track your transaction disputes.
        </p>
      </div>

      {/* Protection banner */}
      <div className="mb-8 rounded-lg border border-forest/20 bg-forest/5 p-5">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
          <div>
            <h2 className="font-medium text-ink-black">
              Buyer &amp; Seller Protection
            </h2>
            <p className="mt-1 text-sm text-ink-mid">
              ManeExchange provides dispute resolution for all escrow
              transactions. Our team reviews every case within 24-48 hours,
              assigns expert mediators, and requires clear documentation from
              both parties.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-mid">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-forest" />
                24-48hr response
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-forest" />
                Expert mediators
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-forest" />
                Clear documentation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="mb-6 flex gap-1 rounded-lg bg-paper-cream p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-paper-white text-ink-black shadow-flat"
                : "text-ink-mid hover:text-ink-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dispute cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-0 bg-paper-white py-16 text-center shadow-flat">
          <AlertTriangle className="mb-3 h-10 w-10 text-ink-light" />
          <h3 className="text-lg font-medium text-ink-black">
            No disputes found.
          </h3>
          <p className="mt-1 text-sm text-ink-mid">
            There are no disputes matching this filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((dispute) => (
            <div
              key={dispute.id}
              className="rounded-lg border-0 bg-paper-white p-5 shadow-flat"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-ink-black">
                      {dispute.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={statusColors[dispute.status]}
                    >
                      {statusLabels[dispute.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink-mid">
                    {dispute.horse} &middot; $
                    {dispute.amount.toLocaleString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>

              <p className="mt-3 text-sm text-ink-mid">
                {dispute.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink-light">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {dispute.messageCount} messages
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {dispute.fileCount} files
                </span>
                {dispute.mediator && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {dispute.mediator}
                  </span>
                )}
                <span>Updated {formatDate(dispute.updatedAt)}</span>
              </div>

              {dispute.resolution && (
                <div className="mt-3 rounded-md bg-forest/5 p-3">
                  <p className="text-xs font-medium text-forest">Resolution</p>
                  <p className="mt-1 text-sm text-ink-mid">
                    {dispute.resolution}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
