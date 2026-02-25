import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  FileCheck,
  Lock,
  BarChart3,
  Scale,
  Users,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "ManeExchange is building the financial infrastructure for the $122B horse industry.",
};

const buildingItems = [
  {
    icon: FileCheck,
    title: "Verified listings",
    description:
      "Every listing goes through a completeness check. Vet records, show history, registration papers, and media — documented and organized, not buried in a text thread.",
    accent: "forest",
  },
  {
    icon: Lock,
    title: "Escrowed payments",
    description:
      "ManeVault holds buyer funds until the horse arrives and passes inspection. ACH transfers keep fees at $5 instead of $1,450. No more wiring money to strangers.",
    accent: "gold",
  },
  {
    icon: BarChart3,
    title: "Transparent scoring",
    description:
      "The Mane Score measures listing completeness and seller responsiveness — not horse quality. More documentation means more trust. Simple.",
    accent: "blue",
  },
  {
    icon: Scale,
    title: "Compliance built in",
    description:
      "Florida Rule 5H, UCC Article 2, INFORM Act — the legal requirements for horse sales vary by state and are easy to miss. Our listing wizard handles the disclosures so sellers don't have to guess.",
    accent: "red",
  },
  {
    icon: Users,
    title: "Trainer protection",
    description:
      "Commissions are documented in writing with both-party consent. No more accusations of secret profit-taking. Transparency protects everyone.",
    accent: "forest",
  },
];

const accentBg: Record<string, string> = {
  forest: "bg-forest-light",
  gold: "bg-gold-light",
  blue: "bg-blue-light",
  red: "bg-red-light",
};
const accentText: Record<string, string> = {
  forest: "text-forest",
  gold: "text-gold",
  blue: "text-blue",
  red: "text-red",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ── Hero ── */}
        <section className="with-grain bg-gradient-hero px-4 pt-24 pb-20 md:px-8 md:pt-36 md:pb-28">
          <div className="mx-auto max-w-3xl">
            <p className="overline mb-4 text-gold">ABOUT</p>
            <h1 className="font-serif mb-8 text-4xl tracking-tight text-ink-black md:text-6xl">
              The horse industry
              <br />
              <span className="text-ink-mid">deserves real infrastructure.</span>
            </h1>
            <div className="space-y-6 text-ink-mid">
              <p className="text-lead">
                The equestrian industry moves $122 billion annually. Sales of
                show horses — hunter/jumpers, dressage, eventers — routinely
                exceed $50,000. Some cross $500,000.
              </p>
              <p>
                Yet the market operates like it&apos;s 1995. Private sales over
                Instagram DMs. Wiring $85,000 to a stranger with no escrow. Vet
                records exchanged via text message. Trainer commissions
                undisclosed. Listings that disappear overnight.
              </p>
              <p>
                ManeExchange exists because horses aren&apos;t commodity goods —
                they&apos;re living animals with complex histories, and the
                people who buy and sell them deserve a platform that treats the
                transaction with the seriousness it demands.
              </p>
            </div>
          </div>
        </section>

        {/* ── What We're Building ── */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-[1200px]">
            <p className="overline mb-3 text-center text-ink-light">
              THE PLATFORM
            </p>
            <h2 className="mb-16 text-center text-3xl text-ink-black md:text-4xl">
              What we&apos;re building
            </h2>
            <div className="stagger-children grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {buildingItems.map((item) => (
                <div
                  key={item.title}
                  className="animate-fade-up group relative overflow-hidden rounded-lg bg-paper-white p-8 shadow-flat transition-elevation hover-lift hover:shadow-lifted"
                >
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${accentBg[item.accent]}`}
                  >
                    <item.icon
                      className={`h-6 w-6 ${accentText[item.accent]}`}
                    />
                  </div>
                  <h3 className="mb-3 text-lg font-medium text-ink-black">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-mid">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Starting in Wellington ── */}
        <section className="with-grain bg-paper-white section-premium">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <p className="overline mb-3 text-gold">STARTING LOCAL</p>
                <h2 className="mb-6 text-3xl text-ink-black md:text-4xl">
                  Wellington first.
                  <br />
                  <span className="text-ink-mid">Then everywhere.</span>
                </h2>
                <p className="text-lead mb-6 text-ink-mid">
                  We&apos;re launching in Wellington, Florida — the epicenter of
                  the hunter/jumper world during WEF season. From there,
                  we&apos;ll expand to the Florida triangle (Ocala, Tampa), then
                  the Eastern Seaboard, then nationally.
                </p>
                <p className="text-ink-mid">
                  We&apos;re building deep, not wide.
                </p>
              </div>
              <div className="flex items-center justify-center rounded-lg bg-paper-cream p-12 shadow-flat">
                <div className="text-center">
                  <MapPin className="mx-auto mb-4 h-8 w-8 text-gold" />
                  <p className="overline mb-2 text-ink-light">LAUNCH MARKET</p>
                  <p className="font-serif text-4xl font-bold text-ink-black">
                    Wellington, FL
                  </p>
                  <p className="mt-2 text-sm text-ink-mid">
                    WEF Season 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-paddock section-premium">
          <div className="mx-auto max-w-[1200px] text-center">
            <h2 className="font-serif mb-4 text-3xl text-paper-white md:text-4xl">
              The standard for equine transactions.
            </h2>
            <p className="text-lead mx-auto mb-8 max-w-xl text-ink-light">
              Purpose-built for the way serious horses are bought and sold.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                asChild
              >
                <Link href="/signup">
                  Create an Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="!bg-transparent border-crease-dark text-paper-cream hover:!bg-ink-dark"
                asChild
              >
                <Link href="/browse">View Current Offerings</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
