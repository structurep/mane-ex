import { Sparkles } from "lucide-react";
import { getListingMatchPercent } from "@/lib/match/match-alerts";

/**
 * Server component: shows a subtle "Excellent match" banner
 * when the listing scores >= 85% match for the current user.
 * Origami-styled with diagonal fold accent.
 */
export async function MatchBanner({ listingId }: { listingId: string }) {
  const matchPercent = await getListingMatchPercent(listingId);

  if (matchPercent == null || matchPercent < 85) return null;

  return (
    <div className="paper-flat relative mb-4 flex items-center gap-3 border-l-2 border-l-[var(--accent-gold)] px-4 py-3">
      <Sparkles className="h-4 w-4 flex-none text-[var(--accent-gold)]" />
      <p className="text-sm text-[var(--ink-dark)]">
        <span className="font-bold text-[var(--accent-gold)]">{matchPercent}% match</span>
        <span className="mx-1.5 text-[var(--paper-border-strong)]">/</span>
        Excellent match for your preferences
      </p>
    </div>
  );
}
