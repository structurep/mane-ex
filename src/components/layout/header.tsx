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
  Bell,
} from "lucide-react";

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

  // Close user menu on click outside
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

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  // Close menu on route change
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
      className={`sticky top-0 z-50 border-b border-border bg-paper-white/95 backdrop-blur-sm transition-[height,box-shadow] duration-300 ease-out ${
        scrolled ? "shadow-flat" : ""
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-[height] duration-300 ease-out md:px-8 ${
          scrolled ? "h-14" : "h-[4.5rem]"
        }`}
      >
        {/* ─── Logo ─── */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
        >
          <Image
            src="/icon.svg"
            alt="ManeExchange"
            width={36}
            height={36}
            className={`transition-[width,height] duration-300 ease-out ${
              scrolled ? "h-7 w-7" : "h-9 w-9"
            }`}
          />
          <span className="hidden font-serif text-xl font-semibold tracking-tight text-ink-black sm:inline">
            Mane<span className="font-normal text-ink-mid">Exchange</span>
          </span>
        </Link>

        {/* ─── Center: Search bar (desktop) ─── */}
        <div className="mx-6 hidden max-w-md flex-1 lg:block">
          <form onSubmit={handleSearchSubmit} role="search">
            <div className="relative">
              <label htmlFor="header-search" className="sr-only">Search horses</label>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-light" />
              <input
                id="header-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search breed, discipline, location..."
                className="w-full rounded-full border border-crease-light bg-paper-cream py-2 pl-9 pr-4 text-sm text-ink-black placeholder:text-ink-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </form>
        </div>

        {/* ─── Right zone: nav links + actions ─── */}
        <div className="hidden items-center gap-1 lg:flex">
          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none ${
                    isActive
                      ? "bg-primary/5 text-primary"
                      : "text-ink-mid hover:bg-paper-warm hover:text-ink-dark"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Sell CTA — always visible, distinct styling */}
            <Link
              href="/sell"
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                pathname === "/sell"
                  ? "bg-primary/10 text-primary"
                  : "text-primary hover:bg-primary/5"
              }`}
            >
              Sell Your Horse
            </Link>
          </nav>

          {/* Divider */}
          <div className="mx-2 h-5 w-px bg-crease-light" />

          {/* Auth area */}
          {loading ? (
            <div className="h-8 w-24 animate-shimmer rounded-md" />
          ) : user ? (
            <>
              {/* Authed icons */}
              <Link
                href="/dashboard/messages"
                className="rounded-full p-2.5 text-ink-mid transition-colors hover:bg-blue-light hover:text-blue"
                aria-label="Messages"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard/dream-barn"
                className="rounded-full p-2.5 text-ink-mid transition-colors hover:bg-red-light hover:text-coral"
                aria-label="Saved"
              >
                <Heart className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard/notifications"
                className="rounded-full p-2.5 text-ink-mid transition-colors hover:bg-gold-light hover:text-gold"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Link>

              {/* Avatar dropdown */}
              <div className="relative ml-1" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-1.5 rounded-full border border-crease-light py-1 pl-1 pr-2.5 text-sm font-medium text-ink-dark transition-colors hover:bg-paper-warm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {initials}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-ink-light transition-transform ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-paper-cream p-1 shadow-lifted">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-dark transition-colors hover:bg-paper-warm"
                    >
                      <LayoutDashboard className="h-4 w-4 text-ink-light" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-dark transition-colors hover:bg-paper-warm"
                    >
                      <Settings className="h-4 w-4 text-ink-light" />
                      Settings
                    </Link>
                    <div className="my-1 h-px bg-border" />
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-light transition-colors hover:bg-paper-warm hover:text-ink-dark"
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
            /* Logged out */
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
            className="rounded-full p-2 text-ink-mid hover:bg-paper-warm"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <MobileMenu user={user} loading={loading} />
        </div>
      </div>

      {/* ─── Mobile search bar (expandable) ─── */}
      {searchOpen && (
        <div className="border-t border-crease-light bg-paper-white px-4 py-3 lg:hidden">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-light" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search breed, discipline, location..."
                className="w-full rounded-full border border-crease-light bg-paper-cream py-2.5 pl-9 pr-4 text-sm text-ink-black placeholder:text-ink-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
