import {
  BarChart3,
  CreditCard,
  GitCompareArrows,
  FileCheck,
  TrendingUp,
  Truck,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Mane Score",
    description: "Instant trust at a glance",
    color: "text-primary bg-primary/10",
  },
  {
    icon: CreditCard,
    title: "Mane Pay",
    description: "Secure escrow payments",
    color: "text-bronze bg-bronze/10",
  },
  {
    icon: GitCompareArrows,
    title: "ISO Matching",
    description: "Buyers come to you",
    color: "text-bronze bg-bronze/10",
  },
  {
    icon: FileCheck,
    title: "Verified Docs",
    description: "PPE, x-rays, records",
    color: "text-blue bg-blue-light",
  },
  {
    icon: TrendingUp,
    title: "Analytics",
    description: "Market intelligence",
    color: "text-gold bg-gold-light",
  },
  {
    icon: Truck,
    title: "Shipping",
    description: "Quotes & coordination",
    color: "text-ink-dark bg-ink-black/5",
  },
];

export function PlatformFeatures() {
  return (
    <section aria-label="Platform features" className="bg-warmwhite px-4 py-14 md:px-8 md:py-18">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="overline mb-2 text-ink-faint">PLATFORM</p>
          <h2 className="display-lg text-ink">
            Everything you need. One platform.
          </h2>
          <p className="mt-3 text-ink-mid">
            Search, compare, verify, pay, and ship &mdash; all without leaving
            ManeExchange.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`mb-3 flex h-14 w-14 items-center justify-center rounded-xl ${f.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-ink-black">
                  {f.title}
                </p>
                <p className="mt-0.5 text-xs text-ink-mid">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
