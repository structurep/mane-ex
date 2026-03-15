import { getAdminStats } from "@/actions/admin";
import {
  Users,
  ListChecks,
  Flag,
  DollarSign,
  CheckCircle2,
  XCircle,
  Ban,
  Unlock,
  ShieldCheck,
  Wallet,
  Bell,
  Settings,
  Clock,
} from "lucide-react";
import {
  SectionHeading,
  ActivityFeed,
  StatusBadge,
  type ActivityItem,
} from "@/components/tailwind-plus";
import { type ReactNode } from "react";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const actionConfig: Record<string, { label: string; icon: ReactNode; bg: string }> = {
  approve_listing: { label: "Approved listing", icon: <CheckCircle2 className="h-4 w-4 text-forest" />, bg: "bg-forest/10" },
  reject_listing: { label: "Rejected listing", icon: <XCircle className="h-4 w-4 text-red" />, bg: "bg-red-light" },
  suspend_user: { label: "Suspended user", icon: <Ban className="h-4 w-4 text-red" />, bg: "bg-red-light" },
  unsuspend_user: { label: "Unsuspended user", icon: <Unlock className="h-4 w-4 text-forest" />, bg: "bg-forest/10" },
  resolve_report: { label: "Resolved report", icon: <ShieldCheck className="h-4 w-4 text-ink-mid" />, bg: "bg-paper-warm" },
  override_escrow: { label: "Override escrow", icon: <Wallet className="h-4 w-4 text-gold" />, bg: "bg-gold/10" },
  update_score_config: { label: "Updated score config", icon: <Settings className="h-4 w-4 text-ink-mid" />, bg: "bg-paper-warm" },
  manual_notification: { label: "Sent notification", icon: <Bell className="h-4 w-4 text-oxblood" />, bg: "bg-oxblood/5" },
};

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const kpis = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, accent: "text-ink-mid" },
    { label: "Active Listings", value: stats.activeListings, icon: ListChecks, accent: "text-oxblood" },
    { label: "Pending Review", value: stats.pendingReview, icon: Clock, accent: "text-gold" },
    { label: "Open Reports", value: stats.openReports, icon: Flag, accent: "text-red" },
    { label: "Active Escrows", value: stats.activeEscrows, icon: DollarSign, accent: "text-gold" },
  ];

  const activityItems: ActivityItem[] = stats.recentAuditLog.map(
    (entry: {
      id: string;
      action: string;
      target_type: string;
      target_id: string;
      created_at: string;
    }) => {
      const config = actionConfig[entry.action] || {
        label: entry.action,
        icon: <Settings className="h-4 w-4 text-ink-faint" />,
        bg: "bg-paper-warm",
      };
      return {
        id: entry.id,
        icon: config.icon,
        iconBg: config.bg,
        content: (
          <p>
            <span className="font-medium text-ink-dark">{config.label}</span>
            <StatusBadge variant="gray" className="ml-2 inline-flex">
              {entry.target_type}
            </StatusBadge>
          </p>
        ),
        timestamp: timeAgo(entry.created_at),
        dateTime: entry.created_at,
      };
    }
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
          Admin Overview
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          Platform health at a glance.
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-lg bg-paper-cream p-5 shadow-flat">
              <Icon className={`h-4 w-4 ${kpi.accent}`} />
              <p className="mt-2 font-serif text-2xl font-bold text-ink-black">
                {kpi.value}
              </p>
              <p className="mt-0.5 text-[11px] tracking-wide text-ink-faint">
                {kpi.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent audit log */}
      <section>
        <SectionHeading title="Recent Activity" />
        {activityItems.length === 0 ? (
          <div className="mt-2 rounded-lg bg-paper-cream p-8 text-center shadow-flat">
            <p className="text-sm text-ink-mid">No recent admin activity.</p>
          </div>
        ) : (
          <div className="mt-2 rounded-lg bg-paper-cream p-5 shadow-flat">
            <ActivityFeed items={activityItems} />
          </div>
        )}
      </section>
    </div>
  );
}
