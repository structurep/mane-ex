import { getAdminReports } from "@/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ResolveReportButton } from "./resolve-button";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  dismissed: "bg-gray-100 text-gray-600",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status === "resolved" ? "resolved" : status === "all" ? "all" : "pending";
  const reports = await getAdminReports(filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-black">
          Reports
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          {reports.length} reports
        </p>
      </div>

      {/* Status filters */}
      <div className="flex gap-2">
        {(["pending", "resolved", "all"] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/reports${s !== "pending" ? `?status=${s}` : ""}`}
            className={`rounded-md px-3 py-1.5 text-sm capitalize ${
              filter === s
                ? "bg-ink-black text-white"
                : "bg-paper-warm text-ink-mid hover:text-ink-black"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Report list */}
      <div className="space-y-3">
        {reports.map(
          (report: {
            id: string;
            target_type: string;
            target_id: string;
            reason: string;
            details: string | null;
            status: string;
            reporter_id: string;
            created_at: string;
            resolution_note: string | null;
          }) => (
            <Card key={report.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[report.status] || ""}>
                        {report.status}
                      </Badge>
                      <Badge variant="outline">{report.target_type}</Badge>
                      <span className="text-xs text-ink-light">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-ink-black">
                      {report.reason}
                    </p>
                    {report.details && (
                      <p className="text-xs text-ink-mid">{report.details}</p>
                    )}
                    {report.resolution_note && (
                      <p className="text-xs text-green-600">
                        Resolution: {report.resolution_note}
                      </p>
                    )}
                  </div>

                  {report.status === "pending" && (
                    <ResolveReportButton reportId={report.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          )
        )}

        {reports.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-mid">
            No reports found.
          </p>
        )}
      </div>
    </div>
  );
}
