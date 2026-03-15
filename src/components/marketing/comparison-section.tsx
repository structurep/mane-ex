import { X, Check } from "lucide-react";

const oldWay = [
  '"DM for price" — guessing games',
  "No vet records until you're already hooked",
  "Ghosted after the PPE",
  "Facebook groups with no accountability",
  '"Priced to sell" means who knows what',
  "Hope for the best, prepare for heartbreak",
];

const maneWay = [
  {
    title: "Transparent pricing",
    desc: "Every horse has a clear asking price. No guessing.",
  },
  {
    title: "Vet records upfront",
    desc: "X-rays, PPE results, and health history — before you fall in love.",
  },
  {
    title: "Verified sellers",
    desc: "Real people, real barns, real accountability.",
  },
  {
    title: "Built-in communication",
    desc: "Every conversation is tracked. No more ghosting.",
  },
  {
    title: "Price history & alerts",
    desc: "See price changes. Get notified when your dream horse drops.",
  },
  {
    title: "Peace of mind",
    desc: "Buy with confidence. Sell with integrity.",
  },
];

export function ComparisonSection() {
  return (
    <section aria-label="How ManeExchange compares" className="bg-paper-white px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="overline mb-2 text-[var(--ink-faint)]">COMPARISON</p>
          <h2 className="display-lg text-[var(--ink-black)]">
            A better way to find your horse.
          </h2>
          <p className="mt-3 text-[var(--ink-mid)]">
            The horse market has been broken for decades. We&apos;re fixing it.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {/* Old way */}
          <div className="paper-flat p-6 md:p-8">
            <h3 className="mb-6 font-heading text-lg font-semibold text-ink-black">
              The old way
            </h3>
            <div className="space-y-4">
              {oldWay.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red/10">
                    <X className="h-3 w-3 text-red" />
                  </div>
                  <p className="text-sm text-ink-mid">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ManeExchange way */}
          <div className="paper-flat border-[var(--accent-saddle)]/20 bg-[var(--accent-saddle)]/[0.02] p-6 md:p-8">
            <h3 className="mb-6 font-heading text-lg font-semibold text-ink-black">
              The ManeExchange way
            </h3>
            <div className="space-y-4">
              {maneWay.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest/10">
                    <Check className="h-3 w-3 text-forest" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-black">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-mid">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
