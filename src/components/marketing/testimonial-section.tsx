import { Shield, Search, TrendingUp } from "lucide-react";

const valueProps = [
  {
    icon: Search,
    title: "Search smarter",
    description:
      "Filter by breed, discipline, price, location, height, and age. Every listing includes photos, vet records, and a Mane Score so you can evaluate before you inquire.",
  },
  {
    icon: Shield,
    title: "Transact with confidence",
    description:
      "ManeVault escrow holds funds securely until both parties are satisfied. Verified sellers, documented health records, and UCC-compliant bills of sale — built in.",
  },
  {
    icon: TrendingUp,
    title: "Sell to serious buyers",
    description:
      "No tire-kickers. Transparent pricing attracts qualified buyers, and your Mane Score rewards thoroughness. Higher scores mean more visibility.",
  },
];

export function TestimonialSection() {
  return (
    <section className="bg-paper-cream px-4 py-12 md:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 text-center font-serif text-3xl text-ink-black md:text-4xl">
          Built for the way you buy and sell.
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {valueProps.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="rounded-2xl border border-crease-light bg-paper-white p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-ink-black">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-mid">
                  {v.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
