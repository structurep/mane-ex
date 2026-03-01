"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Search, X, SlidersHorizontal } from "lucide-react";

type Props = {
  params: Record<string, string | undefined>;
};

// ─── Data (unchanged) ──────────────────────────────────

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

// ─── Shared styles ─────────────────────────────────────

const selectClass =
  "h-9 cursor-pointer rounded-md border border-border bg-paper-white px-3 text-sm text-ink-dark";

// ─── Component ─────────────────────────────────────────

export function BrowseFilters({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  // ── URL-param updaters (unchanged logic) ──

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

  const clearPairedFilter = useCallback(
    (...keys: string[]) => {
      const sp = new URLSearchParams(searchParams.toString());
      keys.forEach((k) => sp.delete(k));
      sp.delete("page");
      router.push(`/browse?${sp.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = () => router.push("/browse");

  const hasFilters = Object.entries(params).some(
    ([k, v]) => v && k !== "sort" && k !== "page"
  );

  // ── Filter counts ──

  const advancedFilterCount = [
    params.gender,
    params.minHeight, params.maxHeight,
    params.breed,
    params.minAge, params.maxAge,
    params.henneke,
    params.soundness,
    params.region,
  ].filter(Boolean).length;

  const totalFilterCount = [
    params.q,
    params.discipline,
    params.minPrice, params.maxPrice,
    params.state, params.region,
    params.gender,
    params.minHeight, params.maxHeight,
    params.breed,
    params.minAge, params.maxAge,
    params.henneke,
    params.soundness,
  ].filter(Boolean).length;

  // ── Active filter chips ──

  const activeChips: { label: string; onClear: () => void }[] = [];

  if (params.q) {
    activeChips.push({ label: `"${params.q}"`, onClear: () => updateFilter("q", "") });
  }
  if (params.discipline) {
    activeChips.push({ label: params.discipline, onClear: () => updateFilter("discipline", "") });
  }
  if (params.minPrice || params.maxPrice) {
    const minStr = params.minPrice ? `$${Number(params.minPrice).toLocaleString()}` : "";
    const maxStr = params.maxPrice ? `$${Number(params.maxPrice).toLocaleString()}` : "";
    const label = minStr && maxStr ? `${minStr}–${maxStr}` : minStr ? `${minStr}+` : `Up to ${maxStr}`;
    activeChips.push({ label, onClear: () => clearPairedFilter("minPrice", "maxPrice") });
  }
  if (params.state) {
    activeChips.push({ label: params.state, onClear: () => updateFilter("state", "") });
  }
  if (params.region) {
    const regionLabel = US_REGIONS.find((r) => r.label.toLowerCase() === params.region)?.label || params.region;
    activeChips.push({ label: regionLabel, onClear: () => updateFilter("region", "") });
  }
  if (params.gender) {
    const genderLabel = genders.find((g) => g.value === params.gender)?.label || params.gender;
    activeChips.push({ label: genderLabel, onClear: () => updateFilter("gender", "") });
  }
  if (params.minHeight || params.maxHeight) {
    const minStr = params.minHeight ? `${params.minHeight}hh` : "";
    const maxStr = params.maxHeight ? `${params.maxHeight}hh` : "";
    const label = minStr && maxStr ? `${minStr}–${maxStr}` : minStr ? `${minStr}+` : `Up to ${maxStr}`;
    activeChips.push({ label, onClear: () => clearPairedFilter("minHeight", "maxHeight") });
  }
  if (params.breed) {
    activeChips.push({ label: params.breed, onClear: () => updateFilter("breed", "") });
  }
  if (params.minAge || params.maxAge) {
    const minStr = params.minAge ? `${params.minAge}yo` : "";
    const maxStr = params.maxAge ? `${params.maxAge}yo` : "";
    const label = minStr && maxStr ? `${minStr}–${maxStr}` : minStr ? `${minStr}+` : `Up to ${maxStr}`;
    activeChips.push({ label, onClear: () => clearPairedFilter("minAge", "maxAge") });
  }
  if (params.henneke) {
    activeChips.push({ label: `BCS ${params.henneke}`, onClear: () => updateFilter("henneke", "") });
  }
  if (params.soundness) {
    const soundnessLabel = soundnessOptions.find((o) => o.value === params.soundness)?.label || params.soundness;
    activeChips.push({ label: soundnessLabel, onClear: () => updateFilter("soundness", "") });
  }

  // ── Count badge helper ──

  const countBadge = (count: number) =>
    count > 0 ? (
      <span className="ml-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-oxblood px-1 text-[10px] font-semibold leading-none text-paper-white">
        {count}
      </span>
    ) : null;

  return (
    <div className="space-y-3">
      {/* ─── Top filter bar ─── */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-paper-cream p-3">
        {/* Mobile: open all-filters sheet */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSheetOpen(true)}
          className="md:hidden"
        >
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          Filters
          {countBadge(totalFilterCount)}
        </Button>

        {/* Desktop: Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-light" />
          <Input
            placeholder="Search horses..."
            defaultValue={params.q || ""}
            className="h-9 w-48 pl-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilter("q", (e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>

        {/* Desktop: Discipline */}
        <select
          value={params.discipline || ""}
          onChange={(e) => updateFilter("discipline", e.target.value)}
          className={`hidden md:block ${selectClass}`}
        >
          <option value="">Discipline</option>
          {disciplines.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Desktop: Price range */}
        <div className="hidden items-center gap-1 md:flex">
          <Input
            type="number"
            placeholder="Min $"
            defaultValue={params.minPrice || ""}
            className="h-9 w-24 text-sm"
            onBlur={(e) => updateFilter("minPrice", e.target.value)}
          />
          <span className="text-xs text-ink-light">–</span>
          <Input
            type="number"
            placeholder="Max $"
            defaultValue={params.maxPrice || ""}
            className="h-9 w-24 text-sm"
            onBlur={(e) => updateFilter("maxPrice", e.target.value)}
          />
        </div>

        {/* Desktop: Location */}
        <select
          value={params.state || ""}
          onChange={(e) => updateFilter("state", e.target.value)}
          className={`hidden md:block ${selectClass}`}
        >
          <option value="">Location</option>
          {US_REGIONS.map((region) => (
            <optgroup key={region.label} label={region.label}>
              {region.states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Spacer — pushes Sort + More to right */}
        <div className="flex-1" />

        {/* Sort — always visible */}
        <select
          value={params.sort || "newest"}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className={selectClass}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Desktop: More Filters */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSheetOpen(true)}
          className="hidden md:inline-flex"
        >
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          More
          {countBadge(advancedFilterCount)}
        </Button>
      </div>

      {/* ─── Active filter chips ─── */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.onClear}
              className="flex items-center gap-1 rounded-full bg-paper-warm px-2.5 py-1 text-xs text-ink-dark transition-colors hover:bg-ink-black hover:text-paper-white"
            >
              {chip.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearFilters}
            className="px-1.5 py-1 text-xs font-medium text-oxblood hover:text-oxblood/70"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ─── Filter Sheet (all filters) ─── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow your results</SheetDescription>
          </SheetHeader>

          {/* Scrollable filter sections — key forces fresh defaultValues on URL change */}
          <div key={searchParams.toString()} className="flex-1 space-y-5 overflow-y-auto px-4 pb-6">
            {/* Search */}
            <div>
              <Label htmlFor="sheet-search" className="text-xs">Search</Label>
              <div className="relative mt-1.5">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-light" />
                <Input
                  id="sheet-search"
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

            {/* Discipline — pill grid */}
            <div>
              <Label className="text-xs">Discipline</Label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {disciplines.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => updateFilter("discipline", params.discipline === d ? "" : d)}
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

            {/* Location */}
            <div>
              <Label htmlFor="sheet-state" className="text-xs">Location</Label>
              <select
                id="sheet-state"
                value={params.state || ""}
                onChange={(e) => updateFilter("state", e.target.value)}
                className={`mt-1.5 w-full ${selectClass}`}
              >
                <option value="">All States</option>
                {US_REGIONS.map((region) => (
                  <optgroup key={region.label} label={region.label}>
                    {region.states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {/* Region pills */}
              <div className="mt-2 flex flex-wrap gap-1">
                {US_REGIONS.map((region) => (
                  <button
                    key={region.label}
                    type="button"
                    onClick={() => {
                      const sp = new URLSearchParams(searchParams.toString());
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

            {/* ─── Divider: Advanced ─── */}
            <div className="border-t border-crease-light pt-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
                Advanced
              </p>
            </div>

            {/* Gender */}
            <div>
              <Label className="text-xs">Gender</Label>
              <div className="mt-1.5 flex gap-1.5">
                {genders.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => updateFilter("gender", params.gender === g.value ? "" : g.value)}
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

            {/* Breed */}
            <div>
              <Label htmlFor="sheet-breed" className="text-xs">Breed</Label>
              <select
                id="sheet-breed"
                value={params.breed || ""}
                onChange={(e) => updateFilter("breed", e.target.value)}
                className={`mt-1.5 w-full ${selectClass}`}
              >
                <option value="">All Breeds</option>
                {breeds.map((b) => (
                  <option key={b} value={b}>{b}</option>
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
                        updateFilter("henneke", isSelected ? "" : String(score))
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
              <Label htmlFor="sheet-soundness" className="text-xs">Soundness</Label>
              <select
                id="sheet-soundness"
                value={params.soundness || ""}
                onChange={(e) => updateFilter("soundness", e.target.value)}
                className={`mt-1.5 w-full ${selectClass}`}
              >
                <option value="">Any soundness level</option>
                {soundnessOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <Label htmlFor="sheet-sort" className="text-xs">Sort By</Label>
              <select
                id="sheet-sort"
                value={params.sort || "newest"}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className={`mt-1.5 w-full ${selectClass}`}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer: Clear all */}
          {hasFilters && (
            <SheetFooter>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  clearFilters();
                  setSheetOpen(false);
                }}
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Clear all filters
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
