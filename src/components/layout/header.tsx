"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./mobile-menu";

const navLinks = [
  { href: "/browse", label: "Browse" },
  { href: "/sell", label: "Sell" },
  { href: "/trainers", label: "Trainers" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
];

const SCROLL_THRESHOLD = 32;

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll(); // check initial position
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        <Link href="/" className="flex items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none">
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
                  <span className="absolute -bottom-[1.1rem] left-0 right-0 h-0.5 bg-red" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth buttons (desktop) */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">List a Horse</Link>
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <MobileMenu />
      </div>
    </header>
  );
}
