"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

const navLinks = [
  { href: "/browse", label: "Browse Horses" },
  { href: "/sell", label: "Sell Your Horse" },
  { href: "/trainers", label: "Trainers" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/reviews", label: "Reviews" },
  { href: "/faq", label: "FAQ" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 bg-paper-white">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <nav className="stagger-children mt-8 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="animate-fade-up rounded-md px-4 py-3 font-serif text-lg font-medium text-ink-dark transition-colors hover:bg-paper-warm focus-visible:bg-paper-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crease-light"
            >
              {link.label}
            </Link>
          ))}
          <div className="crease-divider my-4 animate-fade-up" />
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="animate-fade-up rounded-md px-4 py-3 text-base font-medium text-ink-mid transition-colors hover:bg-paper-warm focus-visible:bg-paper-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crease-light"
          >
            Log In
          </Link>
          <div className="animate-fade-up px-4 pt-2">
            <Button className="w-full" asChild>
              <Link href="/signup" onClick={() => setOpen(false)}>
                List a Horse
              </Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
