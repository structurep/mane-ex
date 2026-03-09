"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { getUnreadCount } from "@/actions/notifications";

export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    getUnreadCount().then(({ count }) => setCount(count));

    // Poll every 30 seconds for new notifications
    const interval = setInterval(() => {
      getUnreadCount().then(({ count }) => setCount(count));
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/dashboard/notifications"
      className="relative rounded-full p-2.5 text-ink-mid transition-colors hover:bg-gold-light hover:text-gold"
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-oxblood px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
