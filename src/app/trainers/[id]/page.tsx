import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AvatarCircle, StatusBadge, IconDetailList, type IconDetailItem } from "@/components/tailwind-plus";
import { MapPin, Star, Clock, DollarSign, CheckCircle, Award, Globe, Phone } from "lucide-react";
import { getTrainerDetail } from "@/actions/trainers";
import { SERVICE_CATEGORY_LABELS } from "@/types/trainers";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { trainer } = await getTrainerDetail(id);
  if (!trainer) return { title: "Trainer Not Found" };
  return {
    title: `${trainer.display_name || "Trainer"} — ManeExchange Trainer Directory`,
    description: trainer.headline || trainer.bio?.slice(0, 160) || "Verified trainer on ManeExchange",
  };
}

export default async function TrainerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const { trainer } = await getTrainerDetail(id);

  if (!trainer) notFound();

  const name = trainer.display_name || "Trainer";
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const location = [trainer.location_city, trainer.location_state].filter(Boolean).join(", ");

  const detailItems: IconDetailItem[] = [
    trainer.years_experience != null && {
      icon: <Award className="h-4 w-4" />,
      label: "Experience",
      value: `${trainer.years_experience} year${trainer.years_experience !== 1 ? "s" : ""}`,
    },
    location && {
      icon: <MapPin className="h-4 w-4" />,
      label: "Location",
      value: location,
    },
    trainer.service_radius_miles && {
      icon: <MapPin className="h-4 w-4" />,
      label: "Service Area",
      value: `${trainer.service_radius_miles} mile radius`,
    },
    trainer.phone && {
      icon: <Phone className="h-4 w-4" />,
      label: "Phone",
      value: trainer.phone,
    },
    trainer.website_url && {
      icon: <Globe className="h-4 w-4" />,
      label: "Website",
      value: (
        <a href={trainer.website_url} target="_blank" rel="noopener noreferrer" className="text-oxblood hover:underline">
          {new URL(trainer.website_url).hostname}
        </a>
      ),
    },
  ].filter(Boolean) as IconDetailItem[];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="bg-paper-cream px-4 py-16 md:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Profile header */}
          <div className="flex items-start gap-4">
            <AvatarCircle
              src={trainer.avatar_url}
              initials={initials}
              alt={name}
              size={64}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-semibold text-ink-black">{name}</h1>
                {trainer.verified && (
                  <StatusBadge variant="forest" dot>Verified</StatusBadge>
                )}
              </div>
              {trainer.headline && (
                <p className="mt-1 text-sm text-ink-mid">{trainer.headline}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-light">
                {trainer.rating_avg && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-gold" />
                    {trainer.rating_avg} ({trainer.review_count} review{trainer.review_count !== 1 ? "s" : ""})
                  </span>
                )}
                {trainer.accepting_clients && (
                  <span className="flex items-center gap-1 text-forest">
                    <CheckCircle className="h-3 w-3" />
                    Accepting clients
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {trainer.bio && (
            <div className="mt-8">
              <h2 className="mb-2 text-sm font-semibold text-ink-dark">About</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-mid">{trainer.bio}</p>
            </div>
          )}

          {/* Details */}
          {detailItems.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-2 text-sm font-semibold text-ink-dark">Details</h2>
              <IconDetailList items={detailItems} />
            </div>
          )}

          {/* Disciplines */}
          {trainer.disciplines.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-2 text-sm font-semibold text-ink-dark">Disciplines</h2>
              <div className="flex flex-wrap gap-1.5">
                {trainer.disciplines.map((d) => (
                  <StatusBadge key={d} variant="blue">{d}</StatusBadge>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {trainer.certifications.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-2 text-sm font-semibold text-ink-dark">Certifications</h2>
              <div className="flex flex-wrap gap-1.5">
                {trainer.certifications.map((c) => (
                  <StatusBadge key={c} variant="gold">{c}</StatusBadge>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {trainer.services.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-ink-dark">Services</h2>
              <div className="space-y-3">
                {trainer.services.map((s) => (
                  <div key={s.id} className="rounded-lg bg-paper-white p-4 shadow-flat">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink-black">{s.name}</p>
                        <StatusBadge variant="blue" className="mt-1">
                          {SERVICE_CATEGORY_LABELS[s.category]}
                        </StatusBadge>
                      </div>
                      {s.price_cents != null && s.price_type !== "contact" ? (
                        <div className="text-right">
                          <p className="font-serif text-lg font-bold text-ink-black">
                            ${(s.price_cents / 100).toLocaleString()}
                          </p>
                          <p className="text-[11px] text-ink-faint">
                            {s.price_type === "hourly" ? "/hr" : s.price_type === "per_session" ? "/session" : ""}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-ink-light">Contact for pricing</p>
                      )}
                    </div>
                    {s.description && (
                      <p className="mt-2 text-xs leading-relaxed text-ink-mid">{s.description}</p>
                    )}
                    {s.duration_minutes && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-ink-faint">
                        <Clock className="h-3 w-3" />
                        {s.duration_minutes >= 60
                          ? `${Math.floor(s.duration_minutes / 60)}h${s.duration_minutes % 60 > 0 ? ` ${s.duration_minutes % 60}m` : ""}`
                          : `${s.duration_minutes}m`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
