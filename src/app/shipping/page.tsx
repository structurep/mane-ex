import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { FeaturePreview } from "@/components/feature-preview";
import { Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Horse Transport & Shipping",
  description:
    "Find verified horse transporters, get instant quotes, and track shipments through ManeExchange.",
};

export default function ShippingPage() {
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

        {/* Feature preview */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-[1200px]">
            <FeaturePreview
              icon={<Truck className="size-8" />}
              title="Transport coordination is coming soon"
              description="We're integrating verified equine carriers into ManeExchange so you can book, pay, and track — all in one place."
              capabilities={[
                "Search verified transporters by route and availability",
                "Get instant quotes with upfront pricing",
                "Track shipments in real time with GPS updates",
                "ManeVault escrow protection on all transport bookings",
              ]}
              actionLabel="Browse Horses"
              actionHref="/browse"
            />
          </div>
        </section>

        <BottomCTA />
      </main>

      <Footer />
    </div>
  );
}
