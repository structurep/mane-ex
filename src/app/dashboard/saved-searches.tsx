"use client";

import Link from "next/link";
import { Bookmark, Bell, BellOff, Trash2 } from "lucide-react";

// Sample saved searches (would come from DB in production)
const sampleSearches = [
  { id: "1", name: "Wellington Jumpers", filters: { discipline: "Hunter/Jumper", state: "FL", minPrice: "25000", maxPrice: "75000" }, alerts: true, matchCount: 12, lastChecked: "2h ago" },
  { id: "2", name: "Young Dressage Prospects", filters: { discipline: "Dressage", minPrice: "15000", maxPrice: "40000" }, alerts: true, matchCount: 8, lastChecked: "5h ago" },
  { id: "3", name: "Under $30K Eventers", filters: { discipline: "Eventing", maxPrice: "30000" }, alerts: false, matchCount: 5, lastChecked: "1d ago" },
];

export function SavedSearchesWidget() {
  if (sampleSearches.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-ink-black">Saved Searches</h2>
        <Link href="/browse" className="text-sm text-blue hover:underline">Browse</Link>
      </div>
      <div className="space-y-2">
        {sampleSearches.map((search) => {
          const searchParams = new URLSearchParams(
            Object.entries(search.filters).filter(([, v]) => v) as [string, string][]
          ).toString();
          return (
            <Link
              key={search.id}
              href={`/browse?${searchParams}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-paper-white p-3 transition-colors hover:bg-paper-cream"
            >
              <Bookmark className="h-4 w-4 shrink-0 text-ink-mid" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-black">{search.name}</p>
                <p className="text-xs text-ink-light">{search.matchCount} matches · {search.lastChecked}</p>
              </div>
              {search.alerts ? (
                <Bell className="h-4 w-4 shrink-0 text-forest" />
              ) : (
                <BellOff className="h-4 w-4 shrink-0 text-ink-light" />
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
