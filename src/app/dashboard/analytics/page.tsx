import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyScore } from "@/actions/scoring";
import { ManeScoreBadge } from "@/components/mane-score-badge";
import { BadgeShowcase } from "@/components/badge-showcase";
import { Leaderboard } from "@/components/leaderboard";
import { MANE_SCORE_DISCLAIMER } from "@/types/scoring";
import {
  BarChart3,
  ArrowRight,
  Lightbulb,
  FileCheck,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Analytics — Mane Score",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { score, suggestions } = await getMyScore();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-black">Analytics</h1>
        <p className="mt-1 text-sm text-ink-mid">
          Your Mane Score and seller performance metrics.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — Score + Breakdown + Badges */}
        <div className="space-y-6 lg:col-span-2">
          {/* Mane Score card */}
          {score ? (
            <ManeScoreBadge
              score={score.mane_score}
              grade={score.grade}
              variant="full"
            />
          ) : (
            <div className="rounded-lg border border-dashed border-crease-mid bg-paper-cream p-8 text-center">
              <BarChart3 className="mx-auto h-10 w-10 text-ink-faint" />
              <h3 className="mt-4 font-medium text-ink-dark">
                No Mane Score yet
              </h3>
              <p className="mt-1 text-sm text-ink-mid">
                Create your first listing to start building your score.
              </p>
            </div>
          )}

          {/* Component Breakdown */}
          {score && (
            <div className="rounded-lg border border-border bg-paper-cream p-6 shadow-flat">
              <h2 className="mb-4 font-medium text-ink-dark">
                Score Breakdown
              </h2>

              <div className="space-y-4">
                {/* Completeness */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-forest" />
                      <span className="text-sm font-medium text-ink-dark">
                        Completeness
                      </span>
                    </div>
                    <span className="text-sm font-bold text-ink-black">
                      {score.completeness_component}
                      <span className="font-normal text-ink-light">/500</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-paper-warm">
                    <div
                      className="h-full rounded-full bg-forest transition-all duration-500"
                      style={{
                        width: `${Math.min((score.completeness_component / 500) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-ink-light">
                    How complete and documented your listings are
                  </p>
                </div>

                {/* Engagement */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue" />
                      <span className="text-sm font-medium text-ink-dark">
                        Engagement
                      </span>
                    </div>
                    <span className="text-sm font-bold text-ink-black">
                      {score.engagement_component}
                      <span className="font-normal text-ink-light">/350</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-paper-warm">
                    <div
                      className="h-full rounded-full bg-blue transition-all duration-500"
                      style={{
                        width: `${Math.min((score.engagement_component / 350) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-ink-light">
                    Views, saves, inquiries, and completed sales
                  </p>
                </div>

                {/* Credibility */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-gold" />
                      <span className="text-sm font-medium text-ink-dark">
                        Credibility
                      </span>
                    </div>
                    <span className="text-sm font-bold text-ink-black">
                      {score.credibility_component}
                      <span className="font-normal text-ink-light">/150</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-paper-warm">
                    <div
                      className="h-full rounded-full bg-gold transition-all duration-500"
                      style={{
                        width: `${Math.min((score.credibility_component / 150) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-ink-light">
                    Response time, account history, and transaction record
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Badges */}
          {score && (
            <div className="rounded-lg border border-border bg-paper-cream p-6 shadow-flat">
              <h2 className="mb-4 font-medium text-ink-dark">Badges</h2>
              <BadgeShowcase earnedBadges={score.badges} variant="grid" />
            </div>
          )}

          {/* Improvement suggestions */}
          {suggestions.length > 0 && (
            <div className="rounded-lg border border-border bg-paper-cream p-6 shadow-flat">
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-gold" />
                <h2 className="font-medium text-ink-dark">
                  Boost Your Score
                </h2>
              </div>
              <div className="space-y-3">
                {suggestions.map((suggestion, i) => (
                  <Link
                    key={i}
                    href={suggestion.link}
                    className="flex items-center justify-between rounded-md border border-border bg-paper-white p-3 transition-colors hover:bg-paper-warm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink-dark">
                        {suggestion.action}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <span className="whitespace-nowrap text-xs font-semibold text-forest">
                        {suggestion.points}
                      </span>
                      <ArrowRight className="h-3 w-3 text-ink-light" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — Leaderboard */}
        <div className="lg:col-span-1">
          <Leaderboard currentUserId={user.id} />
        </div>
      </div>

      {/* Views Over Time */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-ink-black">Views Over Time</h2>
        <div className="rounded-lg border border-border bg-paper-white p-6">
          {/* Simple bar chart visualization using divs */}
          <div className="flex items-end gap-2 h-40">
            {[
              { label: "Mon", value: 12 },
              { label: "Tue", value: 18 },
              { label: "Wed", value: 24 },
              { label: "Thu", value: 15 },
              { label: "Fri", value: 32 },
              { label: "Sat", value: 28 },
              { label: "Sun", value: 20 },
            ].map((day) => (
              <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-ink-mid">{day.value}</span>
                <div
                  className="w-full rounded-t-md bg-blue/20 transition-all"
                  style={{ height: `${(day.value / 32) * 100}%` }}
                />
                <span className="text-xs text-ink-light">{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traffic Sources */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-ink-black">Traffic Sources</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-paper-white p-6">
            <div className="space-y-4">
              {[
                { source: "Direct", percent: 42, color: "bg-blue" },
                { source: "Search", percent: 28, color: "bg-forest" },
                { source: "External Links", percent: 18, color: "bg-gold" },
                { source: "Recommendations", percent: 12, color: "bg-red" },
              ].map((item) => (
                <div key={item.source}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-ink-dark">{item.source}</span>
                    <span className="font-medium text-ink-black">{item.percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-paper-warm">
                    <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-paper-white p-6">
            <h3 className="mb-4 font-medium text-ink-black">Conversion Funnel</h3>
            <div className="space-y-3">
              {[
                { stage: "Views", count: 847, percent: 100 },
                { stage: "Inquiries", count: 124, percent: 14.6 },
                { stage: "Offers", count: 32, percent: 3.8 },
                { stage: "Sold", count: 8, percent: 0.9 },
              ].map((item) => (
                <div key={item.stage} className="flex items-center gap-3">
                  <div className="w-full">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-ink-dark">{item.stage}</span>
                      <span className="text-ink-mid">{item.count} ({item.percent}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-paper-warm">
                      <div className="h-2 rounded-full bg-forest" style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Per-Listing Performance */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-ink-black">Listing Performance</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-paper-cream">
                <th className="px-4 py-3 text-left text-xs font-medium text-ink-mid">Listing</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-ink-mid">Views</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-ink-mid">Saves</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-ink-mid">Inquiries</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-ink-mid">Offers</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-ink-mid">Score</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Midnight Storm", views: 342, saves: 28, inquiries: 12, offers: 3, score: 920 },
                { name: "Golden Promise", views: 215, saves: 19, inquiries: 8, offers: 2, score: 845 },
                { name: "Sapphire Blue", views: 178, saves: 14, inquiries: 5, offers: 1, score: 780 },
                { name: "Thunder Road", views: 112, saves: 8, inquiries: 3, offers: 0, score: 650 },
              ].map((listing) => (
                <tr key={listing.name} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-ink-black">{listing.name}</td>
                  <td className="px-4 py-3 text-right text-sm text-ink-mid">{listing.views}</td>
                  <td className="px-4 py-3 text-right text-sm text-ink-mid">{listing.saves}</td>
                  <td className="px-4 py-3 text-right text-sm text-ink-mid">{listing.inquiries}</td>
                  <td className="px-4 py-3 text-right text-sm text-ink-mid">{listing.offers}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-forest">{listing.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Legal disclaimer */}
      <div className="mt-8 rounded-md bg-paper-warm p-4 text-xs text-ink-light">
        {MANE_SCORE_DISCLAIMER}
      </div>
    </div>
  );
}
