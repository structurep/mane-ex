import { getNotifications } from "@/actions/notifications";
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/tailwind-plus";
import { MarkAllReadButton } from "./mark-all-read-button";
import { NotificationCard } from "./notification-card";

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
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-ink-mid">
            {unread > 0
              ? `${unread} unread notification${unread !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unread > 0 && <MarkAllReadButton />}
      </div>

      {allNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-10" />}
          title="No notifications"
          description="You'll be notified about offers, messages, and listing updates."
        />
      ) : (
        <div className="divide-y divide-crease-light rounded-lg bg-paper-white shadow-flat overflow-hidden">
          {allNotifications.map((n) => (
            <NotificationCard key={n.id} n={n} />
          ))}
        </div>
      )}
    </div>
  );
}
