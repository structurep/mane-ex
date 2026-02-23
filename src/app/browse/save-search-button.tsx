"use client";

import { useState } from "react";
import { Bookmark, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SaveSearchButton({ params }: { params: Record<string, string | undefined> }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  const hasFilters = Object.values(params).some(v => v !== undefined);

  if (!hasFilters) return null;

  if (saved) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-forest/10 px-3 py-1.5 text-sm text-forest">
        <Bookmark className="h-4 w-4" />
        Search saved! View in your <a href="/dashboard" className="underline">dashboard</a>.
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name this search..."
          className="rounded-lg border border-border bg-paper-white px-3 py-1.5 text-sm text-ink-black placeholder:text-ink-light focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue"
        />
        <Button size="sm" onClick={() => { setSaved(true); setShowForm(false); }}>
          <Bell className="mr-1.5 h-3.5 w-3.5" />Save
        </Button>
        <button onClick={() => setShowForm(false)} className="rounded-md p-1 text-ink-light hover:text-ink-black">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="flex items-center gap-1.5 rounded-md bg-paper-cream px-3 py-1.5 text-sm font-medium text-ink-mid hover:bg-paper-warm hover:text-ink-black transition-colors"
    >
      <Bookmark className="h-4 w-4" />
      Save Search
    </button>
  );
}
