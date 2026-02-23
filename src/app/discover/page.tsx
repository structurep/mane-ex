import { getDiscoveryFeed } from "@/actions/discovery";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
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

export default async function DiscoverPage() {
  const { sections } = await getDiscoveryFeed();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-ink-black">
              Discover
            </h1>
            <p className="mt-1 text-ink-mid">
              Personalized picks, trending horses, and the latest listings.
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.type} className="mb-12">
              <div className="mb-4 flex items-center gap-2">
                {SECTION_ICONS[section.type]}
                <h2 className="font-heading text-xl font-semibold text-ink-black">
                  {section.title}
                </h2>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {section.listings.length}
                </Badge>
              </div>

              {section.listings.length === 0 ? (
                <p className="text-sm text-ink-light">
                  No listings in this section yet.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {section.listings.map((listing) => {
                    const l = listing as Record<string, unknown>;
                    return (
                      <Link
                        key={String(l.id)}
                        href={`/horses/${String(l.slug)}`}
                      >
                        <Card className="group overflow-hidden transition-shadow hover:shadow-folded">
                          {/* Image */}
                          <div className="aspect-[4/3] bg-paper-cream">
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
                              <span className="text-sm font-semibold text-ink-black">
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
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
