import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "@/components/layout/mobile-nav";
import { DashboardSidebar } from "./sidebar";
import { NotificationBell } from "@/components/messaging/notification-bell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-crease-light bg-paper-white/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon.svg" alt="ManeExchange" width={28} height={28} />
            <span className="hidden font-heading text-lg font-semibold tracking-tight text-ink-black sm:inline">
              Mane<span className="font-normal text-ink-mid">Exchange</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/browse"
              className="text-sm text-ink-mid hover:text-ink-black"
            >
              Browse
            </Link>
            <NotificationBell />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <DashboardSidebar />

        {/* Main content */}
        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
