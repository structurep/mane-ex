import { Metadata } from "next";
import { Sparkles, Bell } from "lucide-react";
import { getMatchAlerts, checkForNewMatches } from "@/lib/match/match-alerts";
import { EmptyState } from "@/components/tailwind-plus";
import { AlertCard } from "./alert-card";
import { MarkAllAlertsReadButton } from "./mark-all-read-button";

export const metadata: Metadata = {
  title: "Match Alerts",
  description: "New listings that match your preferences.",
};

export default async function AlertsPage() {
  // Fire-and-forget: check for new matches on page load
  checkForNewMatches().catch(() => {});

  const { alerts, unreadCount } = await getMatchAlerts(50);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent-gold)]" />
            <h1 className="display-md text-[var(--ink-black)]">
              Match Alerts
            </h1>
          </div>
          <p className="mt-1 text-sm text-[var(--ink-mid)]">
            {unreadCount > 0
              ? `${unreadCount} new match${unreadCount !== 1 ? "es" : ""} found`
              : "We'll notify you when new listings match your preferences."}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllAlertsReadButton />}
      </div>

      <div className="crease-divider" />

      {alerts.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-10" />}
          title="No match alerts yet"
          description="Keep browsing and favoriting horses — we'll alert you when new listings match your taste."
        />
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
