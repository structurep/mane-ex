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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
    ],
  },
  {
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
    label: "Buying",
    items: [
      { href: "/dashboard/buyer", label: "Buyer Portal", icon: ShoppingBag },
      { href: "/dashboard/dream-barn", label: "Dream Barn", icon: Heart },
      { href: "/dashboard/isos", label: "ISOs", icon: Search },
      { href: "/dashboard/trials", label: "Trials & Tours", icon: Calendar },
    ],
  },
  {
    label: "Account",
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

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r border-crease-light bg-washi md:block">
      <div className="flex h-full flex-col overflow-y-auto p-4">
        {/* New listing CTA */}
        <Button size="sm" className="mb-5 w-full" asChild>
          <Link href={getCreateListingUrl()}>
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Link>
        </Button>

        {/* Grouped nav */}
        <nav className="flex-1 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label || "top"}>
              {group.label && (
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-ink-light">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "border-l-2 border-primary bg-paper-white text-ink-black"
                          : "border-l-2 border-transparent text-ink-mid hover:bg-paper-warm hover:text-ink-black"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ink-light transition-colors hover:bg-paper-warm hover:text-ink-black"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
