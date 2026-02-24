import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CompareShareButton } from "./share-button";

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>;
}

interface CompareListing {
  id: string;
  name: string;
  slug: string;
  breed: string | null;
  gender: string | null;
  age_years: number | null;
  height_hands: number | null;
  price: number | null;
  location_city: string | null;
  location_state: string | null;
  level: string | null;
  completeness_score: number;
  completeness_grade: string;
  status: string;
  warranty: string;
  temperament: string | null;
  suitable_for: string | null;
  disciplines: { name: string }[];
}

function formatPrice(cents: number | null): string {
  if (!cents) return "Contact for price";
  return `$${(cents / 100).toLocaleString()}`;
}

function formatHeight(hands: number | null): string {
  if (!hands) return "—";
  return `${hands} hh`;
}

function CompareRow({
  label,
  values,
  highlight,
}: {
  label: string;
  values: (string | null)[];
  highlight?: "lowest-price" | "highest-score";
}) {
  let bestIdx = -1;
  if (highlight === "lowest-price") {
    const nums = values.map((v) => (v && v !== "—" && v !== "Contact for price" ? parseFloat(v.replace(/[$,]/g, "")) : Infinity));
    const min = Math.min(...nums);
    if (min !== Infinity) bestIdx = nums.indexOf(min);
  } else if (highlight === "highest-score") {
    const nums = values.map((v) => (v ? parseInt(v) : 0));
    const max = Math.max(...nums);
    if (max > 0) bestIdx = nums.indexOf(max);
  }

  return (
    <div className="grid items-center gap-4 py-3" style={{ gridTemplateColumns: `160px repeat(${values.length}, 1fr)` }}>
      <span className="text-sm font-medium text-ink-mid">{label}</span>
      {values.map((value, i) => (
        <span
          key={i}
          className={`text-sm ${
            i === bestIdx
              ? highlight === "lowest-price"
                ? "font-serif font-bold text-forest"
                : "font-semibold text-forest"
              : "text-ink-black"
          }`}
        >
          {value || "—"}
        </span>
      ))}
    </div>
  );
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const ids = params.ids?.split(",").filter(Boolean).slice(0, 3) ?? [];

  if (ids.length < 2) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="with-grain bg-gradient-hero section-premium">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-3xl tracking-tight text-ink-black md:text-5xl">
              Compare Horses
            </h1>
            <p className="text-lead text-ink-mid">
              Select 2-3 horses to compare side by side.
            </p>
            <Button asChild className="mt-8" size="lg">
              <Link href="/browse">Browse Horses</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("horse_listings")
    .select(`
      id, name, slug, breed, gender, age_years, height_hands, price,
      location_city, location_state, level, completeness_score, completeness_grade,
      status, warranty, temperament, suitable_for,
      disciplines(name)
    `)
    .in("id", ids)
    .in("status", ["active", "under_offer", "sold"]);

  if (!listings || listings.length < 2) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="with-grain bg-gradient-hero section-premium">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-3xl tracking-tight text-ink-black md:text-5xl">
              Listings Not Found
            </h1>
            <p className="text-lead text-ink-mid">
              Some of the selected listings are no longer available.
            </p>
            <Button asChild variant="outline" className="mt-8" size="lg">
              <Link href="/browse">Browse Horses</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const ordered = ids
    .map((id) => listings.find((l: CompareListing) => l.id === id))
    .filter(Boolean) as CompareListing[];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ── Header ── */}
        <section className="bg-paper-white px-4 pt-24 pb-8 md:px-8 md:pt-28">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href="/browse"
                  className="mb-3 flex items-center gap-1 text-sm text-ink-mid hover:text-ink-black"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Browse
                </Link>
                <h1 className="text-3xl tracking-tight text-ink-black md:text-4xl">
                  Compare {ordered.length} Horses
                </h1>
              </div>
              <CompareShareButton ids={ids} />
            </div>
          </div>
        </section>

        {/* ── Comparison Table ── */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-5xl overflow-x-auto">
            {/* Horse names header */}
            <div
              className="mb-6 grid gap-4"
              style={{ gridTemplateColumns: `160px repeat(${ordered.length}, 1fr)` }}
            >
              <div />
              {ordered.map((horse) => (
                <div key={horse.id} className="rounded-lg bg-paper-white p-4 shadow-flat">
                  <Link
                    href={`/horses/${horse.slug}`}
                    className="group flex items-center gap-1 font-serif text-xl font-bold text-ink-black hover:text-blue"
                  >
                    {horse.name}
                    <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                  {horse.status === "sold" && (
                    <Badge variant="secondary" className="mt-1 bg-red-light text-red text-xs">
                      Sold
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison rows */}
            <div className="rounded-lg bg-paper-white p-6 shadow-flat">
              <p className="overline mb-2 text-ink-light">BASIC INFO</p>
              <CompareRow
                label="Price"
                values={ordered.map((h) => formatPrice(h.price))}
                highlight="lowest-price"
              />
              <div className="crease-divider" />
              <CompareRow label="Breed" values={ordered.map((h) => h.breed)} />
              <div className="crease-divider" />
              <CompareRow
                label="Gender"
                values={ordered.map((h) =>
                  h.gender ? h.gender.charAt(0).toUpperCase() + h.gender.slice(1) : null
                )}
              />
              <div className="crease-divider" />
              <CompareRow
                label="Age"
                values={ordered.map((h) => (h.age_years !== null ? `${h.age_years} years` : null))}
              />
              <div className="crease-divider" />
              <CompareRow
                label="Height"
                values={ordered.map((h) => formatHeight(h.height_hands))}
              />
              <div className="crease-divider" />
              <CompareRow
                label="Location"
                values={ordered.map((h) =>
                  h.location_city && h.location_state
                    ? `${h.location_city}, ${h.location_state}`
                    : h.location_state
                )}
              />

              <div className="my-6 h-px bg-crease-light" />
              <p className="overline mb-2 text-ink-light">DISCIPLINE & LEVEL</p>
              <CompareRow
                label="Disciplines"
                values={ordered.map((h) =>
                  h.disciplines?.length > 0
                    ? h.disciplines.map((d) => d.name).join(", ")
                    : null
                )}
              />
              <div className="crease-divider" />
              <CompareRow label="Level" values={ordered.map((h) => h.level)} />
              <div className="crease-divider" />
              <CompareRow label="Suitable For" values={ordered.map((h) => h.suitable_for)} />

              <div className="my-6 h-px bg-crease-light" />
              <p className="overline mb-2 text-ink-light">DETAILS</p>
              <CompareRow label="Temperament" values={ordered.map((h) => h.temperament)} />
              <div className="crease-divider" />
              <CompareRow
                label="Warranty"
                values={ordered.map((h) =>
                  h.warranty === "as_is"
                    ? "As Is"
                    : h.warranty === "sound_at_sale"
                    ? "Sound at Sale"
                    : h.warranty === "sound_for_use"
                    ? "Sound for Use"
                    : null
                )}
              />
              <div className="crease-divider" />
              <CompareRow
                label="Listing Score"
                values={ordered.map((h) => String(h.completeness_score))}
                highlight="highest-score"
              />
              <div className="crease-divider" />
              <CompareRow
                label="Grade"
                values={ordered.map((h) =>
                  h.completeness_grade
                    ? h.completeness_grade.charAt(0).toUpperCase() +
                      h.completeness_grade.slice(1)
                    : null
                )}
              />
            </div>

            {/* Action buttons */}
            <div
              className="mt-6 grid gap-4"
              style={{ gridTemplateColumns: `160px repeat(${ordered.length}, 1fr)` }}
            >
              <div />
              {ordered.map((horse) => (
                <Button key={horse.id} asChild variant="outline" className="w-full">
                  <Link href={`/horses/${horse.slug}`}>View Listing</Link>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-paper-white px-4 py-8 md:px-8">
          <p className="mx-auto max-w-5xl text-xs text-ink-light">
            All representations are made by the seller. ManeExchange does not warrant
            listing accuracy. Listing score reflects documentation completeness, not
            horse quality.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
