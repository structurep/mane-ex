"use client";

import { useState } from "react";
import { Bookmark, Bell, BellOff, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertBanner } from "@/components/tailwind-plus";
import { createSavedSearch } from "@/actions/saved-searches";

export function SaveSearchButton({ params }: { params: Record<string, string | undefined> }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [alerts, setAlerts] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFilters = Object.values(params).some(v => v !== undefined);

  if (!hasFilters) return null;

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);

    // Build clean filters object (only non-empty values)
    const filters: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v) filters[k] = v;
    }

    const result = await createSavedSearch(name.trim(), filters, alerts);
    setSaving(false);

    if (result.ok) {
      setSaved(true);
      setShowForm(false);
    } else {
      setError(result.error || "Failed to save search");
    }
  }

  if (saved) {
    return (
      <AlertBanner variant="success" title="Search saved">
        <p>
          {alerts ? "You'll get notified when new listings match. " : ""}
          View saved searches in your{" "}
          <a href="/dashboard" className="font-medium underline">dashboard</a>.
        </p>
      </AlertBanner>
    );
  }

  if (showForm) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-crease-light bg-paper-cream p-4 shadow-flat sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
            Search name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Hunter mare under $30K"
            autoFocus
            className="mt-1.5 w-full rounded-lg border border-crease-light bg-paper-white px-3 py-2 text-sm text-ink-black placeholder:text-ink-faint focus:border-saddle focus:outline-none focus:ring-1 focus:ring-saddle/20"
          />
        </div>

        {/* Alert toggle */}
        <button
          type="button"
          onClick={() => setAlerts(!alerts)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
            alerts
              ? "border-saddle/20 bg-saddle/5 text-saddle"
              : "border-crease-light bg-paper-white text-ink-mid hover:border-ink-light"
          }`}
        >
          {alerts ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
          {alerts ? "Alerts on" : "Alerts off"}
        </button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!name.trim() || saving}
          >
            {saving ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="mr-1.5 h-3.5 w-3.5" />
            )}
            {saving ? "Saving..." : "Save"}
          </Button>
          <button
            onClick={() => setShowForm(false)}
            className="rounded-md p-1.5 text-ink-faint hover:bg-paper-warm hover:text-ink-dark"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <p className="text-xs text-red">{error}</p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="flex items-center gap-1.5 rounded-[var(--radius-card)] border border-crease-light bg-paper-white px-3 py-1.5 text-[13px] font-medium text-ink-mid transition-colors hover:border-ink-light hover:text-ink-dark"
    >
      <Bookmark className="h-3.5 w-3.5" />
      Save Search
    </button>
  );
}
