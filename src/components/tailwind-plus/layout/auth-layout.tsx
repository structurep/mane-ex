import Link from "next/link";
import Image from "next/image";
import { Lock, Shield, CheckCircle2 } from "lucide-react";

interface AuthLayoutProps {
  /** Brand tagline on left panel */
  headline: React.ReactNode;
  /** Supporting text or bullet list on left panel */
  subContent?: React.ReactNode;
  /** Right-panel heading */
  title: string;
  /** Right-panel subtitle */
  subtitle: string;
  /** The form component */
  children: React.ReactNode;
  /** Footer below the form */
  footer?: React.ReactNode;
}

const trustBadges = [
  { icon: Lock, label: "Encrypted", mobileColor: "text-gold" },
  { icon: Shield, label: "Stripe KYC", mobileColor: "text-forest" },
  { icon: CheckCircle2, label: "Verified", mobileColor: "text-oxblood" },
];

/**
 * Split-screen auth layout shared between login and signup.
 * Left: brand panel (desktop only). Right: form.
 */
export function AuthLayout({
  headline,
  subContent,
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand (desktop only) */}
      <div className="hidden w-1/2 flex-col justify-between bg-ink-black p-12 lg:flex">
        <Link href="/" className="inline-block">
          <Image
            src="/icon.svg"
            alt="ManeExchange"
            width={40}
            height={40}
            className="brightness-0 invert"
          />
        </Link>

        <div className="max-w-md">
          <p className="font-serif text-4xl font-bold leading-tight tracking-tight text-paper-white">
            {headline}
          </p>
          {subContent && <div className="mt-4">{subContent}</div>}
        </div>

        <div className="flex items-center gap-6 text-xs text-paper-white/40">
          {trustBadges.map((b) => (
            <span key={b.label} className="flex items-center gap-1.5">
              <b.icon className="h-3.5 w-3.5" />
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-paper-cream px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo + heading */}
          <div className="mb-8 text-center lg:text-left">
            <Link href="/" className="inline-block lg:hidden">
              <Image
                src="/icon.svg"
                alt="ManeExchange"
                width={48}
                height={48}
                className="mx-auto mb-4 lg:mx-0"
              />
            </Link>
            <h1 className="font-serif text-3xl tracking-tight text-ink-black">
              {title}
            </h1>
            <p className="mt-2 text-sm text-ink-mid">{subtitle}</p>
          </div>

          {/* Form card */}
          <div className="rounded-lg bg-paper-white p-6 shadow-folded md:p-8">
            {children}
          </div>

          {/* Footer (switch link, legal, etc.) */}
          {footer}

          {/* Trust badges (mobile only) */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-ink-faint lg:hidden">
            {trustBadges.map((b) => (
              <span key={b.label} className="flex items-center gap-1.5">
                <b.icon className={`h-3.5 w-3.5 ${b.mobileColor}`} />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
