import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { FeaturePreview } from "@/components/feature-preview";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Trainer Directory & Services",
  description:
    "Find verified trainers on ManeExchange. Book pre-purchase evaluations, trial rides, training assessments, and more.",
};

export default function TrainerDirectoryPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="with-grain bg-gradient-hero px-4 pt-24 pb-12 md:px-8 md:pt-36 md:pb-16">
        <div className="mx-auto max-w-[1200px]">
          <p className="overline mb-3 text-gold">TRAINER MARKETPLACE</p>
          <h1 className="mb-4 text-4xl tracking-tight text-ink-black md:text-5xl">
            Expert help, on demand.
          </h1>
          <p className="text-lead max-w-xl text-ink-mid">
            Book pre-purchase evaluations, trial rides, and training
            assessments from verified professionals.
          </p>
        </div>
      </section>

      {/* Feature preview */}
      <section className="bg-paper-cream section-premium">
        <div className="mx-auto max-w-[1200px]">
          <FeaturePreview
            icon={<Users className="size-8" />}
            title="Trainer Directory is coming soon"
            description="We're building a verified trainer marketplace where you can find, evaluate, and book equine professionals."
            capabilities={[
              "Search trainers by discipline, location, and services",
              "View credentials, reviews, and service pricing",
              "Book PPE supervision, trial rides, and assessments",
              "Message trainers directly through ManeExchange",
            ]}
            actionLabel="Browse Horses"
            actionHref="/browse"
          />
        </div>
      </section>

      <BottomCTA />
      <Footer />
    </div>
  );
}
