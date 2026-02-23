import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  marketplace: [
    { href: "/browse", label: "Browse Horses" },
    { href: "/trainers", label: "Trainer Directory" },
    { href: "/reviews", label: "Community Reviews" },
    { href: "/market", label: "Market Intelligence" },
    { href: "/shipping", label: "Shipping" },
    { href: "/insurance", label: "Insurance" },
    { href: "/financing", label: "Financing" },
  ],
  sellers: [
    { href: "/sell", label: "Sell Your Horse" },
    { href: "/pricing", label: "Pricing" },
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

export function Footer() {
  return (
    <footer className="border-t border-border bg-washi">
      <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
        {/* Link grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h4 className="overline mb-4 text-ink-mid">Marketplace</h4>
            <ul className="space-y-3">
              {footerLinks.marketplace.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-mid transition-colors hover:text-ink-black"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="overline mb-4 text-ink-mid">Sellers</h4>
            <ul className="space-y-3">
              {footerLinks.sellers.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-mid transition-colors hover:text-ink-black"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="overline mb-4 text-ink-mid">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-mid transition-colors hover:text-ink-black"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="overline mb-4 text-ink-mid">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-mid transition-colors hover:text-ink-black"
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
          <p className="max-w-md text-center text-xs text-ink-light md:text-right">
            ManeExchange is a marketplace that connects buyers and sellers.
            ManeExchange is not a party to any transaction.
          </p>
        </div>
      </div>
    </footer>
  );
}
