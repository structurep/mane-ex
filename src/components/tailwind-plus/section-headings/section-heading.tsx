"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { type ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface SectionHeadingProps {
  title: string;
  description?: string;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  actions?: ReactNode;
  className?: string;
}

/**
 * Section heading — Origami editorial style with optional underline tabs.
 */
export function SectionHeading({
  title,
  description,
  tabs,
  activeTab,
  onTabChange,
  actions,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        tabs ? "border-b border-glass pb-0" : "pb-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="display-md text-ink">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-ink-mid">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {tabs && (
        <div className="mt-4">
          {/* Mobile: select dropdown */}
          <div className="grid grid-cols-1 sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => onTabChange?.(e.target.value)}
              aria-label="Select a tab"
              className="input-paper col-start-1 row-start-1 w-full pr-8"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                  {tab.count != null ? ` (${tab.count})` : ""}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-ink-faint"
            />
          </div>

          {/* Desktop: underline tabs */}
          <div className="hidden sm:block">
            <nav className="-mb-px flex space-x-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange?.(tab.id)}
                  className={cn(
                    "border-b-2 px-1 pb-3 text-sm font-medium whitespace-nowrap transition-colors",
                    activeTab === tab.id
                      ? "border-ink text-ink"
                      : "border-transparent text-ink-mid hover:border-[var(--paper-border-strong)] hover:text-ink-dark"
                  )}
                >
                  {tab.label}
                  {tab.count != null && (
                    <span
                      className={cn(
                        "ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                        activeTab === tab.id
                          ? "bg-ink/10 text-ink"
                          : "bg-ink/5 text-ink-faint"
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
