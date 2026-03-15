import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { FeaturePreview } from "@/components/feature-preview";
import {
  Scan,
  Mountain,
  Spline,
  Dumbbell,
  Footprints,
  Scale,
  Sparkles,
  Shield,
  History,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Conformation Analysis — AI-Powered Horse Assessment",
  description:
    "AI-assisted conformation analysis evaluates structure, balance, and movement potential. Coming soon to ManeExchange.",
};

/* ─── Area definitions ─── */

const areas = [
  {
    icon: Scan,
    title: "Head & Neck",
    detail: "Proportions, set, throatlatch, jaw width, eye placement",
  },
  {
    icon: Mountain,
    title: "Shoulder & Withers",
    detail: "Angle, height, freedom of movement, layback",
  },
  {
    icon: Spline,
    title: "Back & Loin",
    detail: "Length, coupling, topline muscling, vertebral alignment",
  },
  {
    icon: Dumbbell,
    title: "Hindquarters",
    detail: "Angle, muscling, croup, stifle and gaskin development",
  },
  {
    icon: Footprints,
    title: "Legs & Hooves",
    detail: "Straightness, bone, hoof quality, pastern angles, joints",
  },
  {
    icon: Scale,
    title: "Overall Balance",
    detail: "Proportions, symmetry, type, heart girth depth",
  },
];

/* ─── Page ─── */

export default function ConformationPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ── Hero ── */}
        <section className="with-grain bg-gradient-hero px-4 pt-24 pb-12 md:px-8 md:pt-36 md:pb-16">
          <div className="mx-auto max-w-[1200px] text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-[var(--radius-card)] bg-blue/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-blue" />
              <span className="text-sm font-medium text-blue">
                AI-Powered Assessment
              </span>
            </div>
            <h1 className="text-4xl tracking-tight text-ink-black md:text-5xl">
              See what the experts see.
            </h1>
            <p className="text-lead mx-auto mt-4 max-w-2xl text-ink-mid">
              AI-assisted conformation analysis evaluates structure, balance, and
              movement potential — giving you the professional eye, on demand.
            </p>
          </div>
        </section>

        {/* ── What We Analyze ── */}
        <section className="bg-paper-cream px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-8 text-center font-serif text-2xl font-semibold text-ink-black">
              Six areas of analysis
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {areas.map((area) => (
                <div
                  key={area.title}
                  className="rounded-lg bg-paper-white p-5 shadow-flat transition-elevation hover-lift hover:shadow-lifted"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue/10 text-blue">
                    <area.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1 text-sm font-medium text-ink-black">
                    {area.title}
                  </h3>
                  <p className="text-xs text-ink-mid">{area.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature Preview ── */}
        <section className="bg-paper-white px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-[800px]">
            <FeaturePreview
              icon={<Scan className="size-8" />}
              title="Conformation Analysis is coming soon"
              description="Upload a photo and get an AI-powered structural assessment — evaluating balance, proportions, and discipline suitability."
              capabilities={[
                "Six-area structural analysis with confidence scores",
                "Discipline suitability matching based on structural traits",
                "Breed standard comparison against ideal conformation",
                "Results recorded in the horse's Digital Passport",
              ]}
              actionLabel="Browse Horses"
              actionHref="/browse"
            />
          </div>
        </section>

        {/* ── Value Props ── */}
        <section className="bg-paddock px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-10 text-center font-serif text-2xl font-semibold text-paper-white">
              Why conformation analysis matters
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Shield,
                  title: "Buyer Confidence",
                  description:
                    "Objective structural assessment helps buyers understand what they're getting beyond photos and videos.",
                },
                {
                  icon: History,
                  title: "Track Over Time",
                  description:
                    "Score history shows how a horse's conformation develops with age and conditioning. Linked to the Digital Passport.",
                },
                {
                  icon: Sparkles,
                  title: "Discipline Matching",
                  description:
                    "Our AI evaluates suitability for specific disciplines based on structural traits — not just breed stereotypes.",
                },
              ].map((prop) => (
                <div
                  key={prop.title}
                  className="rounded-lg bg-ink-dark/30 p-6 backdrop-blur-sm"
                >
                  <prop.icon className="mb-3 h-6 w-6 text-gold" />
                  <h3 className="mb-2 font-medium text-paper-white">
                    {prop.title}
                  </h3>
                  <p className="text-sm text-ink-light">{prop.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
