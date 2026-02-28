"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  params: Record<string, string | undefined>;
};

const disciplines = [
  "Hunter/Jumper", "Dressage", "Eventing", "Western Pleasure", "Reining",
  "Hunter", "Jumper", "Equitation", "Show Jumping", "Trail",
];

const breeds = [
  "Thoroughbred", "Warmblood", "Quarter Horse", "Hanoverian", "Holsteiner",
  "Dutch Warmblood", "Oldenburg", "Trakehner", "Irish Sport Horse", "Appendix",
  "Paint", "Arabian", "Morgan", "Friesian", "Andalusian",
];

const genders = [
  { value: "mare", label: "Mare" },
  { value: "gelding", label: "Gelding" },
  { value: "stallion", label: "Stallion" },
];

const US_REGIONS: { label: string; states: string[] }[] = [
  { label: "Southeast", states: ["FL", "GA", "SC", "NC", "VA", "KY", "TN", "AL", "MS", "LA"] },
  { label: "Northeast", states: ["NY", "NJ", "PA", "CT", "MA", "MD", "NH", "VT", "ME", "RI"] },
  { label: "Midwest", states: ["OH", "IL", "MI", "IN", "WI", "MN", "MO", "IA", "KS", "NE"] },
  { label: "West", states: ["CA", "OR", "WA", "CO", "MT", "ID", "WY", "UT", "NV"] },
  { label: "Southwest", states: ["TX", "AZ", "NM", "OK", "AR"] },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "score", label: "Mane Score" },
  { value: "popular", label: "Most Saved" },
];

const soundnessOptions = [
  { value: "vet_confirmed_sound", label: "Vet-confirmed sound" },
  { value: "minor_findings", label: "Minor findings" },
  { value: "managed_condition", label: "Managed condition" },
  { value: "not_assessed", label: "Not assessed" },
];

export function BrowseFilters({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showMore, setShowMore] = useState(false);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (value) {
        sp.set(key, value);
      } else {
        sp.delete(key);
      }
      sp.delete("page");
      router.push(`/browse?${sp.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    router.push("/browse");
  };

  const hasFilters = Object.values(params).some(Boolean);

  // Count active advanced filters
  const advancedFilterCount = [
    params.henneke,
    params.soundness,
    params.breed,
    params.minAge,
    params.maxAge,
  ].filter(Boolean).length;

  return (
    <div className="space-y-5 rounded-lg border border-border bg-paper-cream p-4 shadow-flat">
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

      {/* Location — grouped by region */}
      <div>
        <Label htmlFor="filter-state" className="text-xs">Location</Label>
        <select
          id="filter-state"
          value={params.state || ""}
          onChange={(e) => updateFilter("state", e.target.value)}
          className="mt-1.5 w-full rounded-md border border-border bg-paper-white px-3 py-2 text-sm"
        >
          <option value="">All States</option>
          {US_REGIONS.map((region) => (
            <optgroup key={region.label} label={region.label}>
              {region.states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {/* Quick region pills */}
        <div className="mt-2 flex flex-wrap gap-1">
          {US_REGIONS.map((region) => (
            <button
              key={region.label}
              type="button"
              onClick={() => {
                // Set first state in region as filter — user can refine
                const sp = new URLSearchParams(searchParams.toString());
                // Use a region param instead of individual state
                sp.set("region", region.label.toLowerCase());
                sp.delete("state");
                sp.delete("page");
                router.push(`/browse?${sp.toString()}`);
              }}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                params.region === region.label.toLowerCase()
                  ? "bg-ink-black text-paper-white"
                  : "bg-paper-warm text-ink-light hover:text-ink-mid"
              }`}
            >
              {region.label}
            </button>
          ))}
        </div>
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

      {/* ─── Advanced Filters (collapsible) ─── */}
      <div>
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="flex w-full items-center justify-between rounded-md px-1 py-1 text-xs font-medium text-ink-mid hover:text-ink-black"
        >
          <span>
            More Filters
            {advancedFilterCount > 0 && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                {advancedFilterCount}
              </span>
            )}
          </span>
          {showMore ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        {showMore && (
          <div className="mt-3 space-y-5 border-t border-crease-light pt-4">
            {/* Breed */}
            <div>
              <Label htmlFor="filter-breed" className="text-xs">Breed</Label>
              <select
                id="filter-breed"
                value={params.breed || ""}
                onChange={(e) => updateFilter("breed", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-border bg-paper-white px-3 py-2 text-sm"
              >
                <option value="">All Breeds</option>
                {breeds.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Age Range */}
            <div>
              <Label className="text-xs">Age (years)</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  defaultValue={params.minAge || ""}
                  onBlur={(e) => updateFilter("minAge", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  defaultValue={params.maxAge || ""}
                  onBlur={(e) => updateFilter("maxAge", e.target.value)}
                />
              </div>
            </div>

            {/* Body Condition (Henneke) */}
            <div>
              <Label className="text-xs">
                Body Condition{" "}
                <span className="font-normal text-ink-light">(Henneke 1-9)</span>
              </Label>
              <div className="mt-1.5 flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((score) => {
                  const isSelected = params.henneke === String(score);
                  const isIdeal = score >= 4 && score <= 6;
                  return (
                    <button
                      key={score}
                      type="button"
                      onClick={() =>
                        updateFilter(
                          "henneke",
                          isSelected ? "" : String(score)
                        )
                      }
                      className={`flex h-7 flex-1 items-center justify-center rounded text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : isIdeal
                            ? "bg-forest/10 text-forest hover:bg-forest/20"
                            : "bg-paper-warm text-ink-mid hover:bg-paper-white"
                      }`}
                      title={`BCS ${score}`}
                    >
                      {score}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-[10px] text-ink-light">
                4-6 = ideal range (highlighted)
              </p>
            </div>

            {/* Soundness Level */}
            <div>
              <Label htmlFor="filter-soundness" className="text-xs">Soundness</Label>
              <select
                id="filter-soundness"
                value={params.soundness || ""}
                onChange={(e) => updateFilter("soundness", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-border bg-paper-white px-3 py-2 text-sm"
              >
                <option value="">Any soundness level</option>
                {soundnessOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Sort */}
      <div>
        <Label htmlFor="filter-sort" className="text-xs">Sort By</Label>
        <select
          id="filter-sort"
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
