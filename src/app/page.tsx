import Link from "next/link";
import Image from "next/image";
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
  Eye,
  Heart,
  AlertTriangle,
  Users,
  Scale,
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
        <section className="relative bg-hero-dark overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1920&q=80&auto=format&fit=crop"
              alt=""
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F1A12]/80 via-[#0F1A12]/60 to-[#1B4332]/90" />
          </div>

          <div className="relative px-4 pt-28 pb-32 md:px-8 md:pt-40 md:pb-44">
            <div className="mx-auto max-w-[1200px]">
              <div className="max-w-2xl">
                <p className="overline mb-5 text-gold">
                  EST. 2025
                </p>
                <h1 className="mb-6 text-5xl text-white md:text-7xl">
                  The trust layer the
                  <br />
                  horse industry is
                  <br />
                  <span className="text-gold">missing.</span>
                </h1>
                <p className="text-lead mb-10 max-w-lg text-white/70">
                  A $177 billion industry still runs on Facebook groups, phone
                  calls, and handshake deals. We built the infrastructure it
                  should have had all along.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/signup">
                      Create an Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="!bg-transparent border-white/30 text-white hover:!bg-white/10"
                    asChild
                  >
                    <Link href="/browse">View Current Offerings</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── The Problem ── */}
        <section className="bg-paper-cream section-editorial">
          <div className="mx-auto max-w-[1200px]">
            <p className="overline mb-3 text-center text-gold">
              THE REALITY
            </p>
            <h2 className="mb-6 text-center text-3xl text-ink-black md:text-4xl">
              You already know this is broken.
            </h2>
            <p className="text-lead mx-auto mb-16 max-w-2xl text-center text-ink-mid">
              A six-figure horse changes hands across six parties with zero
              platform coordination. Deposits go to sellers with no neutral
              third party. Commissions disappear into handshake agreements.
              Everyone in the industry knows it. Nobody has fixed it.
            </p>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: AlertTriangle,
                  stat: "40%",
                  label: "of a sale price can vanish into undisclosed commissions in documented cases",
                },
                {
                  icon: Search,
                  stat: "0",
                  label: "comparable sales databases exist for private show horse transactions",
                },
                {
                  icon: Shield,
                  stat: "0",
                  label: "major platforms offer escrow for horse purchases today",
                },
                {
                  icon: Scale,
                  stat: "#1",
                  label: "source of equine litigation: disputes over pre-purchase exams and misrepresentation",
                },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <item.icon className="mx-auto mb-3 h-5 w-5 text-ink-light" />
                  <p className="font-serif text-4xl font-bold text-ink-black">
                    {item.stat}
                  </p>
                  <p className="mt-2 text-sm text-ink-mid">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What We Built ── */}
        <section className="with-grain bg-paper-white section-editorial">
          <div className="mx-auto max-w-[1200px]">
            <p className="overline mb-3 text-center text-gold">
              WHAT WE BUILT
            </p>
            <h2 className="mb-4 text-center text-3xl text-ink-black md:text-4xl">
              Every feature solves a real problem.
            </h2>
            <p className="text-lead mx-auto mb-16 max-w-2xl text-center text-ink-mid">
              Not a classifieds board. Not a social network.
              Transaction infrastructure for every stage of an equine sale.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {/* ManeVault */}
              <div className="group relative overflow-hidden rounded-lg bg-paper-cream p-8 shadow-flat transition-elevation hover-lift hover:shadow-lifted">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gold-light">
                  <Lock className="h-6 w-6 text-gold" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-ink-black">
                  ManeVault Escrow
                </h3>
                <p className="mb-1 text-xs font-medium text-ink-light">
                  THE PROBLEM: Wire fraud, bounced checks, deposit disputes
                </p>
                <p className="mb-4 text-sm text-ink-mid">
                  Funds are held by a neutral third party until the horse
                  arrives and passes your inspection. No more wiring $80,000
                  to a stranger and hoping for the best. ACH transfers cap
                  fees at $5 — not the $1,450 you&apos;d pay on a credit card.
                </p>
                <ul className="space-y-2">
                  {[
                    "5-day post-delivery inspection period",
                    "14-day dispute resolution window",
                    "ACH default keeps fees under $5",
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

              {/* Commission Transparency */}
              <div className="group relative overflow-hidden rounded-lg bg-paper-cream p-8 shadow-flat transition-elevation hover-lift hover:shadow-lifted">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-forest-light">
                  <Users className="h-6 w-6 text-forest" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-ink-black">
                  Commission Transparency
                </h3>
                <p className="mb-1 text-xs font-medium text-ink-light">
                  THE PROBLEM: Hidden kickbacks, undisclosed dual agency
                </p>
                <p className="mb-4 text-sm text-ink-mid">
                  Every commission is documented in the transaction record
                  with both-party consent. Trainers are protected by having
                  their fees on the record. Buyers know exactly what they&apos;re
                  paying. Sellers know exactly what they&apos;re netting.
                </p>
                <ul className="space-y-2">
                  {[
                    "Agent fees visible to all parties",
                    "Dual agency requires written consent",
                    "Florida 5H compliant disclosures",
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

              {/* Verified Listings */}
              <div className="group relative overflow-hidden rounded-lg bg-paper-cream p-8 shadow-flat transition-elevation hover-lift hover:shadow-lifted">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-light">
                  <BarChart3 className="h-6 w-6 text-blue" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-ink-black">
                  Mane Score
                </h3>
                <p className="mb-1 text-xs font-medium text-ink-light">
                  THE PROBLEM: Misrepresentation, incomplete disclosures
                </p>
                <p className="mb-4 text-sm text-ink-mid">
                  Every listing earns a documentation completeness score.
                  Vet records, show history, registration, media — the more
                  a seller documents, the higher the score. You can see
                  exactly what&apos;s been disclosed and what hasn&apos;t.
                </p>
                <ul className="space-y-2">
                  {[
                    "1,000-point documentation scoring",
                    "Structured disclosures, not free-text claims",
                    "UCC 2-316 compliant warranty language",
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
              Mane Score reflects listing completeness and documentation, not
              the quality, soundness, or value of any horse.
            </p>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="bg-paper-cream section-editorial">
          <div className="mx-auto max-w-[1200px]">
            <p className="overline mb-3 text-center text-gold">
              PROCESS
            </p>
            <h2 className="mb-16 text-center text-3xl text-ink-black md:text-4xl">
              How a transaction proceeds.
            </h2>
            <div className="grid gap-12 md:grid-cols-3 md:gap-8">
              {[
                {
                  icon: Search,
                  step: "01",
                  title: "Find or List",
                  description:
                    "Structured listings with veterinary records, show history, and media — not a blurry phone photo and a DM that says \"sound, no vices.\" Search by discipline, price, location, and dozens of real criteria.",
                },
                {
                  icon: FileCheck,
                  step: "02",
                  title: "Verify & Connect",
                  description:
                    "Message sellers directly. Schedule trials with built-in liability agreements. Compare horses side-by-side. Every listing shows exactly what has been documented and what hasn't.",
                },
                {
                  icon: CreditCard,
                  step: "03",
                  title: "Close with Confidence",
                  description:
                    "ManeVault escrow holds funds until the horse arrives and passes your inspection. UCC-compliant Bill of Sale generated automatically. Commissions documented. Both parties protected.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center md:text-left">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-forest-light">
                    <item.icon className="h-6 w-6 text-forest" />
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

        {/* ── Featured Horses ── */}
        {featuredListings.length > 0 && (
          <section className="bg-paper-white section-editorial">
            <div className="mx-auto max-w-[1200px]">
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <p className="overline mb-2 text-gold">CATALOG</p>
                  <h2 className="text-3xl text-ink-black">
                    Current offerings
                  </h2>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/browse" className="gap-1.5">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="stagger-children grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {featuredListings.map((l) => (
                  <Link key={String(l.id)} href={`/horses/${String(l.slug)}`} className="animate-fade-up">
                    <Card className="group overflow-hidden border-0 shadow-flat transition-elevation hover-lift hover:shadow-lifted">
                      <div className="aspect-[3/2] bg-paper-warm">
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

        {/* ── Editorial Image Break ── */}
        <section className="relative h-[400px] md:h-[500px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1534307671554-9a6d81f4d629?w=1920&q=80&auto=format&fit=crop"
            alt="Horse and rider in morning light"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A12]/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-12 md:px-8 md:pb-16">
            <div className="mx-auto max-w-[1200px]">
              <p className="overline mb-3 text-gold">FOR EVERY SIDE OF THE DEAL</p>
              <h2 className="text-3xl text-white md:text-4xl max-w-xl">
                Buyers, sellers, and trainers all deserve to know what they&apos;re getting into.
              </h2>
            </div>
          </div>
        </section>

        {/* ── For Buyers ── */}
        <section className="bg-paper-cream section-editorial">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-start gap-12 md:grid-cols-2">
              <div>
                <p className="overline mb-3 text-gold">FOR BUYERS</p>
                <h2 className="mb-4 text-3xl text-ink-black">
                  Know what you&apos;re buying
                  <br />
                  before the wire clears.
                </h2>
                <p className="text-lead mb-6 text-ink-mid">
                  Nearly half of horse buyers are amateurs who need objective
                  criteria for evaluating a sale. We built that. Every listing
                  shows exactly what has been documented, verified, and
                  disclosed — and exactly what hasn&apos;t.
                </p>
                <ul className="space-y-3">
                  {[
                    "Structured listings replace vague free-text claims",
                    "Mane Score shows documentation completeness at a glance",
                    "ManeVault escrow means you inspect before the seller is paid",
                    "Compare horses side-by-side on real criteria",
                    "Just Sold feed gives you actual pricing data — the first of its kind",
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
              </div>
              <div>
                <p className="overline mb-3 text-gold">FOR SELLERS</p>
                <h2 className="mb-4 text-3xl text-ink-black">
                  Serious inquiries.
                  <br />
                  Secured payments.
                </h2>
                <p className="text-lead mb-6 text-ink-mid">
                  No more tire-kickers who ghost after a farm visit. No more
                  checks that bounce two weeks after the horse ships. Every
                  buyer on ManeExchange has a verified identity, and every
                  payment runs through escrow.
                </p>
                <ul className="space-y-3">
                  {[
                    "Guided listing wizard with state-specific compliance built in",
                    "Escrow means you never ship a horse on a promise",
                    "Commission transparency protects you from disputes",
                    "Your own farm storefront with analytics",
                    "Complimentary access during launch period",
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
              </div>
            </div>
          </div>
        </section>

        {/* ── For Trainers ── */}
        <section className="with-grain bg-paper-white section-editorial">
          <div className="mx-auto max-w-[900px]">
            <p className="overline mb-3 text-center text-gold">FOR TRAINERS</p>
            <h2 className="mb-6 text-center text-3xl text-ink-black">
              Your commissions on the record.
              <br />
              Your reputation protected.
            </h2>
            <p className="text-lead mx-auto mb-8 max-w-2xl text-center text-ink-mid">
              You find the horses. You advise on the purchase. You manage the
              trial, the PPE, and the transport. You deserve to be compensated
              transparently — and protected legally when you are.
            </p>
            <p className="mx-auto mb-10 max-w-2xl text-center text-ink-mid">
              ManeExchange documents every commission with both-party consent.
              That&apos;s not a threat to how you operate — it&apos;s the
              documentation that prevents commission disputes from turning into
              lawsuits. Manage your clients&apos; buying and selling from a
              single portal, with full visibility into every transaction you
              touch.
            </p>
            <div className="flex justify-center">
              <Button variant="outline" size="lg" asChild>
                <Link href="/trainers">
                  Learn About the Trainer Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Platform Stats ── */}
        <section className="bg-paddock section-premium">
          <div className="mx-auto grid max-w-[1200px] gap-8 sm:grid-cols-3">
            <div className="text-center">
              <p className="font-serif text-5xl font-bold text-gold md:text-6xl">
                {(totalListings ?? 0).toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-white/50">Horses Listed</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-5xl font-bold text-gold md:text-6xl">
                {(totalSellers ?? 0).toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-white/50">Registered Sellers</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-5xl font-bold text-gold md:text-6xl">
                {(totalSold ?? 0).toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-white/50">Transactions Completed</p>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="bg-paddock section-editorial">
          <div className="mx-auto max-w-[900px] text-center">
            <p className="overline mb-4 text-gold">SEE FOR YOURSELF</p>
            <h2 className="mb-4 text-3xl text-white md:text-4xl">
              The industry has been asking for this.
              <br />
              We built it.
            </h2>
            <p className="text-lead mx-auto mb-10 max-w-xl text-white/60">
              Escrow. Transparent commissions. Structured disclosures.
              Comparable sales data. UCC-compliant contracts.
              No other platform in the equine industry offers any of these.
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
                className="!bg-transparent border-white/30 text-white hover:!bg-white/10"
                asChild
              >
                <Link href="/how-it-works">How It Works</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-white/40">
              Complimentary access during launch. No listing fees. No transaction fees yet.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
