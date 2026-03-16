"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const MobileMenu = dynamic(
  () => import("./mobile-menu").then((m) => m.MobileMenu),
  { ssr: false }
);
import { useUser } from "@/hooks/use-user";
import { signOut } from "@/actions/auth";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  ChevronDown,
  Search,
  MessageCircle,
  Heart,
} from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import { AvatarCircle } from "@/components/tailwind-plus";

/* ─── Nav link sets ─── */

const publicNav = [
  { href: "/browse", label: "Browse Horses" },
  { href: "/disciplines", label: "Disciplines" },
  { href: "/how-it-works", label: "How It Works" },
];

const authedNav = [
  { href: "/browse", label: "Browse" },
  { href: "/dashboard/dream-barn", label: "Dream Barn" },
  { href: "/iso", label: "ISOs" },
  { href: "/just-sold", label: "Just Sold" },
];

const SCROLL_THRESHOLD = 32;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/browse?q=${encodeURIComponent(trimmed)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  const navLinks = user ? authedNav : publicNav;
  const initials = user?.user_metadata?.full_name
    ? (user.user_metadata.full_name as string)
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header
      className={`sticky top-0 z-50 border-b border-glass bg-warmwhite/95 backdrop-blur-sm transition-[height,box-shadow] duration-300 ease-out ${
        scrolled ? "shadow-[var(--shadow-fold-sm)]" : ""
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-[height] duration-300 ease-out md:px-8 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        {/* ─── Logo ─── */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-glass focus-visible:outline-none"
        >
          <Image
            src="/icon.svg"
            alt="ManeExchange"
            width={36}
            height={36}
            className={`transition-[width,height] duration-300 ease-out ${
              scrolled ? "h-7 w-7" : "h-8 w-8"
            }`}
          />
          <span className="hidden font-serif text-xl font-semibold tracking-tight text-ink sm:inline">
            Mane<span className="font-normal text-ink-mid">Exchange</span>
          </span>
        </Link>

        {/* ─── Center: Search bar (desktop) ─── */}
        <div className="mx-6 hidden max-w-md flex-1 lg:block">
          <form onSubmit={handleSearchSubmit} role="search">
            <div className="relative">
              <label htmlFor="header-search" className="sr-only">Search horses</label>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                id="header-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search breed, discipline, location..."
                className="input-paper w-full py-2 pl-9 pr-4 text-sm"
              />
            </div>
          </form>
        </div>

        {/* ─── Right zone: nav links + actions ─── */}
        <div className="hidden items-center gap-1 lg:flex">
          <nav className="flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-3 py-2 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-glass focus-visible:outline-none ${
                    isActive
                      ? "bg-ink/5 text-ink"
                      : "text-ink-mid hover:bg-stable hover:text-ink-dark"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/sell"
              className={`rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors ${
                pathname === "/sell"
                  ? "bg-ink/5 text-ink"
                  : "text-bronze hover:bg-bronze/[0.08]"
              }`}
            >
              Sell Your Horse
            </Link>
          </nav>

          <div className="mx-2 h-5 w-px bg-glass" />

          {loading ? (
            <div className="h-8 w-24 animate-shimmer rounded-xl" />
          ) : user ? (
            <>
              <Link
                href="/dashboard/messages"
                className="rounded-xl p-2.5 text-ink-mid transition-colors hover:bg-stable hover:text-ink-dark"
                aria-label="Messages"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard/dream-barn"
                className="rounded-xl p-2.5 text-ink-mid transition-colors hover:bg-bronze/[0.08] hover:text-bronze"
                aria-label="Saved"
              >
                <Heart className="h-5 w-5" />
              </Link>
              <NotificationBell />

              <div className="relative ml-1" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-1.5 rounded-xl border border-glass py-1 pl-1 pr-2.5 text-sm font-medium text-ink-dark transition-colors hover:bg-stable focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:outline-none"
                >
                  <AvatarCircle initials={initials} size={32} />
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-ink-faint transition-transform ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {menuOpen && (
                  <div className="paper-raised absolute right-0 mt-2 w-48 p-1">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-dark transition-colors hover:bg-stable"
                    >
                      <LayoutDashboard className="h-4 w-4 text-ink-faint" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-dark transition-colors hover:bg-stable"
                    >
                      <Settings className="h-4 w-4 text-ink-faint" />
                      Settings
                    </Link>
                    <div className="crease-divider-full my-1" />
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-faint transition-colors hover:bg-stable hover:text-ink-dark"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* ─── Mobile: search icon + hamburger ─── */}
        <div className="flex items-center gap-1 lg:hidden">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-xl p-2 text-ink-mid hover:bg-stable"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <MobileMenu user={user} loading={loading} />
        </div>
      </div>

      {/* ─── Mobile search bar (expandable) ─── */}
      {searchOpen && (
        <div className="border-t border-glass bg-warmwhite px-4 py-3 lg:hidden">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search breed, discipline, location..."
                className="input-paper w-full py-2.5 pl-9 pr-4 text-sm"
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
