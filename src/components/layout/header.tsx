"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./mobile-menu";
import { useUser } from "@/hooks/use-user";
import { signOut } from "@/actions/auth";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  ChevronDown,
} from "lucide-react";

const publicNav = [
  { href: "/browse", label: "Horses" },
  { href: "/just-sold", label: "Just Sold" },
  { href: "/learn", label: "Learn" },
  { href: "/sell", label: "For Sellers" },
];

const authedNav = [
  { href: "/browse", label: "Horses" },
  { href: "/dashboard/dream-barn", label: "Dream Barn" },
  { href: "/iso", label: "ISOs" },
  { href: "/sell", label: "Sell" },
];

const SCROLL_THRESHOLD = 32;

export function Header() {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close menu on route change (adjusting state during render — React recommended pattern)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
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
        className={`mx-auto flex max-w-[1200px] items-center justify-between px-4 transition-[height] duration-300 ease-out md:px-8 ${
          scrolled ? "h-14" : "h-[4.5rem]"
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
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

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-sm text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none ${
                  isActive
                    ? "text-ink-black"
                    : "text-ink-mid hover:text-ink-black"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-[1.1rem] left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side — auth-aware */}
        <div className="hidden items-center gap-3 lg:flex">
          {loading ? (
            // Skeleton while checking auth
            <div className="h-8 w-24 animate-shimmer rounded-md" />
          ) : user ? (
            // Logged in
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
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
                    <Link
                      href="/dashboard/messages"
                      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-dark transition-colors hover:bg-paper-warm"
                    >
                      <User className="h-4 w-4 text-ink-light" />
                      Messages
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
            // Logged out
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Create Account</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <MobileMenu user={user} loading={loading} />
      </div>
    </header>
  );
}
