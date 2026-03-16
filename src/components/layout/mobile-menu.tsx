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
import { signOut } from "@/actions/auth";
import type { User } from "@supabase/supabase-js";
import { getCreateListingUrl } from "@/lib/urls";

const publicLinks = [
  { href: "/browse", label: "Browse Horses" },
  { href: "/disciplines", label: "Disciplines" },
  { href: "/sell", label: "Sell Your Horse" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

const authedLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/browse", label: "Browse Horses" },
  { href: "/dashboard/dream-barn", label: "Dream Barn" },
  { href: "/iso", label: "ISOs" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/offers", label: "Offers" },
  { href: getCreateListingUrl(), label: "List a Horse" },
  { href: "/just-sold", label: "Just Sold" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function MobileMenu({
  user,
  loading,
}: {
  user: User | null;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const links = user ? authedLinks : publicLinks;

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
      <SheetContent side="right" className="paper-flat w-72 border-l border-glass">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <nav className="stagger-children mt-8 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="animate-fade-up rounded-xl px-4 py-3 text-base font-medium text-ink-dark transition-colors hover:bg-stable hover:text-gold focus-visible:bg-stable focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glass"
            >
              {link.label}
            </Link>
          ))}
          <div className="crease-divider my-4 animate-fade-up" />
          {loading ? (
            <div className="animate-fade-up px-4">
              <div className="h-10 animate-shimmer rounded-xl" />
            </div>
          ) : user ? (
            <form action={signOut} className="animate-fade-up px-4">
              <button
                type="submit"
                onClick={() => setOpen(false)}
                className="w-full rounded-xl border border-bronze/20 px-4 py-2.5 text-sm font-medium text-bronze transition-colors hover:bg-bronze/[0.08]"
              >
                Sign Out
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="animate-fade-up rounded-xl px-4 py-3 text-base font-medium text-ink-mid transition-colors hover:bg-stable hover:text-gold focus-visible:bg-stable focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glass"
              >
                Log In
              </Link>
              <div className="animate-fade-up px-4 pt-2">
                <Button className="w-full" asChild>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
