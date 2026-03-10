"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import {
  Search,
  Heart,
  FileText,
  MessageCircle,
  LayoutDashboard,
  Gavel,
  BookOpen,
  Compass,
  LogIn,
} from "lucide-react";

const authedTabs = [
  { href: "/browse", label: "Horses", icon: Search },
  { href: "/dashboard/dream-barn", label: "Dream Barn", icon: Heart },
  { href: "/iso", label: "ISOs", icon: FileText },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const publicTabs = [
  { href: "/browse", label: "Horses", icon: Search },
  { href: "/just-sold", label: "Just Sold", icon: Gavel },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/login", label: "Log In", icon: LogIn },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const tabs = user ? authedTabs : publicTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-crease-light bg-paper-white/95 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-w-[48px] flex-col items-center gap-0.5 rounded-md px-2 py-1.5 transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none ${
                isActive ? "text-primary" : "text-ink-light"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area inset for iPhones with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
