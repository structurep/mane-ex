import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import {
  Shield,
  Lock,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Search,
  FileCheck,
  CreditCard,
  Sparkles,
  Eye,
  Heart,
} from "lucide-react";

function formatPrice(cents: number | null): string {
  if (!cents) return "Price TBD";
  return `$${(cents / 100).toLocaleString()}`;
}

export default async function Home() {
  const supabase = await createClient();

  // Featured horses: highest Mane Score active listings
  const { data: featured } = await supabase
    .from("horse_listings")
    .select(
      "id, name, slug, breed, price, location_state, primary_image_url, view_count, favorite_count"
    )
    .eq("status", "active")
    .order("completeness_score", { ascending: false })
    .limit(6);

  // Platform stats
  const { count: totalListings } = await supabase
    .from("horse_listings")
    .select("id", { count: "exact", head: true })
    .in("status", ["active", "sold"]);

  const { count: totalSellers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "seller");

  const { count: totalSold } = await supabase
    .from("horse_listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "sold");

  const featuredListings = (featured ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* ── Hero ── */}
        <section className="bg-paper-white px-4 pt-20 pb-24 md:px-8 md:pt-32 md:pb-32">
          <div className="mx-auto max-w-[1200px]">
            <div className="max-w-2xl">
              <p className="overline mb-4 text-red">
                THE EQUESTRIAN MARKETPLACE
              </p>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-ink-black md:text-6xl">
                Buy and sell horses
                <br />
                <span className="text-ink-mid">with confidence.</span>
              </h1>
              <p className="text-lead mb-8 max-w-lg text-ink-mid">
                Verified listings. Escrowed payments. Transparent seller
                scoring. The trust layer the equestrian industry has been
                missing.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/signup?role=seller">
                    List a Horse — Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/browse">Browse Horses</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-ink-light">
                Zero listing fees. Zero transaction fees. Free to start.
              </p>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="bg-paper-cream px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <p className="overline mb-3 text-center text-ink-light">
              HOW IT WORKS
            </p>
            <h2 className="mb-16 text-center text-3xl font-semibold text-ink-black md:text-4xl">
              Three steps to a secure sale.
            </h2>
            <div className="grid gap-12 md:grid-cols-3 md:gap-8">
              {[
                {
                  icon: Search,
                  step: "01",
                  title: "Find or List",
                  description:
                    "Browse verified listings with detailed vet records, show history, and media. Or list your horse in minutes with our guided wizard.",
                },
                {
                  icon: FileCheck,
                  step: "02",
                  title: "Connect & Verify",
                  description:
                    "Message sellers directly. Book trials. Compare horses side-by-side. Every listing has a completeness score so you know what's documented.",
                },
                {
                  icon: CreditCard,
                  step: "03",
                  title: "Transact Securely",
                  description:
                    "ManeVault escrow holds funds until the horse arrives and passes inspection. ACH transfers keep fees low. Both parties are protected.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center md:text-left">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-red-light">
                    <item.icon className="h-6 w-6 text-red" />
                  </div>
                  <p className="overline mb-2 text-ink-light">{item.step}</p>
                  <h3 className="mb-3 text-xl font-medium text-ink-black">
                    {item.title}
                  </h3>
                  <p className="text-ink-mid">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust Pillars ── */}
        <section className="bg-paper-white px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <p className="overline mb-3 text-center text-ink-light">
              TRUST & SECURITY
            </p>
            <h2 className="mb-4 text-center text-3xl font-semibold text-ink-black md:text-4xl">
              Built for high-stakes transactions.
            </h2>
            <p className="text-lead mx-auto mb-16 max-w-2xl text-center text-ink-mid">
              Horses aren&apos;t impulse buys. Every feature is designed to
              protect both sides of a $50,000+ sale.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {/* ManeVault */}
              <div className="group relative overflow-hidden rounded-lg border border-border bg-paper-cream p-8 shadow-flat transition-elevation hover-lift hover:shadow-lifted">
                <div className="fold-corner" />
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-paper-warm">
                  <Lock className="h-6 w-6 text-ink-dark" />
                </div>
                <h3 className="mb-3 text-lg font-medium text-ink-black">
                  ManeVault Escrow
                </h3>
                <p className="mb-4 text-sm text-ink-mid">
                  Funds are held securely until the horse arrives and passes
                  your inspection. ACH transfers cap fees at $5 — not $1,450.
                </p>
                <ul className="space-y-2">
                  {[
                    "5-day inspection period",
                    "14-day dispute window",
                    "ACH default for low fees",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-ink-mid"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-forest" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ManeGuard */}
              <div className="group relative overflow-hidden rounded-lg border border-border bg-paper-cream p-8 shadow-flat transition-elevation hover-lift hover:shadow-lifted">
                <div className="fold-corner" />
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-paper-warm">
                  <Shield className="h-6 w-6 text-ink-dark" />
                </div>
                <h3 className="mb-3 text-lg font-medium text-ink-black">
                  ManeGuard Protection
                </h3>
                <p className="mb-4 text-sm text-ink-mid">
                  Buyer protection for non-delivery, misrepresentation,
                  undisclosed health issues, and registration fraud.
                </p>
                <ul className="space-y-2">
                  {[
                    "30-day coverage window",
                    "Claims funded by dedicated reserve",
                    "Evidence-based resolution",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-ink-mid"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-forest" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mane Score */}
              <div className="group relative overflow-hidden rounded-lg border border-border bg-paper-cream p-8 shadow-flat transition-elevation hover-lift hover:shadow-lifted">
                <div className="fold-corner" />
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-paper-warm">
                  <BarChart3 className="h-6 w-6 text-ink-dark" />
                </div>
                <h3 className="mb-3 text-lg font-medium text-ink-black">
                  Mane Score
                </h3>
                <p className="mb-4 text-sm text-ink-mid">
                  Every listing earns a completeness score based on
                  documentation, media, and seller responsiveness. More
                  documentation = more trust.
                </p>
                <ul className="space-y-2">
                  {[
                    "1,000-point scoring system",
                    "9 achievement badges",
                    "Anti-gaming protections",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-ink-mid"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-forest" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-ink-light">
              Mane Score reflects listing completeness and documentation, not the
              quality, soundness, or value of any horse.
            </p>
          </div>
        </section>

        {/* ── Featured Horses ── */}
        {featuredListings.length > 0 && (
          <section className="bg-paper-cream px-4 py-20 md:px-8 md:py-24">
            <div className="mx-auto max-w-[1200px]">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="overline mb-2 text-ink-light">FEATURED HORSES</p>
                  <h2 className="text-3xl font-semibold text-ink-black">
                    Top-rated listings
                  </h2>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/browse" className="gap-1.5">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {featuredListings.map((l) => (
                  <Link key={String(l.id)} href={`/horses/${String(l.slug)}`}>
                    <Card className="group overflow-hidden transition-shadow hover:shadow-folded">
                      <div className="aspect-[4/3] bg-paper-warm">
                        {typeof l.primary_image_url === "string" ? (
                          <img
                            src={l.primary_image_url}
                            alt={String(l.name)}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-ink-faint">
                            No photo
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-heading text-sm font-semibold text-ink-black line-clamp-1">
                          {String(l.name)}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-ink-mid">
                          {typeof l.breed === "string" && <span>{l.breed}</span>}
                          {typeof l.location_state === "string" && (
                            <span>{l.location_state}</span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-semibold text-ink-black">
                            {formatPrice(
                              typeof l.price === "number" ? (l.price as number) : null
                            )}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-ink-light">
                            {typeof l.view_count === "number" &&
                              (l.view_count as number) > 0 && (
                                <span className="flex items-center gap-0.5">
                                  <Eye className="h-3 w-3" />
                                  {l.view_count as number}
                                </span>
                              )}
                            {typeof l.favorite_count === "number" &&
                              (l.favorite_count as number) > 0 && (
                                <span className="flex items-center gap-0.5">
                                  <Heart className="h-3 w-3" />
                                  {l.favorite_count as number}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Platform Stats ── */}
        <section className="bg-paper-white px-4 py-12 md:px-8">
          <div className="mx-auto grid max-w-[1200px] gap-6 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-ink-black">
                {(totalListings ?? 0).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-ink-mid">Active Listings</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-ink-black">
                {(totalSellers ?? 0).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-ink-mid">Verified Sellers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-ink-black">
                {(totalSold ?? 0).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-ink-mid">Successful Sales</p>
            </div>
          </div>
        </section>

        {/* ── Quiz CTA ── */}
        <section className="bg-paper-cream px-4 py-16 md:px-8">
          <div className="mx-auto flex max-w-[700px] flex-col items-center text-center">
            <Sparkles className="mb-4 h-8 w-8 text-gold" />
            <h2 className="mb-2 text-2xl font-semibold text-ink-black">
              Not sure which plan is right for you?
            </h2>
            <p className="mb-6 text-ink-mid">
              Take our 60-second quiz to find your perfect ManeExchange plan.
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link href="/quiz" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Take the Quiz
              </Link>
            </Button>
          </div>
        </section>

        {/* ── For Sellers ── */}
        <section className="bg-paper-cream px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <p className="overline mb-3 text-red">FOR SELLERS</p>
                <h2 className="mb-4 text-3xl font-semibold text-ink-black">
                  Your barn deserves
                  <br />a better marketplace.
                </h2>
                <p className="text-lead mb-6 text-ink-mid">
                  No more DMs that go nowhere. No more tire-kickers. Serious
                  buyers, verified identities, and escrowed payments from day
                  one.
                </p>
                <ul className="mb-8 space-y-3">
                  {[
                    "Free to list — zero fees at launch",
                    "Guided listing wizard with compliance built in",
                    "Trainer commission transparency protects you legally",
                    "Your own farm storefront page",
                    "Analytics on views, saves, and inquiries",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-ink-dark"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" asChild>
                  <Link href="/signup?role=seller">
                    Start Listing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-center rounded-lg border border-border bg-paper-warm p-12">
                <div className="text-center">
                  <p className="overline mb-2 text-ink-light">
                    LAUNCH PRICING
                  </p>
                  <p className="text-6xl font-bold text-ink-black">$0</p>
                  <p className="mt-2 text-ink-mid">
                    Zero listing fees. Zero transaction fees.
                  </p>
                  <p className="mt-1 text-sm text-ink-light">
                    Build your presence before fees kick in.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── For Trainers ── */}
        <section className="bg-paper-white px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-3 text-gold">FOR TRAINERS</p>
            <h2 className="mb-4 text-3xl font-semibold text-ink-black">
              Commission transparency is your best protection.
            </h2>
            <p className="text-lead mx-auto mb-8 max-w-2xl text-ink-mid">
              Every commission is documented in writing with both-party consent.
              No more accusations of secret profit-taking. ManeExchange protects
              trainers by making commissions visible and legitimate.
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link href="/signup?role=trainer">
                Join as a Trainer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="bg-ink-black px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px] text-center">
            <h2 className="mb-4 text-3xl font-semibold text-paper-white md:text-4xl">
              The equestrian market
              <br />
              deserves better infrastructure.
            </h2>
            <p className="text-lead mx-auto mb-8 max-w-xl text-ink-light">
              Join Wellington&apos;s top barns on the platform built for
              high-stakes horse transactions.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-red hover:bg-red/90"
                asChild
              >
                <Link href="/signup">
                  Get Started — Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-crease-dark text-paper-cream hover:bg-ink-dark"
                asChild
              >
                <Link href="/how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
