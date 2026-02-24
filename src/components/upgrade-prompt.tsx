"use client";

import Link from "next/link";
import { Lock, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradePromptProps {
  feature: string;
  currentTier?: "starter" | "pro" | "elite";
  requiredTier?: "pro" | "elite";
  variant?: "banner" | "inline" | "overlay" | "limit-bar";
  /** For limit-bar variant: current usage and max allowed */
  usage?: { current: number; max: number; label: string };
}

export function UpgradePrompt({
  feature,
  currentTier = "starter",
  requiredTier = "pro",
  variant = "banner",
  usage,
}: UpgradePromptProps) {
  if (currentTier === "elite") return null;
  if (currentTier === "pro" && requiredTier === "pro") return null;

  const tierLabel = requiredTier === "elite" ? "Elite" : "Pro";

  // Variant: Limit progress bar (e.g., "3/5 messages used")
  if (variant === "limit-bar" && usage) {
    const percent = Math.min((usage.current / usage.max) * 100, 100);
    const isNearLimit = percent >= 80;
    return (
      <div className="rounded-lg border border-border bg-paper-cream p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-ink-mid">{usage.label}</span>
          <span className={`font-medium ${isNearLimit ? "text-red" : "text-ink-black"}`}>
            {usage.current}/{usage.max}
          </span>
        </div>
        <div className="h-2 rounded-full bg-paper-warm">
          <div
            className={`h-2 rounded-full transition-all ${isNearLimit ? "bg-red" : "bg-blue"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        {isNearLimit && (
          <p className="mt-2 text-xs text-ink-mid">
            Running low?{" "}
            <Link href="/pricing" className="text-blue hover:underline">
              Upgrade to {tierLabel}
            </Link>{" "}
            for unlimited access.
          </p>
        )}
      </div>
    );
  }

  // Variant: Inline lock (small, inline with content)
  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 rounded-md bg-paper-warm px-3 py-2 text-sm">
        <Lock className="h-3.5 w-3.5 text-ink-light" />
        <span className="text-ink-mid">{feature}</span>
        <Link href="/pricing" className="ml-auto text-xs font-medium text-blue hover:underline">
          Upgrade
        </Link>
      </div>
    );
  }

  // Variant: Overlay (for blurred/gated content)
  if (variant === "overlay") {
    return (
      <div className="relative rounded-lg border border-border bg-paper-cream p-6 text-center">
        {/* Blurred background placeholder */}
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-paper-warm/80 backdrop-blur-sm" />
        <div className="relative z-10">
          <Crown className="mx-auto mb-3 h-8 w-8 text-gold" />
          <p className="font-medium text-ink-black">{feature}</p>
          <p className="mt-1 text-sm text-ink-mid">
            Available on the {tierLabel} plan
          </p>
          <Button size="sm" className="mt-4" asChild>
            <Link href="/pricing">
              Unlock with {tierLabel}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Default variant: Banner
  return (
    <div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10">
          <Crown className="h-4 w-4 text-gold" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-ink-black">{feature}</p>
          <p className="mt-0.5 text-sm text-ink-mid">
            Upgrade to {tierLabel} to unlock this feature.
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href="/pricing">
            Upgrade
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
