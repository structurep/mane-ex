import { StarRating } from "@/components/marketplace/star-rating";

const testimonials = [
  {
    rating: 5,
    quote:
      "I found my dream horse in 48 hours. The vet records were already uploaded, the seller was responsive, and the whole process felt... safe. I've never experienced that buying a horse before.",
    name: "Alexandra K.",
    role: "Hunter/Jumper Rider",
    location: "Wellington, FL",
    initials: "AK",
  },
  {
    rating: 5,
    quote:
      "I listed three horses last month and sold two within a week. The quality of inquiries is so much higher than Facebook groups. These are serious buyers.",
    name: "Madison T.",
    role: "Trainer & Dealer",
    location: "Ocala, FL",
    initials: "MT",
  },
  {
    rating: 5,
    quote:
      "Finally, a platform that treats horse buying like the serious investment it is. Transparent pricing, real photos, verified sellers. This is what we've been waiting for.",
    name: "Jordan P.",
    role: "Amateur Owner",
    location: "Greenwich, CT",
    initials: "JP",
  },
];

export function TestimonialSection() {
  return (
    <section className="bg-paper-cream px-4 py-12 md:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 text-center font-serif text-3xl text-ink-black md:text-4xl">
          Loved by riders everywhere.
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-crease-light bg-paper-white p-6"
            >
              <StarRating value={t.rating} readonly size="sm" />
              <p className="mt-4 text-sm italic leading-relaxed text-ink-dark">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-black">
                    {t.name}
                  </p>
                  <p className="text-xs text-ink-mid">
                    {t.role}, {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
