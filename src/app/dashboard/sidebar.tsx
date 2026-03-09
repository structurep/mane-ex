"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCreateListingUrl } from "@/lib/urls";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  MessageCircle,
  HandCoins,
  BarChart3,
  Settings,
  Plus,
  Store,
  LogOut,
  Heart,
  Star,
  Calendar,
  Search,
  FileText,
  Shield,
  CalendarDays,
  GraduationCap,
  Users,
  Newspaper,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
  collapsible?: boolean;
};

const navGroups: NavGroup[] = [
  {
    id: "top",
    label: "",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
    ],
  },
  {
    id: "selling",
    label: "Selling",
    items: [
      { href: "/dashboard/listings", label: "My Listings", icon: ClipboardList },
      { href: "/dashboard/offers", label: "Offers", icon: HandCoins },
      { href: "/dashboard/reviews", label: "Reviews", icon: Star },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/farm", label: "Barn Page", icon: Store },
      { href: "/dashboard/farm/members", label: "Members", icon: Users },
      { href: "/dashboard/farm/feed", label: "Barn Feed", icon: Newspaper },
    ],
  },
  {
    id: "buying",
    label: "Buying",
    items: [
      { href: "/dashboard/buyer", label: "Buyer Portal", icon: ShoppingBag },
      { href: "/dashboard/dream-barn", label: "Dream Barn", icon: Heart },
      { href: "/dashboard/isos", label: "ISOs", icon: Search },
      { href: "/dashboard/trials", label: "Trials & Tours", icon: Calendar },
    ],
  },
  {
    id: "account",
    label: "Account",
    collapsible: true,
    items: [
      { href: "/dashboard/trainer", label: "Trainer Portal", icon: GraduationCap },
      { href: "/dashboard/documents", label: "Documents", icon: FileText },
      { href: "/dashboard/schedule", label: "Schedule", icon: CalendarDays },
      { href: "/dashboard/leases", label: "Leases", icon: FileText },
      { href: "/dashboard/disputes", label: "Disputes", icon: Shield },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    account: true,
  });

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r border-crease-light bg-washi md:block">
      <div className="flex h-full flex-col overflow-y-auto">
        {/* New listing CTA */}
        <div className="p-4 pb-2">
          <Button size="sm" className="w-full" asChild>
            <Link href={getCreateListingUrl()}>
              <Plus className="mr-2 h-4 w-4" />
              New Listing
            </Link>
          </Button>
        </div>

        {/* Grouped nav */}
        <nav className="flex-1 px-3 pb-4">
          {navGroups.map((group) => {
            const isCollapsible = group.collapsible;
            const isCollapsed = collapsed[group.id];
            const hasActiveChild = group.items.some((item) =>
              item.exact ? pathname === item.href : pathname.startsWith(item.href)
            );

            return (
              <div key={group.id} className="mt-4 first:mt-2">
                {group.label && (
                  <button
                    type="button"
                    onClick={() =>
                      isCollapsible &&
                      setCollapsed((prev) => ({ ...prev, [group.id]: !prev[group.id] }))
                    }
                    className={cn(
                      "flex w-full items-center justify-between px-2 pb-1.5",
                      isCollapsible && "cursor-pointer hover:text-ink-mid"
                    )}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">
                      {group.label}
                    </span>
                    {isCollapsible && (
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 text-ink-faint transition-transform duration-200",
                          !isCollapsed && "rotate-180"
                        )}
                      />
                    )}
                  </button>
                )}

                {/* Show items if not collapsed, or if has active child */}
                {(!isCollapsible || !isCollapsed || hasActiveChild) && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                      const Icon = item.icon;

                      // If section is collapsed but this item is active, still show it
                      if (isCollapsible && isCollapsed && !isActive) return null;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                            isActive
                              ? "bg-paper-white text-ink-black shadow-flat"
                              : "text-ink-mid hover:bg-paper-white/60 hover:text-ink-dark"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              isActive ? "text-oxblood" : "text-ink-faint group-hover:text-ink-mid"
                            )}
                          />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="border-t border-crease-light px-3 py-3">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-ink-faint transition-colors hover:bg-paper-warm hover:text-ink-dark"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
