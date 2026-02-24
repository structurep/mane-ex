import { getNotifications } from "@/actions/notifications";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import Link from "next/link";
import { MarkAllReadButton } from "./mark-all-read-button";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default async function NotificationsPage() {
  const { data: notifications } = await getNotifications(50);
  const allNotifications = (notifications ?? []) as Array<{
    id: string;
    type: string;
    title: string;
    body: string | null;
    link: string | null;
    read_at: string | null;
    created_at: string;
  }>;

  const unread = allNotifications.filter((n) => !n.read_at).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-black">
            Notifications
          </h1>
          <p className="mt-1 text-ink-mid">
            {unread > 0
              ? `${unread} unread notification${unread !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unread > 0 && <MarkAllReadButton />}
      </div>

      {allNotifications.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 border-0 p-12 text-center shadow-flat">
          <Bell className="h-10 w-10 text-ink-faint" />
          <div>
            <p className="font-medium text-ink-black">No notifications</p>
            <p className="mt-1 text-sm text-ink-mid">
              You&apos;ll be notified about offers, messages, and more.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {allNotifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 transition-shadow hover:shadow-flat ${
                !n.read_at ? "border-l-2 border-l-red bg-paper-cream/30" : ""
              }`}
            >
              {n.link ? (
                <Link href={n.link} className="block">
                  <p className="font-medium text-ink-black">{n.title}</p>
                  {typeof n.body === "string" && (
                    <p className="mt-0.5 text-sm text-ink-mid">{n.body}</p>
                  )}
                  <p className="mt-1 text-xs text-ink-light">
                    {timeAgo(n.created_at)}
                  </p>
                </Link>
              ) : (
                <div>
                  <p className="font-medium text-ink-black">{n.title}</p>
                  {typeof n.body === "string" && (
                    <p className="mt-0.5 text-sm text-ink-mid">{n.body}</p>
                  )}
                  <p className="mt-1 text-xs text-ink-light">
                    {timeAgo(n.created_at)}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
