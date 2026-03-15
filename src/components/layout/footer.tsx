import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

const footerLinks = {
  marketplace: [
    { href: "/browse", label: "Current Offerings" },
    { href: "/trainers", label: "Trainer Directory" },
    { href: "/disciplines", label: "Disciplines" },
    { href: "/iso", label: "In Search Of" },
  ],
  sellers: [
    { href: "/sell", label: "Sell Your Horse" },
    { href: "/pricing", label: "Membership" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/valuation", label: "ManeEstimate" },
  ],
  resources: [
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
];

export function Footer() {
  return (
    <footer>
      <div className="border-t border-[var(--paper-border)] bg-[var(--paper-washi)]">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
          {/* Link grid */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {Object.entries(footerLinks).map(([key, links]) => (
              <div key={key}>
                <p className="overline mb-4 text-[var(--ink-mid)]">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </p>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="rounded-[var(--radius-paper)] text-[13px] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink-black)] focus-visible:ring-2 focus-visible:ring-[var(--paper-border)] focus-visible:outline-none"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="crease-divider mt-12 mb-8" />
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <Image
                src="/icon.svg"
                alt="ManeExchange"
                width={24}
                height={24}
              />
              <span className="text-[13px] text-[var(--ink-faint)]">
                &copy; {new Date().getFullYear()} ManeExchange
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
                    className="rounded-[var(--radius-paper)] text-[var(--ink-faint)] transition-colors hover:text-[var(--ink-dark)] focus-visible:ring-2 focus-visible:ring-[var(--paper-border)] focus-visible:outline-none"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
