"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

type Props = {
  params: Record<string, string | undefined>;
};

const disciplines = [
  "Hunter", "Jumper", "Equitation", "Hunter/Jumper", "Dressage",
  "Eventing", "Show Jumping", "Western Pleasure", "Reining",
];

const genders = [
  { value: "mare", label: "Mare" },
  { value: "gelding", label: "Gelding" },
  { value: "stallion", label: "Stallion" },
];

const US_STATES = [
  "FL", "CA", "KY", "NY", "VA", "SC", "TX", "NC", "GA", "PA",
  "NJ", "MD", "CT", "MA", "CO", "AZ", "OR", "WA", "OH", "IL",
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "score", label: "Completeness Score" },
];

export function BrowseFilters({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (value) {
        sp.set(key, value);
      } else {
        sp.delete(key);
      }
      sp.delete("page"); // reset pagination on filter change
      router.push(`/browse?${sp.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    router.push("/browse");
  };

  const hasFilters = Object.values(params).some(Boolean);

  return (
    <div className="space-y-6 rounded-lg border border-border bg-paper-cream p-4 shadow-flat">
      {/* Search */}
      <div>
        <Label htmlFor="search" className="text-xs">
          Search
        </Label>
        <div className="relative mt-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-light" />
          <Input
            id="search"
            placeholder="Search horses..."
            defaultValue={params.q || ""}
            className="pl-8"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilter("q", (e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>
      </div>

      {/* Discipline */}
      <div>
        <Label className="text-xs">Discipline</Label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {disciplines.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() =>
                updateFilter("discipline", params.discipline === d ? "" : d)
              }
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                params.discipline === d
                  ? "bg-ink-black text-paper-white"
                  : "bg-paper-warm text-ink-mid hover:bg-paper-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-xs">Price Range</Label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min $"
            defaultValue={params.minPrice || ""}
            onBlur={(e) => updateFilter("minPrice", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max $"
            defaultValue={params.maxPrice || ""}
            onBlur={(e) => updateFilter("maxPrice", e.target.value)}
          />
        </div>
      </div>

      {/* State */}
      <div>
        <Label className="text-xs">Location</Label>
        <select
          value={params.state || ""}
          onChange={(e) => updateFilter("state", e.target.value)}
          className="mt-1.5 w-full rounded-md border border-border bg-paper-white px-3 py-2 text-sm"
        >
          <option value="">All States</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Gender */}
      <div>
        <Label className="text-xs">Gender</Label>
        <div className="mt-1.5 flex gap-1.5">
          {genders.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() =>
                updateFilter("gender", params.gender === g.value ? "" : g.value)
              }
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                params.gender === g.value
                  ? "bg-ink-black text-paper-white"
                  : "bg-paper-warm text-ink-mid hover:bg-paper-white"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Height */}
      <div>
        <Label className="text-xs">Height (hands)</Label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <Input
            type="number"
            step="0.1"
            placeholder="Min"
            defaultValue={params.minHeight || ""}
            onBlur={(e) => updateFilter("minHeight", e.target.value)}
          />
          <Input
            type="number"
            step="0.1"
            placeholder="Max"
            defaultValue={params.maxHeight || ""}
            onBlur={(e) => updateFilter("maxHeight", e.target.value)}
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <Label className="text-xs">Sort By</Label>
        <select
          value={params.sort || "newest"}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="mt-1.5 w-full rounded-md border border-border bg-paper-white px-3 py-2 text-sm"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={clearFilters}
        >
          <X className="mr-1 h-3 w-3" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
