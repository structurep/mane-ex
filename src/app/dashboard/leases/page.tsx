"use client";

import { useState } from "react";
import {
  FileText,
  Calendar,
  DollarSign,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types & sample data
// ---------------------------------------------------------------------------

type Lease = {
  id: string;
  horse: string;
  status: "active" | "pending" | "completed" | "cancelled";
  leaseType: "full" | "half" | "partial";
  role: "lessor" | "lessee";
  counterparty: string;
  startDate: string;
  endDate: string;
  monthlyRate: number;
  nextPayment: string | null;
};

const sampleLeases: Lease[] = [
  {
    id: "1",
    horse: "Midnight Storm",
    status: "active",
    leaseType: "full",
    role: "lessor",
    counterparty: "Jennifer Adams",
    startDate: "2024-09-01",
    endDate: "2025-08-31",
    monthlyRate: 2500,
    nextPayment: "2025-02-01",
  },
  {
    id: "2",
    horse: "Golden Promise",
    status: "active",
    leaseType: "half",
    role: "lessee",
    counterparty: "Sarah Mitchell",
    startDate: "2024-11-01",
    endDate: "2025-04-30",
    monthlyRate: 1500,
    nextPayment: "2025-02-01",
  },
  {
    id: "3",
    horse: "Sapphire Blue",
    status: "pending",
    leaseType: "full",
    role: "lessor",
    counterparty: "Michael Chen",
    startDate: "2025-03-01",
    endDate: "2025-08-31",
    monthlyRate: 3000,
    nextPayment: null,
  },
  {
    id: "4",
    horse: "Thunder Road",
    status: "completed",
    leaseType: "partial",
    role: "lessee",
    counterparty: "Emily Davis",
    startDate: "2024-03-01",
    endDate: "2024-12-31",
    monthlyRate: 800,
    nextPayment: null,
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
  active: "bg-forest/10 text-forest",
  pending: "bg-gold/10 text-gold",
  completed: "bg-ink-light/10 text-ink-mid",
  cancelled: "bg-red-light text-red",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LeasesPage() {
  const [activeTab, setActiveTab] = useState("Leases");
  const leases = sampleLeases;

  const activeCount = leases.filter((l) => l.status === "active").length;
  const upcomingCount = leases.filter((l) => l.status === "pending").length;
  const pendingPayments = leases
    .filter((l) => l.status === "active" && l.nextPayment)
    .reduce((sum, l) => sum + l.monthlyRate, 0);
  const monthlyIncome = leases
    .filter((l) => l.status === "active" && l.role === "lessor")
    .reduce((sum, l) => sum + l.monthlyRate, 0);

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-black">Lease Management</h1>
        <p className="mt-1 text-sm text-ink-mid">
          Manage your horse leases and trial agreements.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat">
          <div className="flex items-center gap-2 text-sm text-ink-mid">
            <FileText className="h-4 w-4" />
            Active Leases
          </div>
          <p className="mt-1 font-serif text-2xl font-bold text-ink-black">
            {activeCount}
          </p>
        </div>

        <div className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat">
          <div className="flex items-center gap-2 text-sm text-ink-mid">
            <Calendar className="h-4 w-4" />
            Upcoming
          </div>
          <p className="mt-1 font-serif text-2xl font-bold text-ink-black">
            {upcomingCount}
          </p>
        </div>

        <div className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat">
          <div className="flex items-center gap-2 text-sm text-ink-mid">
            <DollarSign className="h-4 w-4" />
            Pending Payments
          </div>
          <p className="mt-1 font-serif text-2xl font-bold text-ink-black">
            ${pendingPayments.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat">
          <div className="flex items-center gap-2 text-sm text-ink-mid">
            <DollarSign className="h-4 w-4" />
            Monthly Income
          </div>
          <p className="mt-1 font-serif text-2xl font-bold text-ink-black">
            ${monthlyIncome.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="mb-6 flex gap-1 rounded-lg bg-paper-cream p-1">
        {["Leases", "Trials"].map((tab) => (
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

      {/* Tab content */}
      {activeTab === "Leases" && (
        <>
          {leases.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-0 bg-paper-white py-16 text-center shadow-flat">
              <AlertCircle className="mb-3 h-10 w-10 text-ink-light" />
              <h3 className="text-lg font-medium text-ink-black">
                No leases yet
              </h3>
              <p className="mt-1 text-sm text-ink-mid">
                Browse available horses to start a lease agreement.
              </p>
              <Button asChild className="mt-4">
                <Link href="/browse">Browse Horses</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {leases.map((lease) => (
                <div
                  key={lease.id}
                  className="rounded-lg border-0 bg-paper-white p-5 shadow-flat"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-ink-black">
                          {lease.horse}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={statusColors[lease.status]}
                        >
                          {lease.status}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {lease.leaseType} Lease
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-ink-mid">
                        {lease.role === "lessor" ? "Leased to" : "Leased from"}{" "}
                        {lease.counterparty}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-ink-light">Start Date</p>
                      <p className="text-sm font-medium text-ink-black">
                        {formatDate(lease.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-light">End Date</p>
                      <p className="text-sm font-medium text-ink-black">
                        {formatDate(lease.endDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-light">Monthly Rate</p>
                      <p className="text-sm font-medium text-ink-black">
                        ${lease.monthlyRate.toLocaleString()}
                      </p>
                    </div>
                    {lease.nextPayment && (
                      <div>
                        <p className="text-xs text-ink-light">Next Payment</p>
                        <p className="text-sm font-medium text-gold">
                          {formatDate(lease.nextPayment)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "Trials" && (
        <div className="flex flex-col items-center justify-center rounded-lg border-0 bg-paper-white py-16 text-center shadow-flat">
          <Calendar className="mb-3 h-10 w-10 text-ink-light" />
          <h3 className="text-lg font-medium text-ink-black">
            Trial Management
          </h3>
          <p className="mt-2 text-sm text-ink-mid">
            Trial management is available in the Trials &amp; Tours section.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/trials">
              Go to Trials &amp; Tours
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
