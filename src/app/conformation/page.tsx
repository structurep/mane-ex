import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/bottom-cta";
import {
  ArrowRight,
  Scan,
  Mountain,
  Spline,
  Dumbbell,
  Footprints,
  Scale,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Conformation Analysis — AI-Assisted Assessment",
  description:
    "AI-assisted conformation analysis for horses. Upload a photo and get detailed scoring on head, shoulder, back, hindquarters, legs, and overall balance.",
};

const areas = [
  {
    icon: Scan,
    title: "Head & Neck",
    detail: "Proportions, set, throatlatch",
    score: 8.2,
  },
  {
    icon: Mountain,
    title: "Shoulder & Withers",
    detail: "Angle, height, freedom of movement",
    score: 7.8,
  },
  {
    icon: Spline,
    title: "Back & Loin",
    detail: "Length, coupling, topline",
    score: 8.5,
  },
  {
    icon: Dumbbell,
    title: "Hindquarters",
    detail: "Angle, muscling, croup",
    score: 9.0,
  },
  {
    icon: Footprints,
    title: "Legs & Hooves",
    detail: "Straightness, bone, hoof quality",
    score: 7.6,
  },
  {
    icon: Scale,
    title: "Overall Balance",
    detail: "Proportions, symmetry, type",
    score: 8.5,
  },
];

function ScoreBar({ score }: { score: number }) {
  const percentage = (score / 10) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 rounded-full bg-crease-light">
        <div
          className="h-2 rounded-full bg-blue"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-12 text-right text-sm font-semibold text-ink-black">
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export default function ConformationPage() {
  const overallScore =
    areas.reduce((sum, a) => sum + a.score, 0) / areas.length;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ── Hero ── */}
        <section className="bg-paper-white px-4 pt-20 pb-16 md:px-8 md:pt-24">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-3 text-blue">CONFORMATION ANALYSIS</p>
            <h1 className="mb-4 text-4xl font-bold text-ink-black md:text-5xl">
              See what the experts see.
            </h1>
            <p className="text-lead mx-auto max-w-2xl text-ink-mid">
              AI-assisted conformation assessment that evaluates structure,
              balance, and movement potential &mdash; giving you the
              professional eye, on demand.
            </p>
          </div>
        </section>

        {/* ── What We Analyze ── */}
        <section className="bg-paper-cream px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-12 text-center text-2xl font-semibold text-ink-black">
              What we analyze
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {areas.map((area) => (
                <div
                  key={area.title}
                  className="rounded-lg bg-paper-white p-6 shadow-folded transition-elevation hover-lift"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue/10 text-blue">
                    <area.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium text-ink-black">
                    {area.title}
                  </h3>
                  <p className="text-sm text-ink-mid">{area.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sample Analysis ── */}
        <section className="bg-paper-white px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-12 text-center">
              <p className="overline mb-3 text-ink-light">PREVIEW</p>
              <h2 className="text-2xl font-semibold text-ink-black">
                What an analysis looks like
              </h2>
            </div>

            <div className="mx-auto max-w-4xl">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Annotated Photo Placeholder */}
                <div className="flex aspect-[4/3] items-center justify-center rounded-lg border-2 border-dashed border-crease-mid bg-paper-cream">
                  <div className="text-center">
                    <Scan className="mx-auto mb-3 h-12 w-12 text-ink-faint" />
                    <p className="text-sm font-medium text-ink-light">
                      Photo with AI annotations
                    </p>
                    <p className="mt-1 text-xs text-ink-faint">
                      Key points, angles, and proportion lines overlaid
                    </p>
                  </div>
                </div>

                {/* Scores */}
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="rounded-lg border border-blue/30 bg-paper-white p-6 text-center shadow-lifted">
                    <p className="overline mb-2 text-blue">OVERALL SCORE</p>
                    <p className="font-heading text-4xl font-bold text-ink-black">
                      {overallScore.toFixed(1)}
                      <span className="text-xl font-normal text-ink-light">
                        /10
                      </span>
                    </p>
                    <p className="mt-1 text-sm font-medium text-forest">
                      Excellent Conformation
                    </p>
                  </div>

                  {/* Individual Scores */}
                  <div className="rounded-lg border border-crease-light bg-paper-cream p-6 shadow-flat">
                    <p className="overline mb-4 text-ink-light">
                      AREA SCORES
                    </p>
                    <div className="space-y-4">
                      {areas.map((area) => (
                        <div key={area.title}>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm text-ink-dark">
                              {area.title}
                            </span>
                          </div>
                          <ScoreBar score={area.score} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-8 rounded-lg border border-crease-light bg-paper-cream p-6 shadow-flat">
                <p className="overline mb-3 text-ink-light">
                  ANALYSIS NOTES
                </p>
                <div className="space-y-2 text-sm leading-relaxed text-ink-mid">
                  <p>
                    Strong hindquarters with good angulation and muscling,
                    contributing to powerful propulsion. Well-set neck with
                    clean throatlatch allows for excellent flexion.
                  </p>
                  <p>
                    Slight toeing out on the left front &mdash; monitor for
                    uneven wear. Back length is proportional with strong
                    loin coupling. Overall balance and symmetry are above
                    average for the breed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Coming Soon Banner ── */}
        <section className="bg-ink-black px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-3 text-blue">COMING SOON</p>
            <h2 className="mb-4 text-3xl font-semibold text-paper-white">
              Conformation Analysis is coming soon.
            </h2>
            <p className="text-lead mx-auto mb-8 max-w-xl text-ink-light">
              Upload a photo. Get a professional-grade structural assessment
              in seconds. Sign up for early access.
            </p>
            <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 rounded-md border border-crease-dark/30 bg-ink-dark px-4 py-3 text-sm text-paper-white placeholder:text-ink-light focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                aria-label="Email address for early access"
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-blue px-6 py-3 text-sm font-medium text-paper-white transition-colors hover:bg-blue/90">
                Get Early Access
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
