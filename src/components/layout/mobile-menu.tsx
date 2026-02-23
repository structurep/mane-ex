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
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 bg-paper-white">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <nav className="mt-8 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-4 py-3 text-base font-medium text-ink-dark transition-colors hover:bg-paper-warm"
            >
              {link.label}
            </Link>
          ))}
          <div className="crease-divider my-4" />
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="rounded-md px-4 py-3 text-base font-medium text-ink-mid transition-colors hover:bg-paper-warm"
          >
            Log In
          </Link>
          <div className="px-4 pt-2">
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
