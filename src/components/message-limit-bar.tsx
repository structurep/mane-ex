"use client";

import Link from "next/link";
import { UpgradePrompt } from "./upgrade-prompt";

interface MessageLimitBarProps {
  sent: number;
  limit: number;
  tier: "starter" | "pro" | "elite";
}

export function MessageLimitBar({ sent, limit, tier }: MessageLimitBarProps) {
  if (tier === "elite") return null;

  return (
    <UpgradePrompt
      feature="Unlimited messaging"
      currentTier={tier}
      requiredTier="pro"
      variant="limit-bar"
      usage={{ current: sent, max: limit, label: "Messages today" }}
    />
  );
}
