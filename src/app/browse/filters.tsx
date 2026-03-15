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
import { Search, X, SlidersHorizontal } from "lucide-react";
import {
  SelectMenu,
  InputGroup,
  FormSection,
  RadioCardGroup,
  ToggleGroup,
} from "@/components/tailwind-plus";

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

const verificationOptions = [
  { value: "bronze", label: "Bronze+" },
  { value: "silver", label: "Silver+" },
  { value: "gold", label: "Gold" },
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
      className={`rounded-[var(--radius-card)] border px-3 py-1.5 text-[13px] font-medium transition-all duration-150 ${
        active
          ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--ink-black)]"
          : "border-[var(--paper-border)] bg-[var(--paper-surface)] text-[var(--ink-mid)] hover:border-[var(--paper-border-strong)] hover:text-[var(--ink-dark)]"
      }`}
    >
      {label}
    </button>
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
    params.verification,
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
    params.verification,
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
  if (params.verification) {
    const vLabel = verificationOptions.find((o) => o.value === params.verification)?.label || params.verification;
    activeChips.push({ label: `HorseProof ${vLabel}`, onClear: () => updateFilter("verification", "") });
  }

  return (
    <div className="space-y-3">
      {/* ─── Filter bar ─── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search (desktop only) */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]" />
          <Input
            placeholder="Search..."
            defaultValue={params.q || ""}
            className="input-paper h-9 w-44 pl-9 text-[13px] placeholder:text-[var(--ink-faint)]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilter("q", (e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>

        {/* Mobile: open filter sheet */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSheetOpen(true)}
          className="rounded-[var(--radius-card)] border-[var(--paper-border)] md:hidden"
        >
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          Filters
          {totalFilterCount > 0 && (
            <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-[var(--radius-badge)] bg-[var(--accent-gold)] px-1 text-[10px] font-bold text-[var(--paper-surface)]">
              {totalFilterCount}
            </span>
          )}
        </Button>

        {/* Desktop: Discipline */}
        <SelectMenu
          label="Discipline"
          value={params.discipline || ""}
          onChange={(v) => updateFilter("discipline", v)}
          className="hidden md:block"
        >
          {disciplines.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </SelectMenu>

        {/* Desktop: Price */}
        <div className="hidden items-center gap-1.5 md:flex">
          <InputGroup
            type="number"
            placeholder="Min $"
            prefix="$"
            variant="pill"
            defaultValue={params.minPrice || ""}
            onBlur={(e) => updateFilter("minPrice", e.currentTarget.value)}
          />
          <span className="text-[11px] text-ink-faint">to</span>
          <InputGroup
            type="number"
            placeholder="Max $"
            prefix="$"
            variant="pill"
            defaultValue={params.maxPrice || ""}
            onBlur={(e) => updateFilter("maxPrice", e.currentTarget.value)}
          />
        </div>

        {/* Desktop: Location */}
        <SelectMenu
          label="Location"
          value={params.state || ""}
          onChange={(v) => updateFilter("state", v)}
          className="hidden md:block"
        >
          {US_REGIONS.map((region) => (
            <optgroup key={region.label} label={region.label}>
              {region.states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </optgroup>
          ))}
        </SelectMenu>

        {/* Desktop: More filters */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="hidden items-center gap-1.5 rounded-[var(--radius-card)] border border-[var(--paper-border)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--ink-mid)] transition-colors hover:border-[var(--paper-border-strong)] hover:text-[var(--ink-dark)] md:flex"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          More
          {advancedFilterCount > 0 && (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-[var(--radius-badge)] bg-[var(--accent-gold)] px-1 text-[10px] font-bold text-[var(--paper-surface)]">
              {advancedFilterCount}
            </span>
          )}
        </button>

        {/* Spacer — pushes sort to right edge */}
        <div className="flex-1" />

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <span className="hidden text-[12px] text-ink-faint md:inline">Sort</span>
          <SelectMenu
            label="Newest"
            value={params.sort || "newest"}
            onChange={(v) => updateFilter("sort", v)}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </SelectMenu>
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
              className="group flex items-center gap-1 rounded-[var(--radius-card)] border border-[var(--paper-border)] bg-[var(--paper-surface)] px-2.5 py-1 text-[12px] font-medium text-[var(--ink-dark)] transition-all hover:border-[var(--accent-saddle)]/30 hover:bg-[var(--accent-saddle-soft)] hover:text-[var(--accent-saddle)]"
            >
              {chip.label}
              <X className="h-3 w-3 text-[var(--ink-faint)] transition-colors group-hover:text-[var(--accent-saddle)]" />
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
        <SheetContent side="right" className="flex flex-col overflow-hidden bg-[var(--paper-bg)] sm:max-w-sm">
          {/* Sticky header */}
          <SheetHeader className="border-b border-[var(--paper-border)] bg-[var(--paper-surface)] px-5 pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="display-md text-[var(--ink-black)]">Filters</SheetTitle>
              {totalFilterCount > 0 && (
                <span className="badge-seal text-[var(--accent-gold)]">
                  {totalFilterCount}
                </span>
              )}
            </div>
            <SheetDescription className="text-[13px] text-[var(--ink-faint)]">
              {totalFilterCount > 0
                ? `${totalFilterCount} filter${totalFilterCount !== 1 ? "s" : ""} applied`
                : "Refine your search results"}
            </SheetDescription>
          </SheetHeader>

          {/* Scrollable filter body */}
          <div key={searchParams.toString()} className="flex-1 overflow-y-auto px-5 py-6">
            <div className="space-y-7">
              {/* ── Search ── */}
              <FormSection label="Search">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                  <Input
                    placeholder="Name, breed, keyword..."
                    defaultValue={params.q || ""}
                    className="input-paper h-10 pl-9 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateFilter("q", (e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                </div>
              </FormSection>

              {/* ── Discipline ── */}
              <FormSection label="Discipline">
                <div className="flex flex-wrap gap-1.5">
                  {disciplines.map((d) => (
                    <FilterPill
                      key={d}
                      label={d}
                      active={params.discipline === d}
                      onClick={() => updateFilter("discipline", params.discipline === d ? "" : d)}
                    />
                  ))}
                </div>
              </FormSection>

              {/* ── Price Range ── */}
              <FormSection label="Price Range">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint">$</span>
                    <Input
                      type="number"
                      placeholder="Min"
                      defaultValue={params.minPrice || ""}
                      className="input-paper h-10 pl-7 text-sm"
                      onBlur={(e) => updateFilter("minPrice", e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint">$</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      defaultValue={params.maxPrice || ""}
                      className="input-paper h-10 pl-7 text-sm"
                      onBlur={(e) => updateFilter("maxPrice", e.target.value)}
                    />
                  </div>
                </div>
              </FormSection>

              <div className="crease-divider-full" />

              {/* ── Gender — radio cards ── */}
              <FormSection label="Gender">
                <RadioCardGroup
                  options={genders.map((g) => ({ value: g.value, label: g.label }))}
                  value={params.gender || ""}
                  onChange={(v) => updateFilter("gender", v)}
                  columns={3}
                />
              </FormSection>

              {/* ── Breed ── */}
              <FormSection label="Breed">
                <SelectMenu
                  label="All Breeds"
                  value={params.breed || ""}
                  onChange={(v) => updateFilter("breed", v)}
                  variant="field"
                  icon={<Search className="h-3.5 w-3.5" />}
                >
                  {breeds.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </SelectMenu>
              </FormSection>

              {/* ── Location ── */}
              <FormSection label="Region">
                <RadioCardGroup
                  options={US_REGIONS.map((r) => ({ value: r.value, label: r.label }))}
                  value={params.region || ""}
                  onChange={(v) => {
                    const sp = new URLSearchParams(searchParams.toString());
                    if (params.region === v || !v) {
                      sp.delete("region");
                    } else {
                      sp.set("region", v);
                      sp.delete("state");
                    }
                    sp.delete("page");
                    router.push(`/browse?${sp.toString()}`);
                  }}
                  columns={3}
                />
              </FormSection>

              <FormSection label="State">
                <SelectMenu
                  label="All States"
                  value={params.state || ""}
                  onChange={(v) => updateFilter("state", v)}
                  variant="field"
                >
                  {US_REGIONS.map((region) => (
                    <optgroup key={region.label} label={region.label}>
                      {region.states.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </optgroup>
                  ))}
                </SelectMenu>
              </FormSection>

              <div className="crease-divider-full" />

              {/* ── Height + Age ── */}
              <div className="grid grid-cols-2 gap-4">
                <FormSection label="Height (hh)">
                  <div className="grid grid-cols-2 gap-1.5">
                    <InputGroup type="number" step="0.1" placeholder="Min" variant="field" defaultValue={params.minHeight || ""} onBlur={(e) => updateFilter("minHeight", e.currentTarget.value)} className="text-center" />
                    <InputGroup type="number" step="0.1" placeholder="Max" variant="field" defaultValue={params.maxHeight || ""} onBlur={(e) => updateFilter("maxHeight", e.currentTarget.value)} className="text-center" />
                  </div>
                </FormSection>
                <FormSection label="Age (yrs)">
                  <div className="grid grid-cols-2 gap-1.5">
                    <InputGroup type="number" placeholder="Min" variant="field" defaultValue={params.minAge || ""} onBlur={(e) => updateFilter("minAge", e.currentTarget.value)} className="text-center" />
                    <InputGroup type="number" placeholder="Max" variant="field" defaultValue={params.maxAge || ""} onBlur={(e) => updateFilter("maxAge", e.currentTarget.value)} className="text-center" />
                  </div>
                </FormSection>
              </div>

              {/* ── Body Condition ── */}
              <FormSection label="Body Condition Score" hint="4–6 ideal · Henneke scale">
                <ToggleGroup
                  options={[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => ({
                    value: String(s),
                    label: String(s),
                  }))}
                  value={params.henneke || ""}
                  onChange={(v) => updateFilter("henneke", v)}
                  selectedStyle="solid"
                  optionClassName={(val, selected) => {
                    if (selected) return "bg-saddle text-paper-white shadow-sm";
                    const n = parseInt(val);
                    return n >= 4 && n <= 6
                      ? "bg-saddle/8 text-saddle hover:bg-saddle/15"
                      : "bg-paper-cream text-ink-light hover:bg-paper-warm hover:text-ink-mid";
                  }}
                  className="gap-0.5"
                />
              </FormSection>

              {/* ── Soundness — radio list ── */}
              <FormSection label="Soundness">
                <div className="space-y-1">
                  {[{ value: "", label: "Any level" }, ...soundnessOptions].map((opt) => {
                    const selected = (params.soundness || "") === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateFilter("soundness", opt.value)}
                        className={`flex w-full items-center gap-3 rounded-[var(--radius-card)] px-3 py-3 text-left text-sm transition-colors ${
                          selected
                            ? "bg-[var(--accent-gold)]/5 text-[var(--ink-black)]"
                            : "text-[var(--ink-mid)] hover:bg-[var(--paper-warm)]"
                        }`}
                      >
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          selected ? "border-[var(--ink-black)]" : "border-[var(--paper-border-strong)]"
                        }`}>
                          {selected && <span className="h-2 w-2 rounded-full bg-[var(--ink-black)]" />}
                        </span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </FormSection>

              {/* ── HorseProof Verification ── */}
              <FormSection label="HorseProof Verified">
                <RadioCardGroup
                  options={[{ value: "", label: "Any" }, ...verificationOptions.map((o) => ({ value: o.value, label: o.label }))]}
                  value={params.verification || ""}
                  onChange={(v) => updateFilter("verification", v)}
                  columns={4}
                />
              </FormSection>

              <div className="crease-divider-full" />

              {/* ── Sort ── */}
              <FormSection label="Sort By">
                <RadioCardGroup
                  options={sortOptions.map((o) => ({ value: o.value, label: o.label }))}
                  value={params.sort || "newest"}
                  onChange={(v) => updateFilter("sort", v || "newest")}
                  columns={3}
                />
              </FormSection>
            </div>
          </div>

          {/* Sticky footer with apply/reset */}
          <SheetFooter className="border-t border-[var(--paper-border)] bg-[var(--paper-surface)] px-5 py-4">
            <div className="flex w-full gap-3">
              {hasFilters && (
                <Button
                  variant="outline"
                  className="flex-1 border-[var(--paper-border)] text-[var(--ink-mid)] hover:text-[var(--ink-dark)]"
                  onClick={() => {
                    clearFilters();
                    setSheetOpen(false);
                  }}
                >
                  Reset
                </Button>
              )}
              <Button
                className="flex-1"
                onClick={() => setSheetOpen(false)}
              >
                {totalFilterCount > 0
                  ? `Show Results (${totalFilterCount})`
                  : "Show All Results"}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
