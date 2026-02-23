import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./mobile-menu";

const navLinks = [
  { href: "/browse", label: "Browse" },
  { href: "/sell", label: "Sell" },
  { href: "/trainers", label: "Trainers" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/icon.svg"
            alt="ManeExchange"
            width={36}
            height={36}
            className="h-9 w-9"
          />
          <span className="hidden font-heading text-xl font-semibold tracking-tight text-ink-black sm:inline">
            Mane<span className="font-normal text-ink-mid">Exchange</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-mid transition-colors duration-200 hover:text-ink-black"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons (desktop) */}
        <div className="hidden items-center gap-3 md:flex">
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
