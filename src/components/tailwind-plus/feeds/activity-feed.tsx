import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export interface ActivityItem {
  id: string;
  icon: ReactNode;
  iconBg?: string;
  content: ReactNode;
  timestamp: string;
  dateTime?: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  return (
    <div className={cn("flow-root", className)}>
      <ul role="list" className="-mb-8">
        {items.map((item, idx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {idx !== items.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-crease-light"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div
                  className={cn(
                    "relative flex size-10 shrink-0 items-center justify-center rounded-full",
                    item.iconBg || "bg-paper-warm"
                  )}
                >
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="text-sm text-ink-mid">{item.content}</div>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    <time dateTime={item.dateTime}>{item.timestamp}</time>
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
