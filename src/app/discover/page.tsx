import { getDiscoveryFeed } from "@/actions/discovery";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Sparkles,
  Clock,
  TrendingUp,
  Award,
  Heart,
  Eye,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover — ManeExchange",
  description:
    "Discover trending, new, and personalized horse listings on ManeExchange.",
};

function formatPrice(cents: number | null): string {
  if (!cents) return "Price TBD";
  return `$${(cents / 100).toLocaleString()}`;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  for_you: <Sparkles className="h-5 w-5 text-gold" />,
  new_this_week: <Clock className="h-5 w-5 text-blue" />,
  trending: <TrendingUp className="h-5 w-5 text-red" />,
  just_sold: <Award className="h-5 w-5 text-forest" />,
};

const SECTION_ACCENTS: Record<string, string> = {
  for_you: "bg-gold-light text-gold",
  new_this_week: "bg-blue-light text-blue",
  trending: "bg-red-light text-red",
  just_sold: "bg-forest-light text-forest",
};

export default async function DiscoverPage() {
  const { sections } = await getDiscoveryFeed();

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ── Hero ── */}
        <section className="with-grain bg-gradient-hero px-4 pt-24 pb-12 md:px-8 md:pt-36 md:pb-16">
          <div className="mx-auto max-w-[1200px]">
            <p className="overline mb-4 text-gold">DISCOVER</p>
            <h1 className="mb-4 text-3xl tracking-tight text-ink-black md:text-5xl">
              Personalized picks.
              <br />
              <span className="text-ink-mid">Trending horses.</span>
            </h1>
            <p className="text-lead max-w-xl text-ink-mid">
              Curated sections based on your preferences, marketplace trends,
              and the latest listings.
            </p>
          </div>
        </section>

        {/* ── Sections ── */}
        {sections.map((section, sIdx) => (
          <section
            key={section.type}
            className={`${sIdx % 2 === 0 ? "bg-paper-cream" : "bg-paper-white"} section-compact`}
          >
            <div className="mx-auto max-w-[1200px]">
              <div className="mb-8 flex items-center gap-3">
                {SECTION_ICONS[section.type]}
                <h2 className="text-2xl text-ink-black md:text-3xl">
                  {section.title}
                </h2>
                <Badge
                  variant="secondary"
                  className={`ml-1 text-xs ${SECTION_ACCENTS[section.type] ?? ""}`}
                >
                  {section.listings.length}
                </Badge>
              </div>

              {section.listings.length === 0 ? (
                <p className="text-sm text-ink-light">
                  No listings in this section yet.
                </p>
              ) : (
                <div className="stagger-children grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {section.listings.map((listing) => {
                    const l = listing as Record<string, unknown>;
                    return (
                      <Link
                        key={String(l.id)}
                        href={`/horses/${String(l.slug)}`}
                        className="animate-fade-up"
                      >
                        <div className="group overflow-hidden rounded-lg bg-paper-white shadow-flat transition-elevation hover-lift hover:shadow-lifted">
                          <div className="aspect-[4/3] bg-paper-warm">
                            {typeof l.primary_image_url === "string" ? (
                              <img
                                src={l.primary_image_url}
                                alt={String(l.name)}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-ink-faint">
                                No photo
                              </div>
                            )}
                          </div>

                          <div className="p-3">
                            <p className="font-heading text-sm font-semibold text-ink-black line-clamp-1">
                              {String(l.name)}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-ink-mid">
                              {typeof l.breed === "string" && (
                                <span>{l.breed}</span>
                              )}
                              {typeof l.location_state === "string" && (
                                <span>{l.location_state}</span>
                              )}
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="font-serif text-sm font-semibold text-ink-black">
                                {formatPrice(
                                  typeof l.price === "number"
                                    ? (l.price as number)
                                    : null
                                )}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-ink-light">
                                {typeof l.view_count === "number" &&
                                  l.view_count > 0 && (
                                    <span className="flex items-center gap-0.5">
                                      <Eye className="h-3 w-3" />
                                      {l.view_count as number}
                                    </span>
                                  )}
                                {typeof l.favorite_count === "number" &&
                                  l.favorite_count > 0 && (
                                    <span className="flex items-center gap-0.5">
                                      <Heart className="h-3 w-3" />
                                      {l.favorite_count as number}
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
