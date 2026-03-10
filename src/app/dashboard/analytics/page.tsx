import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyScore } from "@/actions/scoring";
import { getViewsByDay, getTrafficSources, getListingPerformance } from "@/actions/analytics";
import { ManeScoreBadge } from "@/components/marketplace/mane-score-badge";
import { BadgeShowcase } from "@/components/marketplace/badge-showcase";
import { Leaderboard } from "@/components/marketplace/leaderboard";
import { MANE_SCORE_DISCLAIMER } from "@/types/scoring";
import {
  BarChart3,
  ArrowRight,
  Lightbulb,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { SectionHeading, EmptyState } from "@/components/tailwind-plus";

export const metadata: Metadata = {
  title: "Analytics — Mane Score",
};

const sourceColors: Record<string, string> = {
  Direct: "bg-blue",
  Browse: "bg-forest",
  Search: "bg-gold",
  "External Links": "bg-oxblood",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch all analytics data in parallel
  const [{ score, suggestions }, viewsByDay, trafficSources, listingPerf] = await Promise.all([
    getMyScore(),
    getViewsByDay(user.id),
    getTrafficSources(user.id),
    getListingPerformance(user.id),
  ]);

  const totalViews = viewsByDay.reduce((sum, d) => sum + d.value, 0);
  const maxView = Math.max(...viewsByDay.map((d) => d.value), 1);

  // Traffic source percentages
  const totalSourceHits = trafficSources.reduce((sum, s) => sum + s.count, 0);
  const sourcesWithPercent = trafficSources.map((s) => ({
    ...s,
    percent: totalSourceHits > 0 ? Math.round((s.count / totalSourceHits) * 100) : 0,
  }));

  // Conversion funnel from real listing data
  const funnelTotalViews = listingPerf.reduce((sum, l) => sum + l.views, 0);
  const funnelInquiries = listingPerf.reduce((sum, l) => sum + l.inquiries, 0);
  const funnelOffers = listingPerf.reduce((sum, l) => sum + l.offers, 0);

  const hasAnalyticsData = totalViews > 0 || listingPerf.length > 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">Analytics</h1>
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
            <EmptyState
              icon={<BarChart3 className="size-10" />}
              title="No Mane Score yet"
              description="Create your first listing to start building your score."
              actionLabel="Create Listing"
              actionHref="/dashboard/listings/new"
            />
          )}

          {/* Component Breakdown */}
          {score && (
            <div className="rounded-lg border-0 bg-paper-cream p-6 shadow-flat">
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
            <div className="rounded-lg border-0 bg-paper-cream p-6 shadow-flat">
              <h2 className="mb-4 font-medium text-ink-dark">Badges</h2>
              <BadgeShowcase earnedBadges={score.badges} variant="grid" />
            </div>
          )}

          {/* Improvement suggestions */}
          {suggestions.length > 0 && (
            <div className="rounded-lg border-0 bg-paper-cream p-6 shadow-flat">
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
                    className="flex items-center justify-between rounded-md border-0 bg-paper-white p-3 shadow-flat transition-colors hover:bg-paper-warm"
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

      {/* Views Over Time — real data */}
      <section className="mt-8">
        <SectionHeading title="Views Over Time" />
        {hasAnalyticsData ? (
          <div className="rounded-lg border-0 bg-paper-white p-6 shadow-flat">
            <p className="mb-4 text-sm text-ink-mid">
              {totalViews} view{totalViews !== 1 ? "s" : ""} in the last 7 days
            </p>
            <div className="flex items-end gap-2 h-40">
              {viewsByDay.map((day) => (
                <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-ink-mid">{day.value}</span>
                  <div
                    className="w-full rounded-t-md bg-forest/20 transition-all"
                    style={{ height: `${maxView > 0 ? (day.value / maxView) * 100 : 0}%`, minHeight: day.value > 0 ? "4px" : "0" }}
                  />
                  <span className="text-xs text-ink-light">{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<Eye className="size-10" />}
            title="No views yet"
            description="View data will appear here once your listings get traffic."
          />
        )}
      </section>

      {/* Traffic Sources — real data */}
      {hasAnalyticsData && sourcesWithPercent.length > 0 && (
        <section className="mt-8">
          <SectionHeading title="Traffic Sources" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border-0 bg-paper-white p-6 shadow-flat">
              <div className="space-y-4">
                {sourcesWithPercent.map((item) => (
                  <div key={item.source}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-ink-dark">{item.source}</span>
                      <span className="font-medium text-ink-black">
                        {item.count} ({item.percent}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-paper-warm">
                      <div
                        className={`h-2 rounded-full ${sourceColors[item.source] || "bg-ink-light"}`}
                        style={{ width: `${item.percent}%`, minWidth: item.percent > 0 ? "4px" : "0" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border-0 bg-paper-white p-6 shadow-flat">
              <h3 className="mb-4 font-medium text-ink-black">Conversion Funnel</h3>
              <div className="space-y-3">
                {[
                  { stage: "Views", count: funnelTotalViews, percent: 100 },
                  { stage: "Inquiries", count: funnelInquiries, percent: funnelTotalViews > 0 ? Math.round((funnelInquiries / funnelTotalViews) * 100 * 10) / 10 : 0 },
                  { stage: "Offers", count: funnelOffers, percent: funnelTotalViews > 0 ? Math.round((funnelOffers / funnelTotalViews) * 100 * 10) / 10 : 0 },
                ].map((item) => (
                  <div key={item.stage} className="flex items-center gap-3">
                    <div className="w-full">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-ink-dark">{item.stage}</span>
                        <span className="text-ink-mid">{item.count} ({item.percent}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-paper-warm">
                        <div
                          className="h-2 rounded-full bg-forest"
                          style={{ width: `${item.percent}%`, minWidth: item.percent > 0 ? "4px" : "0" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Per-Listing Performance — real data */}
      {listingPerf.length > 0 && (
        <section className="mt-8">
          <SectionHeading title="Listing Performance" />
          <div className="rounded-lg border-0 overflow-hidden shadow-flat">
            <table className="w-full">
              <thead>
                <tr className="border-b border-crease-light bg-paper-cream">
                  <th className="px-4 py-3 text-left text-xs font-medium text-ink-mid">Listing</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-ink-mid">Views</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-ink-mid">Saves</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-ink-mid">Inquiries</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-ink-mid">Offers</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-ink-mid">Score</th>
                </tr>
              </thead>
              <tbody>
                {listingPerf.map((listing) => (
                  <tr key={listing.slug} className="border-b border-crease-light last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/horses/${listing.slug}`} className="text-sm font-medium text-ink-black hover:text-oxblood">
                        {listing.name}
                      </Link>
                    </td>
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
      )}

      {/* Seller Intelligence — coming soon */}
      <section className="mt-8">
        <div className="crease-divider mb-6" />
        <h2 className="mb-2 font-serif text-2xl font-semibold tracking-tight text-ink-black">Seller Intelligence</h2>
        <p className="mb-6 text-sm text-ink-mid">
          Market insights and actionable recommendations for your listings.
        </p>
        <div className="rounded-lg border border-dashed border-crease-mid bg-paper-cream">
          <EmptyState
            icon={<BarChart3 className="size-10" />}
            title="Seller Intelligence is coming soon"
            description="Pricing intelligence, demand signals, competitive positioning, and actionable recommendations — powered by real market data."
          />
        </div>
      </section>

      {/* Legal disclaimer */}
      <div className="mt-8 rounded-md bg-paper-warm p-4 text-xs text-ink-light">
        {MANE_SCORE_DISCLAIMER}
      </div>
    </div>
  );
}
