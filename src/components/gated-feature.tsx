"use client";

import { UpgradePrompt } from "./upgrade-prompt";

interface GatedFeatureProps {
  feature: string;
  hasAccess: boolean;
  requiredTier?: "pro" | "elite";
  children: React.ReactNode;
}

export function GatedFeature({ feature, hasAccess, requiredTier = "pro", children }: GatedFeatureProps) {
  if (hasAccess) return <>{children}</>;

  return (
    <UpgradePrompt
      feature={feature}
      requiredTier={requiredTier}
      variant="overlay"
    />
  );
}
