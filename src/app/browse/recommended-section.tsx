import { Sparkles } from "lucide-react";
import { getRecommendedHorses } from "@/actions/recommended-horses";
import { checkForNewMatches } from "@/lib/match/match-alerts";
import { ListingCard, type ListingCardData } from "@/components/tailwind-plus";

/**
 * "Recommended For You" editorial rail on browse page.
 * Shows AI-matched listings with match percentage badges.
 * Renders null if user is anonymous or has insufficient interaction data.
 */
export async function RecommendedSection() {
  const result = await getRecommendedHorses();

  // Fire-and-forget: check for new match alerts while user is browsing
  checkForNewMatches().catch(() => {});

  if (!result || result.listings.length === 0) return null;

  const { listings } = result;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-gold" />
        <div>
          <h2 className="overline text-ink-mid">
            Recommended For You
          </h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            Based on your browsing and favorites
          </p>
        </div>
      </div>

      <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {listings.map((l) => (
          <div key={l.id} className="w-[260px] flex-none">
            <ListingCard
              listing={l as unknown as ListingCardData}
              matchPercent={l.matchPercent}
            />
          </div>
        ))}
      </div>
      <div className="crease-divider mt-6" />
    </section>
  );
}
