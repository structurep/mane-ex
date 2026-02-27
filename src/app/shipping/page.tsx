"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/bottom-cta";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Star,
  Shield,
  MapPin,
  Clock,
  DollarSign,
  MessageCircle,
  Search,
} from "lucide-react";
import {
  TransportQuoteForm,
  TransportTracker,
  RouteCostEstimator,
} from "@/components/transport-tracker";

/* ─── Sample Data ─── */

const transporters = [
  {
    id: "1",
    name: "Brook Ledge Horse Transportation",
    company: "Brook Ledge",
    verified: true,
    rating: 4.9,
    reviewCount: 156,
    routes: "East Coast, Southeast, Midwest",
    priceRange: "$800 - $2,500",
    responseTime: "< 2 hours",
    insured: true,
    bio: "Family-owned since 1958. Climate-controlled trailers with GPS tracking. USDA certified.",
  },
  {
    id: "2",
    name: "Creech Horse Transportation",
    company: "Creech",
    verified: true,
    rating: 4.8,
    reviewCount: 98,
    routes: "Nationwide",
    priceRange: "$1,200 - $4,500",
    responseTime: "< 4 hours",
    insured: true,
    bio: "Nationwide door-to-door service. Air-ride suspension, individual stalls, 24/7 monitoring.",
  },
  {
    id: "3",
    name: "Sallee Horse Vans",
    company: "Sallee",
    verified: true,
    rating: 4.7,
    reviewCount: 72,
    routes: "East Coast, Florida, Kentucky",
    priceRange: "$600 - $2,000",
    responseTime: "< 6 hours",
    insured: true,
    bio: "Specializing in the Florida-Kentucky corridor. Weekly scheduled runs during show season.",
  },
  {
    id: "4",
    name: "H&H Transport",
    company: "H&H",
    verified: false,
    rating: 4.5,
    reviewCount: 34,
    routes: "Southeast, Mid-Atlantic",
    priceRange: "$500 - $1,800",
    responseTime: "< 12 hours",
    insured: true,
    bio: "Boutique transport service. Small loads, personalized attention, hay and water included.",
  },
  {
    id: "5",
    name: "Pacific Equine Transport",
    company: "Pacific",
    verified: true,
    rating: 4.8,
    reviewCount: 89,
    routes: "West Coast, Southwest",
    priceRange: "$900 - $3,000",
    responseTime: "< 4 hours",
    insured: true,
    bio: "West Coast specialist. Climate-controlled trailers, rest stops every 4 hours.",
  },
  {
    id: "6",
    name: "Southern Express Equine",
    company: "Southern Express",
    verified: false,
    rating: 4.4,
    reviewCount: 21,
    routes: "Southeast, Texas",
    priceRange: "$400 - $1,500",
    responseTime: "< 24 hours",
    insured: false,
    bio: "Affordable transport for the Southeast region. Open and enclosed options available.",
  },
];

// Sample active shipment for the "My Shipments" tab
const sampleShipment = {
  carrierName: "Brook Ledge Horse Transportation",
  currentStatus: "in_transit" as const,
  pickupLocation: "Wellington, FL",
  deliveryLocation: "Lexington, KY",
  pickupDate: "Feb 25, 2026",
  estimatedDelivery: "Feb 27, 2026",
};

/* ─── Page ─── */

const tabs = ["Find Transporters", "My Shipments", "Quote Requests"] as const;
type Tab = (typeof tabs)[number];

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Find Transporters");
  const [searchQuery, setSearchQuery] = useState("");
  const [quoteCarrier, setQuoteCarrier] = useState<string | null>(null);

  const filteredTransporters = transporters.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.routes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* Hero */}
        <section className="with-grain bg-gradient-hero px-4 pt-24 pb-12 md:px-8 md:pt-36 md:pb-16">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-3 text-gold">TRANSPORT COORDINATION</p>
            <h1 className="text-4xl tracking-tight text-ink-black md:text-5xl">
              Ship your horse safely.
            </h1>
            <p className="text-lead mx-auto mt-4 max-w-2xl text-ink-mid">
              Find verified carriers, get instant quotes, and track every mile
              — coordinated through ManeVault for complete protection.
            </p>
          </div>
        </section>

        {/* Tabs */}
        <section className="bg-paper-cream px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-[1200px] mb-8">
            <div className="flex gap-1 rounded-lg bg-paper-warm p-1 max-w-md mx-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-paper-white text-ink-black shadow-flat"
                      : "text-ink-mid hover:text-ink-black"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Find Transporters ─── */}
          {activeTab === "Find Transporters" && (
            <div className="mx-auto max-w-[1200px]">
              <div className="grid gap-8 lg:grid-cols-4">
                {/* Sidebar — route estimator */}
                <aside className="lg:col-span-1">
                  <div className="space-y-4 lg:sticky lg:top-20">
                    <RouteCostEstimator />
                    <div className="rounded-lg border-0 bg-paper-white p-4 shadow-flat">
                      <h3 className="mb-2 text-xs font-medium text-ink-light">
                        MANEVAULT PROTECTION
                      </h3>
                      <p className="text-xs text-ink-mid">
                        Transport booked through ManeExchange is covered by
                        ManeVault escrow. Payment is held until safe delivery
                        is confirmed by both parties.
                      </p>
                    </div>
                  </div>
                </aside>

                {/* Main content */}
                <div className="lg:col-span-3">
                  {/* Search */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-light" />
                    <input
                      type="text"
                      placeholder="Search by name, route, or region..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-border bg-paper-white py-2.5 pl-10 pr-4 text-sm text-ink-black placeholder:text-ink-light focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                    />
                  </div>

                  <p className="mb-4 text-sm text-ink-mid">
                    {filteredTransporters.length} transporter
                    {filteredTransporters.length !== 1 ? "s" : ""}
                  </p>

                  <div className="space-y-4">
                    {filteredTransporters.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-lg border-0 bg-paper-white p-6 shadow-flat"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-paper-cream">
                              <Truck className="h-7 w-7 text-ink-mid" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-ink-black">
                                  {t.name}
                                </h3>
                                {t.verified && (
                                  <Shield className="h-4 w-4 text-forest" />
                                )}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink-mid">
                                <span className="flex items-center gap-1">
                                  <Star className="h-3.5 w-3.5 text-gold" />
                                  {t.rating} ({t.reviewCount})
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {t.routes}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-ink-mid">{t.bio}</p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-ink-mid">
                            <DollarSign className="h-4 w-4" />
                            {t.priceRange}
                          </span>
                          <span className="flex items-center gap-1 text-ink-mid">
                            <Clock className="h-4 w-4" />
                            {t.responseTime}
                          </span>
                          {t.insured && (
                            <Badge
                              variant="secondary"
                              className="bg-forest/10 text-forest text-xs"
                            >
                              Insured
                            </Badge>
                          )}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button size="sm">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Contact
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setQuoteCarrier(t.name)}
                          >
                            Get Quote
                          </Button>
                        </div>
                      </div>
                    ))}

                    {filteredTransporters.length === 0 && (
                      <div className="rounded-lg border-0 bg-paper-white py-16 text-center shadow-flat">
                        <Search className="mx-auto mb-4 h-12 w-12 text-ink-light" />
                        <h3 className="font-medium text-ink-black">
                          No transporters found
                        </h3>
                        <p className="mt-1 text-sm text-ink-mid">
                          Try adjusting your search terms.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── My Shipments ─── */}
          {activeTab === "My Shipments" && (
            <div className="mx-auto max-w-2xl space-y-6">
              <div>
                <h2 className="mb-1 font-heading text-lg font-semibold text-ink-black">
                  Active Shipments
                </h2>
                <p className="text-sm text-ink-mid">
                  Track your horse&apos;s journey in real time
                </p>
              </div>

              <TransportTracker
                currentStatus={sampleShipment.currentStatus}
                carrierName={sampleShipment.carrierName}
                pickupLocation={sampleShipment.pickupLocation}
                deliveryLocation={sampleShipment.deliveryLocation}
                pickupDate={sampleShipment.pickupDate}
                estimatedDelivery={sampleShipment.estimatedDelivery}
              />

              <div className="crease-divider" />

              <div>
                <h3 className="mb-3 font-heading text-base font-semibold text-ink-black">
                  Past Shipments
                </h3>
                <TransportTracker
                  currentStatus="delivered"
                  carrierName="Sallee Horse Vans"
                  pickupLocation="Aiken, SC"
                  deliveryLocation="Wellington, FL"
                  pickupDate="Jan 15, 2026"
                  estimatedDelivery="Jan 16, 2026"
                />
              </div>
            </div>
          )}

          {/* ─── Quote Requests ─── */}
          {activeTab === "Quote Requests" && (
            <div className="mx-auto max-w-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-ink-black">
                    Quote Requests
                  </h2>
                  <p className="text-sm text-ink-mid">
                    Request quotes from carriers and compare pricing
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setQuoteCarrier("")}
                >
                  New Quote Request
                </Button>
              </div>

              {/* Sample quote responses */}
              <div className="space-y-3">
                <div className="rounded-lg border-0 bg-paper-white p-5 shadow-flat">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-ink-black">
                          Wellington, FL → Lexington, KY
                        </h3>
                        <Badge variant="secondary" className="bg-forest/10 text-forest text-xs">
                          2 Quotes
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-ink-light">
                        Requested Feb 20, 2026 · 1 horse
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between rounded-md bg-paper-cream p-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-forest" />
                        <span className="text-sm font-medium text-ink-black">
                          Brook Ledge
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-base font-bold text-ink-black">
                          $1,450
                        </p>
                        <p className="text-[10px] text-ink-light">2 days transit</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-paper-cream p-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-forest" />
                        <span className="text-sm font-medium text-ink-black">
                          Sallee Horse Vans
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-base font-bold text-ink-black">
                          $1,200
                        </p>
                        <p className="text-[10px] text-ink-light">3 days transit</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1">
                      Book Brook Ledge
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Book Sallee
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border-0 bg-paper-white p-5 shadow-flat">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-ink-black">
                          Ocala, FL → Middleburg, VA
                        </h3>
                        <Badge variant="secondary" className="bg-gold/10 text-gold text-xs">
                          Pending
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-ink-light">
                        Requested Feb 26, 2026 · 1 horse
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-ink-mid">
                    Waiting for carrier responses...
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <BottomCTA />
      </main>

      <Footer />

      {/* Quote form overlay */}
      {quoteCarrier !== null && (
        <TransportQuoteForm
          carrierName={quoteCarrier || undefined}
          onClose={() => setQuoteCarrier(null)}
        />
      )}
    </div>
  );
}
