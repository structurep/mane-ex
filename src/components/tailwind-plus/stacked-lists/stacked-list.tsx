import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { type ReactNode } from "react";

export interface StackedListItem {
  id: string;
  href: string;
  imageUrl?: string;
  initials?: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  status?: ReactNode;
  badge?: ReactNode;
}

interface StackedListProps {
  items: StackedListItem[];
  className?: string;
}

export function StackedList({ items, className }: StackedListProps) {
  return (
    <ul role="list" className={cn("divide-y divide-crease-light", className)}>
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className="group relative flex items-center justify-between gap-x-4 py-4 hover:bg-paper-warm/50"
          >
            <div className="flex min-w-0 gap-x-3">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 flex-none rounded-full bg-paper-warm object-cover"
                />
              ) : item.initials ? (
                <span className="flex size-10 flex-none items-center justify-center rounded-full bg-paper-warm text-sm font-medium text-ink-mid">
                  {item.initials}
                </span>
              ) : null}
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-medium text-ink-dark group-hover:text-primary">
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="mt-0.5 truncate text-xs text-ink-mid">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-x-3">
              <div className="hidden sm:flex sm:flex-col sm:items-end">
                {item.meta && (
                  <div className="text-sm text-ink-mid">{item.meta}</div>
                )}
                {item.status && (
                  <div className="mt-0.5 text-xs text-ink-faint">{item.status}</div>
                )}
              </div>
              {item.badge}
              <ChevronRight className="size-4 flex-none text-ink-faint" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
