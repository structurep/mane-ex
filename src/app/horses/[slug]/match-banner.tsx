import { Sparkles } from "lucide-react";
import { getListingMatchPercent } from "@/lib/match/match-alerts";

/**
 * Server component: shows a subtle "Excellent match" banner
 * when the listing scores >= 85% match for the current user.
 */
export async function MatchBanner({ listingId }: { listingId: string }) {
  const matchPercent = await getListingMatchPercent(listingId);

  if (matchPercent == null || matchPercent < 85) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-gold/20 bg-gold/5 px-4 py-2.5">
      <Sparkles className="h-4 w-4 flex-none text-gold" />
      <p className="text-sm font-medium text-ink-dark">
        <span className="font-bold text-gold">{matchPercent}% match</span>
        {" — "}
        Excellent match for your preferences
      </p>
    </div>
  );
}
