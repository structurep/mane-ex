import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Youtube } from "lucide-react";

const footerLinks = {
  marketplace: [
    { href: "/browse", label: "Current Offerings" },
    { href: "/trainers", label: "Trainer Directory" },
    { href: "/reviews", label: "Community Reviews" },
    { href: "/market", label: "Market Intelligence" },
    { href: "/shipping", label: "Shipping" },
    { href: "/insurance", label: "Insurance" },
    { href: "/financing", label: "Financing" },
  ],
  sellers: [
    { href: "/sell", label: "Sell Your Horse" },
    { href: "/pricing", label: "Membership" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/recommendations", label: "AI Matching" },
    { href: "/valuation", label: "ManeEstimate" },
    { href: "/conformation", label: "Conformation Analysis" },
  ],
  resources: [
    { href: "/learn", label: "Learn" },
    { href: "/trust", label: "Trust & Safety" },
    { href: "/how-it-works#escrow", label: "ManeVault Escrow" },
    { href: "/faq", label: "FAQ" },
  ],
  legal: [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/contact", label: "Contact" },
    { href: "/about", label: "About" },
  ],
};

const socialLinks = [
  { href: "https://instagram.com/maneexchange", label: "Instagram", icon: Instagram },
  { href: "https://facebook.com/maneexchange", label: "Facebook", icon: Facebook },
  { href: "https://youtube.com/@maneexchange", label: "YouTube", icon: Youtube },
];

export function Footer() {
  return (
    <footer>
      <div className="border-t border-border bg-washi">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
          {/* Link grid */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <p className="mb-4 font-serif text-sm font-semibold text-ink-dark">Marketplace</p>
              <ul className="space-y-3">
                {footerLinks.marketplace.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-sm text-sm text-ink-mid transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 font-serif text-sm font-semibold text-ink-dark">Sellers</p>
              <ul className="space-y-3">
                {footerLinks.sellers.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-sm text-sm text-ink-mid transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 font-serif text-sm font-semibold text-ink-dark">Resources</p>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-sm text-sm text-ink-mid transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 font-serif text-sm font-semibold text-ink-dark">Legal</p>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-sm text-sm text-ink-mid transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="crease-divider mt-12 mb-8" />
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <Image
                src="/icon.svg"
                alt="ManeExchange"
                width={28}
                height={28}
              />
              <span className="text-sm text-ink-light">
                &copy; {new Date().getFullYear()} ManeExchange. All rights
                reserved.
              </span>
            </div>
            <div className="flex items-center gap-5">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="rounded-sm text-ink-light transition-colors hover:text-gold focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                );
              })}
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-ink-light md:text-left">
            ManeExchange is a marketplace that connects buyers and sellers.
            ManeExchange is not a party to any transaction.
          </p>
        </div>
      </div>
    </footer>
  );
}
