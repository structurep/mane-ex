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
        tabs ? "border-b border-crease-light pb-0" : "pb-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold text-ink-dark">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-ink-mid">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {tabs && (
        <div className="mt-3">
          {/* Mobile: select dropdown */}
          <div className="grid grid-cols-1 sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => onTabChange?.(e.target.value)}
              aria-label="Select a tab"
              className="col-start-1 row-start-1 w-full appearance-none rounded-md border border-crease-mid bg-paper-white py-2 pr-8 pl-3 text-sm text-ink-dark focus:border-oxblood focus:outline-none focus:ring-1 focus:ring-oxblood"
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
                      ? "border-oxblood text-oxblood"
                      : "border-transparent text-ink-mid hover:border-crease-mid hover:text-ink-dark"
                  )}
                >
                  {tab.label}
                  {tab.count != null && (
                    <span
                      className={cn(
                        "ml-2 rounded-full px-2 py-0.5 text-[11px]",
                        activeTab === tab.id
                          ? "bg-oxblood/10 text-oxblood"
                          : "bg-ink-black/5 text-ink-faint"
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
