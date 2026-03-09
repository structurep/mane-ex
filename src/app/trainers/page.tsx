import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { EmptyState, AvatarCircle, StatusBadge } from "@/components/tailwind-plus";
import { Users, MapPin, Star, CheckCircle } from "lucide-react";
import { searchTrainers } from "@/actions/trainers";
import { SERVICE_CATEGORY_LABELS } from "@/types/trainers";

export const metadata: Metadata = {
  title: "Trainer Directory & Services",
  description:
    "Find verified trainers on ManeExchange. Book pre-purchase evaluations, trial rides, training assessments, and more.",
};

export default async function TrainerDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; discipline?: string; category?: string }>;
}) {
  const params = await searchParams;
  const { trainers } = await searchTrainers(params);

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

      {/* Directory */}
      <section className="bg-paper-cream px-4 py-16 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          {trainers.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trainers.map((t) => {
                const name = t.display_name || "Trainer";
                const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                const location = [t.location_city, t.location_state].filter(Boolean).join(", ");

                return (
                  <Link
                    key={t.id}
                    href={`/trainers/${t.id}`}
                    className="group rounded-lg bg-paper-white p-5 shadow-flat transition-all hover:shadow-folded"
                  >
                    <div className="flex items-center gap-3">
                      <AvatarCircle
                        src={t.avatar_url}
                        initials={initials}
                        alt={name}
                        size={48}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-semibold text-ink-black">{name}</span>
                          {t.verified && (
                            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-forest" />
                          )}
                        </div>
                        {t.headline && (
                          <p className="truncate text-xs text-ink-mid">{t.headline}</p>
                        )}
                      </div>
                    </div>

                    {location && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-ink-light">
                        <MapPin className="h-3 w-3" />
                        {location}
                      </div>
                    )}

                    {t.rating_avg && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-ink-light">
                        <Star className="h-3 w-3 text-gold" />
                        {t.rating_avg} ({t.review_count} review{t.review_count !== 1 ? "s" : ""})
                      </div>
                    )}

                    {t.services.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {t.services.slice(0, 3).map((s) => (
                          <StatusBadge key={s.id} variant="blue">
                            {SERVICE_CATEGORY_LABELS[s.category]}
                          </StatusBadge>
                        ))}
                        {t.services.length > 3 && (
                          <StatusBadge variant="gray">+{t.services.length - 3}</StatusBadge>
                        )}
                      </div>
                    )}

                    {t.disciplines.length > 0 && (
                      <p className="mt-2 truncate text-xs text-ink-faint">
                        {t.disciplines.join(" · ")}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg bg-paper-white shadow-flat">
              <EmptyState
                icon={<Users className="size-10" />}
                title="No trainers listed yet"
                description="Be the first trainer on ManeExchange. Create your profile from your dashboard."
                actionLabel="Create Trainer Profile"
                actionHref="/dashboard/trainer"
              />
            </div>
          )}
        </div>
      </section>

      <BottomCTA />
      <Footer />
    </div>
  );
}
