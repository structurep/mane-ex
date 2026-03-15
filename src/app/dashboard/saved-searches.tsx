"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Bookmark, Bell, BellOff, Trash2, Loader2 } from "lucide-react";
import { StackedList, type StackedListItem, SectionHeading } from "@/components/tailwind-plus";
import {
  getSavedSearches,
  deleteSavedSearch,
  toggleSavedSearchAlerts,
  type SavedSearch,
} from "@/actions/saved-searches";

export function SavedSearchesWidget() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    getSavedSearches().then((data) => {
      setSearches(data);
      setLoading(false);
    });
  }, []);

  function handleToggleAlerts(id: string, current: boolean) {
    startTransition(async () => {
      const result = await toggleSavedSearchAlerts(id, !current);
      if (result.ok) {
        setSearches((prev) =>
          prev.map((s) => (s.id === id ? { ...s, alerts: !current } : s))
        );
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteSavedSearch(id);
      if (result.ok) {
        setSearches((prev) => prev.filter((s) => s.id !== id));
      }
    });
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-ink-faint">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading saved searches...
      </div>
    );
  }

  if (searches.length === 0) return null;

  const items: StackedListItem[] = searches.map((search) => {
    const searchParams = new URLSearchParams(
      Object.entries(search.filters).filter(([, v]) => v) as [string, string][]
    ).toString();

    const filterSummary = Object.entries(search.filters)
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");

    return {
      id: search.id,
      href: `/browse?${searchParams}`,
      initials: search.name.charAt(0).toUpperCase(),
      title: search.name,
      subtitle: filterSummary || "All listings",
      meta: (
        <span className="text-xs text-ink-faint">
          {new Date(search.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
      badge: (
        <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
          <button
            onClick={() => handleToggleAlerts(search.id, search.alerts)}
            className={`rounded-md p-1.5 transition-colors ${
              search.alerts
                ? "text-oxblood hover:bg-oxblood/10"
                : "text-ink-faint hover:bg-paper-warm"
            }`}
            title={search.alerts ? "Disable alerts" : "Enable alerts"}
          >
            {search.alerts ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => handleDelete(search.id)}
            className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-red-light hover:text-red"
            title="Delete saved search"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    };
  });

  return (
    <div>
      <SectionHeading
        title="Saved Searches"
        actions={
          <Link
            href="/browse"
            className="text-sm font-medium text-oxblood hover:underline"
          >
            Browse
          </Link>
        }
      />
      <div className="mt-2 rounded-lg bg-paper-cream px-4 shadow-flat">
        <StackedList items={items} />
      </div>
    </div>
  );
}
