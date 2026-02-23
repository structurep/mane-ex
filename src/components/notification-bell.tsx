"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
} from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Fetch unread count on mount
  useEffect(() => {
    getUnreadCount().then(({ count }) => setUnread(count));
  }, []);

  const loadNotifications = useCallback(async () => {
    if (loaded) return;
    const { data } = await getNotifications(10);
    if (data) {
      setNotifications(data as Notification[]);
      setLoaded(true);
    }
  }, [loaded]);

  function toggle() {
    if (!open) {
      loadNotifications();
    }
    setOpen((o) => !o);
  }

  async function handleMarkRead(id: string) {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
    setUnread((c) => Math.max(0, c - 1));
  }

  async function handleMarkAllRead() {
    await markAllRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
    );
    setUnread(0);
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative rounded-md p-1.5 text-ink-mid transition-colors hover:bg-paper-warm hover:text-ink-black"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-crease-light bg-paper-white shadow-lifted">
            <div className="flex items-center justify-between border-b border-crease-light px-4 py-3">
              <p className="text-sm font-semibold text-ink-black">
                Notifications
              </p>
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-ink-light hover:text-ink-black"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-ink-light">
                  No notifications yet
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`border-b border-crease-light px-4 py-3 last:border-0 ${
                      !n.read_at ? "bg-paper-cream/50" : ""
                    }`}
                  >
                    {n.link ? (
                      <Link
                        href={n.link}
                        onClick={() => {
                          if (!n.read_at) handleMarkRead(n.id);
                          setOpen(false);
                        }}
                        className="block"
                      >
                        <p className="text-sm font-medium text-ink-black">
                          {n.title}
                        </p>
                        {typeof n.body === "string" && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-ink-mid">
                            {n.body}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-ink-light">
                          {timeAgo(n.created_at)}
                        </p>
                      </Link>
                    ) : (
                      <div
                        onClick={() => {
                          if (!n.read_at) handleMarkRead(n.id);
                        }}
                      >
                        <p className="text-sm font-medium text-ink-black">
                          {n.title}
                        </p>
                        {typeof n.body === "string" && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-ink-mid">
                            {n.body}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-ink-light">
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-crease-light px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                asChild
              >
                <Link href="/dashboard/notifications" onClick={() => setOpen(false)}>
                  View all notifications
                </Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
