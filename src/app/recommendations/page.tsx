import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { EmptyState } from "@/components/tailwind-plus";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Personalized Recommendations — ManeExchange",
  description:
    "Get AI-powered horse recommendations tailored to your preferences, discipline, and budget on ManeExchange.",
};

export default function RecommendationsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="with-grain bg-gradient-hero px-4 pt-24 pb-12 md:px-8 md:pt-36 md:pb-16">
          <div className="mx-auto max-w-[1200px] text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-[var(--radius-card)] bg-gold/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium text-gold">
                Smart Matching
              </span>
            </div>
            <h1 className="text-4xl tracking-tight text-ink-black md:text-5xl">
              Horses picked for you.
            </h1>
            <p className="text-lead mx-auto mt-4 max-w-2xl text-ink-mid">
              ManeMatch will analyze your preferences, browsing history, saved
              horses, and feedback to surface your best matches — and explain
              exactly why each horse was selected.
            </p>
          </div>
        </section>

        {/* Coming soon */}
        <section className="bg-paper-cream px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-[1200px]">
            <div className="rounded-lg border border-dashed border-crease-mid bg-paper-white">
              <EmptyState
                icon={<Sparkles className="size-10" />}
                title="ManeMatch is coming soon"
                description="AI-powered horse matching based on your preferences, browsing history, and saved horses. We'll notify you when it's ready."
              />
            </div>
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
