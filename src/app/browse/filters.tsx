"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";

type Props = {
  params: Record<string, string | undefined>;
};

// ─── Data ──────────────────────────────────────

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

const US_REGIONS: { label: string; value: string; states: string[] }[] = [
  { label: "Southeast", value: "southeast", states: ["FL", "GA", "SC", "NC", "VA", "KY", "TN", "AL", "MS", "LA"] },
  { label: "Northeast", value: "northeast", states: ["NY", "NJ", "PA", "CT", "MA", "MD", "NH", "VT", "ME", "RI"] },
  { label: "Midwest", value: "midwest", states: ["OH", "IL", "MI", "IN", "WI", "MN", "MO", "IA", "KS", "NE"] },
  { label: "West", value: "west", states: ["CA", "OR", "WA", "CO", "MT", "ID", "WY", "UT", "NV"] },
  { label: "Southwest", value: "southwest", states: ["TX", "AZ", "NM", "OK", "AR"] },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "score", label: "Mane Score" },
  { value: "popular", label: "Most Saved" },
];

const soundnessOptions = [
  { value: "vet_confirmed_sound", label: "Vet-confirmed sound" },
  { value: "minor_findings", label: "Minor findings" },
  { value: "managed_condition", label: "Managed condition" },
  { value: "not_assessed", label: "Not assessed" },
];

// ─── Pill Component ─────────────────────────────

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all duration-150 ${
        active
          ? "border-ink-black bg-ink-black text-paper-white"
          : "border-crease-light bg-paper-white text-ink-mid hover:border-ink-light hover:text-ink-dark"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Dropdown Filter ────────────────────────────

function FilterDropdown({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-full border border-crease-light bg-paper-white py-1.5 pr-8 pl-3.5 text-[13px] font-medium text-ink-dark transition-colors hover:border-ink-light focus:border-ink-black focus:outline-none"
      >
        <option value="">{label}</option>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
    </div>
  );
}

// ─── Component ──────────────────────────────────

export function BrowseFilters({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

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
    params.q, params.discipline,
    params.minPrice, params.maxPrice,
    params.state, params.region,
    params.gender,
    params.minHeight, params.maxHeight,
    params.breed,
    params.minAge, params.maxAge,
    params.henneke, params.soundness,
  ].filter(Boolean).length;

  // ── Active filter chips ──
  const activeChips: { label: string; onClear: () => void }[] = [];

  if (params.q) activeChips.push({ label: `"${params.q}"`, onClear: () => updateFilter("q", "") });
  if (params.discipline) activeChips.push({ label: params.discipline, onClear: () => updateFilter("discipline", "") });
  if (params.minPrice || params.maxPrice) {
    const minStr = params.minPrice ? `$${Number(params.minPrice).toLocaleString()}` : "";
    const maxStr = params.maxPrice ? `$${Number(params.maxPrice).toLocaleString()}` : "";
    const label = minStr && maxStr ? `${minStr}–${maxStr}` : minStr ? `${minStr}+` : `Up to ${maxStr}`;
    activeChips.push({ label, onClear: () => clearPairedFilter("minPrice", "maxPrice") });
  }
  if (params.state) activeChips.push({ label: params.state, onClear: () => updateFilter("state", "") });
  if (params.region) {
    const regionLabel = US_REGIONS.find((r) => r.value === params.region)?.label || params.region;
    activeChips.push({ label: regionLabel, onClear: () => updateFilter("region", "") });
  }
  if (params.gender) {
    activeChips.push({ label: genders.find((g) => g.value === params.gender)?.label || params.gender, onClear: () => updateFilter("gender", "") });
  }
  if (params.minHeight || params.maxHeight) {
    const minStr = params.minHeight ? `${params.minHeight}hh` : "";
    const maxStr = params.maxHeight ? `${params.maxHeight}hh` : "";
    const label = minStr && maxStr ? `${minStr}–${maxStr}` : minStr ? `${minStr}+` : `Up to ${maxStr}`;
    activeChips.push({ label, onClear: () => clearPairedFilter("minHeight", "maxHeight") });
  }
  if (params.breed) activeChips.push({ label: params.breed, onClear: () => updateFilter("breed", "") });
  if (params.minAge || params.maxAge) {
    const minStr = params.minAge ? `${params.minAge}yo` : "";
    const maxStr = params.maxAge ? `${params.maxAge}yo` : "";
    const label = minStr && maxStr ? `${minStr}–${maxStr}` : minStr ? `${minStr}+` : `Up to ${maxStr}`;
    activeChips.push({ label, onClear: () => clearPairedFilter("minAge", "maxAge") });
  }
  if (params.henneke) activeChips.push({ label: `BCS ${params.henneke}`, onClear: () => updateFilter("henneke", "") });
  if (params.soundness) {
    activeChips.push({ label: soundnessOptions.find((o) => o.value === params.soundness)?.label || params.soundness, onClear: () => updateFilter("soundness", "") });
  }

  return (
    <div className="space-y-3">
      {/* ─── Desktop filter bar ─── */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            placeholder="Search..."
            defaultValue={params.q || ""}
            className="h-9 w-44 rounded-full border-crease-light bg-paper-white pl-9 text-[13px] placeholder:text-ink-faint focus-visible:ring-1 focus-visible:ring-ink-black/20"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilter("q", (e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>

        {/* Mobile: open sheet */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSheetOpen(true)}
          className="rounded-full border-crease-light md:hidden"
        >
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          Filters
          {totalFilterCount > 0 && (
            <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-black px-1 text-[10px] font-bold text-paper-white">
              {totalFilterCount}
            </span>
          )}
        </Button>

        {/* Desktop: Discipline */}
        <FilterDropdown
          label="Discipline"
          value={params.discipline || ""}
          onChange={(v) => updateFilter("discipline", v)}
        >
          {disciplines.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </FilterDropdown>

        {/* Desktop: Price */}
        <div className="hidden items-center gap-1.5 md:flex">
          <Input
            type="number"
            placeholder="Min $"
            defaultValue={params.minPrice || ""}
            className="h-9 w-[88px] rounded-full border-crease-light text-[13px] text-center placeholder:text-ink-faint"
            onBlur={(e) => updateFilter("minPrice", e.target.value)}
          />
          <span className="text-[11px] text-ink-faint">to</span>
          <Input
            type="number"
            placeholder="Max $"
            defaultValue={params.maxPrice || ""}
            className="h-9 w-[88px] rounded-full border-crease-light text-[13px] text-center placeholder:text-ink-faint"
            onBlur={(e) => updateFilter("maxPrice", e.target.value)}
          />
        </div>

        {/* Desktop: Location */}
        <FilterDropdown
          label="Location"
          value={params.state || ""}
          onChange={(v) => updateFilter("state", v)}
        >
          {US_REGIONS.map((region) => (
            <optgroup key={region.label} label={region.label}>
              {region.states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </optgroup>
          ))}
        </FilterDropdown>

        {/* Desktop: More filters */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="hidden items-center gap-1.5 rounded-full border border-crease-light px-3.5 py-1.5 text-[13px] font-medium text-ink-mid transition-colors hover:border-ink-light hover:text-ink-dark md:flex"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          More
          {advancedFilterCount > 0 && (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-black px-1 text-[10px] font-bold text-paper-white">
              {advancedFilterCount}
            </span>
          )}
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <span className="hidden text-[12px] text-ink-faint md:inline">Sort</span>
          <FilterDropdown
            label="Newest"
            value={params.sort || "newest"}
            onChange={(v) => updateFilter("sort", v)}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </FilterDropdown>
        </div>
      </div>

      {/* ─── Active filter chips ─── */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.onClear}
              className="group flex items-center gap-1 rounded-full border border-crease-light bg-paper-white px-2.5 py-1 text-[12px] font-medium text-ink-dark transition-all hover:border-red/30 hover:bg-red-light hover:text-red"
            >
              {chip.label}
              <X className="h-3 w-3 text-ink-faint transition-colors group-hover:text-red" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearFilters}
            className="px-1.5 py-1 text-[12px] font-medium text-ink-faint underline decoration-ink-faint/40 underline-offset-2 hover:text-ink-dark hover:decoration-ink-dark/40"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ─── Filter Sheet (mobile + advanced) ─── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="overflow-y-auto sm:max-w-sm">
          <SheetHeader className="pb-2">
            <SheetTitle className="font-serif text-xl">Refine Search</SheetTitle>
            <SheetDescription className="text-[13px]">
              {totalFilterCount > 0
                ? `${totalFilterCount} filter${totalFilterCount !== 1 ? "s" : ""} active`
                : "Narrow your results"}
            </SheetDescription>
          </SheetHeader>

          <div key={searchParams.toString()} className="flex-1 space-y-6 px-4 pb-8">
            {/* Search */}
            <div>
              <label className="text-[12px] font-medium uppercase tracking-wider text-ink-faint">
                Search
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <Input
                  placeholder="Name, breed, keyword..."
                  defaultValue={params.q || ""}
                  className="pl-9"
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
              <label className="text-[12px] font-medium uppercase tracking-wider text-ink-faint">
                Discipline
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {disciplines.map((d) => (
                  <FilterPill
                    key={d}
                    label={d}
                    active={params.discipline === d}
                    onClick={() => updateFilter("discipline", params.discipline === d ? "" : d)}
                  />
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-[12px] font-medium uppercase tracking-wider text-ink-faint">
                Price
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
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
              <label className="text-[12px] font-medium uppercase tracking-wider text-ink-faint">
                Location
              </label>
              <div className="relative mt-2">
                <select
                  value={params.state || ""}
                  onChange={(e) => updateFilter("state", e.target.value)}
                  className="h-9 w-full cursor-pointer appearance-none rounded-md border border-border bg-paper-white px-3 pr-8 text-sm text-ink-dark"
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
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {US_REGIONS.map((region) => (
                  <FilterPill
                    key={region.value}
                    label={region.label}
                    active={params.region === region.value}
                    onClick={() => {
                      const sp = new URLSearchParams(searchParams.toString());
                      if (params.region === region.value) {
                        sp.delete("region");
                      } else {
                        sp.set("region", region.value);
                        sp.delete("state");
                      }
                      sp.delete("page");
                      router.push(`/browse?${sp.toString()}`);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-crease-light" />

            {/* Gender */}
            <div>
              <label className="text-[12px] font-medium uppercase tracking-wider text-ink-faint">
                Gender
              </label>
              <div className="mt-2 flex gap-1.5">
                {genders.map((g) => (
                  <FilterPill
                    key={g.value}
                    label={g.label}
                    active={params.gender === g.value}
                    onClick={() => updateFilter("gender", params.gender === g.value ? "" : g.value)}
                  />
                ))}
              </div>
            </div>

            {/* Breed */}
            <div>
              <label className="text-[12px] font-medium uppercase tracking-wider text-ink-faint">
                Breed
              </label>
              <div className="relative mt-2">
                <select
                  value={params.breed || ""}
                  onChange={(e) => updateFilter("breed", e.target.value)}
                  className="h-9 w-full cursor-pointer appearance-none rounded-md border border-border bg-paper-white px-3 pr-8 text-sm text-ink-dark"
                >
                  <option value="">All Breeds</option>
                  {breeds.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
              </div>
            </div>

            {/* Height + Age side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-medium uppercase tracking-wider text-ink-faint">
                  Height (hh)
                </label>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Min"
                    defaultValue={params.minHeight || ""}
                    className="text-center text-sm"
                    onBlur={(e) => updateFilter("minHeight", e.target.value)}
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Max"
                    defaultValue={params.maxHeight || ""}
                    className="text-center text-sm"
                    onBlur={(e) => updateFilter("maxHeight", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium uppercase tracking-wider text-ink-faint">
                  Age (yrs)
                </label>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <Input
                    type="number"
                    placeholder="Min"
                    defaultValue={params.minAge || ""}
                    className="text-center text-sm"
                    onBlur={(e) => updateFilter("minAge", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    defaultValue={params.maxAge || ""}
                    className="text-center text-sm"
                    onBlur={(e) => updateFilter("maxAge", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Henneke */}
            <div>
              <label className="text-[12px] font-medium uppercase tracking-wider text-ink-faint">
                Body Condition
              </label>
              <div className="mt-2 flex gap-0.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((score) => {
                  const isSelected = params.henneke === String(score);
                  const isIdeal = score >= 4 && score <= 6;
                  return (
                    <button
                      key={score}
                      type="button"
                      onClick={() => updateFilter("henneke", isSelected ? "" : String(score))}
                      className={`flex h-8 flex-1 items-center justify-center rounded text-[13px] font-medium transition-all ${
                        isSelected
                          ? "bg-ink-black text-paper-white shadow-sm"
                          : isIdeal
                            ? "bg-forest/8 text-forest hover:bg-forest/15"
                            : "bg-paper-warm text-ink-light hover:bg-washi hover:text-ink-mid"
                      }`}
                      title={`BCS ${score}`}
                    >
                      {score}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-ink-faint">
                4–6 ideal <span className="mx-1 text-crease-mid">·</span> Henneke scale
              </p>
            </div>

            {/* Soundness */}
            <div>
              <label className="text-[12px] font-medium uppercase tracking-wider text-ink-faint">
                Soundness
              </label>
              <div className="relative mt-2">
                <select
                  value={params.soundness || ""}
                  onChange={(e) => updateFilter("soundness", e.target.value)}
                  className="h-9 w-full cursor-pointer appearance-none rounded-md border border-border bg-paper-white px-3 pr-8 text-sm text-ink-dark"
                >
                  <option value="">Any level</option>
                  {soundnessOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="text-[12px] font-medium uppercase tracking-wider text-ink-faint">
                Sort By
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {sortOptions.map((opt) => (
                  <FilterPill
                    key={opt.value}
                    label={opt.label}
                    active={(params.sort || "newest") === opt.value}
                    onClick={() => updateFilter("sort", opt.value)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          {hasFilters && (
            <SheetFooter className="border-t border-crease-light px-4 pt-3">
              <Button
                variant="ghost"
                className="w-full text-ink-faint hover:text-ink-dark"
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
