import { getAdminStats } from "@/actions/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ListChecks, Flag, DollarSign, Clock } from "lucide-react";

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

const actionLabels: Record<string, string> = {
  approve_listing: "Approved listing",
  reject_listing: "Rejected listing",
  suspend_user: "Suspended user",
  unsuspend_user: "Unsuspended user",
  resolve_report: "Resolved report",
  override_escrow: "Override escrow",
  update_score_config: "Updated score config",
  manual_notification: "Sent notification",
};

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

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

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-paper-warm p-2.5">
              <Users className="h-5 w-5 text-ink-mid" />
            </div>
            <div>
              <p className="font-serif text-2xl font-bold text-ink-black">
                {stats.totalUsers}
              </p>
              <p className="text-xs text-ink-mid">Total Users</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-green-50 p-2.5">
              <ListChecks className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-serif text-2xl font-bold text-ink-black">
                {stats.activeListings}
              </p>
              <p className="text-xs text-ink-mid">Active Listings</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-red-light p-2.5">
              <Flag className="h-5 w-5 text-red" />
            </div>
            <div>
              <p className="font-serif text-2xl font-bold text-ink-black">
                {stats.openReports}
              </p>
              <p className="text-xs text-ink-mid">Open Reports</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-amber-50 p-2.5">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-serif text-2xl font-bold text-ink-black">
                {stats.activeEscrows}
              </p>
              <p className="text-xs text-ink-mid">Active Escrows</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent audit log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentAuditLog.length === 0 ? (
            <p className="text-sm text-ink-mid">No recent admin activity.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentAuditLog.map(
                (entry: {
                  id: string;
                  action: string;
                  target_type: string;
                  target_id: string;
                  created_at: string;
                }) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between border-b border-crease-light pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {entry.target_type}
                      </Badge>
                      <span className="text-sm text-ink-black">
                        {actionLabels[entry.action] || entry.action}
                      </span>
                    </div>
                    <span className="text-xs text-ink-light">
                      {timeAgo(entry.created_at)}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
