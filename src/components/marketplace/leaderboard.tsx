"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLeaderboard } from "@/actions/scoring";
import { MANE_SCORE_DISCLAIMER, GRADE_LABELS, type LeaderboardEntry, type LeaderboardCategory } from "@/types/scoring";
import { Trophy, FileCheck, TrendingUp, ShieldCheck } from "lucide-react";

const CATEGORIES: { id: LeaderboardCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "most_complete", label: "Most Complete", icon: FileCheck },
  { id: "most_active", label: "Most Active", icon: TrendingUp },
  { id: "most_credible", label: "Most Credible", icon: ShieldCheck },
];

type LeaderboardProps = {
  currentUserId?: string;
};

export function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>("most_complete");
  const [entries, setEntries] = useState<Record<LeaderboardCategory, LeaderboardEntry[]>>({
    most_complete: [],
    most_active: [],
    most_credible: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      const result = await getLeaderboard(activeCategory, 10);
      if (!result.error) {
        setEntries((prev) => ({ ...prev, [activeCategory]: result.entries }));
      }
      setLoading(false);
    }
    loadLeaderboard();
  }, [activeCategory]);

  return (
    <div className="rounded-lg border border-crease-light bg-paper-cream shadow-flat">
      <div className="flex items-center gap-2 border-b border-crease-light px-6 py-4">
        <Trophy className="h-5 w-5 text-gold" />
        <h2 className="font-medium text-ink-dark">Leaderboard</h2>
      </div>

      <Tabs
        value={activeCategory}
        onValueChange={(v) => setActiveCategory(v as LeaderboardCategory)}
        className="px-6 pt-4"
      >
        <TabsList className="w-full">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="flex-1 text-xs">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="mt-4">
            {loading && entries[cat.id].length === 0 ? (
              <div className="py-8 text-center text-sm text-ink-light">
                Loading...
              </div>
            ) : entries[cat.id].length === 0 ? (
              <div className="py-8 text-center text-sm text-ink-light">
                No sellers on the leaderboard yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {entries[cat.id].map((entry) => {
                  const isCurrentUser = entry.seller_id === currentUserId;
                  const gradeInfo = GRADE_LABELS[entry.grade];

                  return (
                    <div
                      key={entry.seller_id}
                      className={`flex items-center gap-4 py-3 ${
                        isCurrentUser ? "rounded-md bg-gold/5 px-2" : ""
                      }`}
                    >
                      {/* Rank */}
                      <span
                        className={`w-6 text-center text-sm font-bold ${
                          entry.rank <= 3 ? "text-gold" : "text-ink-light"
                        }`}
                      >
                        {entry.rank}
                      </span>

                      {/* Avatar */}
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-paper-warm" />

                      {/* Name + grade */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-dark">
                          {entry.display_name || "Seller"}
                          {isCurrentUser && (
                            <span className="ml-1 text-xs text-gold">(you)</span>
                          )}
                        </p>
                        <p className={`text-xs ${gradeInfo.color}`}>
                          {gradeInfo.label}
                        </p>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-ink-black">
                          {entry.mane_score.toLocaleString()}
                        </p>
                        <p className="text-xs text-ink-light">
                          {entry.badge_count > 0
                            ? `${entry.badge_count} badge${entry.badge_count !== 1 ? "s" : ""}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <div className="border-t border-crease-light px-6 py-3">
        <p className="text-xs text-ink-light">{MANE_SCORE_DISCLAIMER}</p>
      </div>
    </div>
  );
}
