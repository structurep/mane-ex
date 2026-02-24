import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/admin";
import {
  LayoutDashboard,
  Users,
  ListChecks,
  Flag,
  DollarSign,
  ArrowLeft,
} from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: ListChecks },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/transactions", label: "Transactions", icon: DollarSign },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect non-admins
  await requireAdmin();

  return (
    <div className="min-h-screen bg-paper-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-crease-light bg-ink-black text-white">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Image src="/icon.svg" alt="ManeExchange" width={28} height={28} />
            <span className="font-heading text-lg font-semibold tracking-tight">
              Admin Panel
            </span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-crease-light bg-paper-cream md:block">
          <nav className="flex flex-col gap-0.5 p-3">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-mid transition-colors hover:bg-paper-warm hover:text-ink-black"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-crease-light bg-paper-white md:hidden">
          <nav className="flex justify-around py-2">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 p-1 text-xs text-ink-mid"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
