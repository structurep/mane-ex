import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft, Share2, ExternalLink } from "lucide-react";
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
  // Find the "best" index for highlighting
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
    <div className="grid items-center gap-4 border-b border-crease-light py-3" style={{ gridTemplateColumns: `160px repeat(${values.length}, 1fr)` }}>
      <span className="text-sm font-medium text-ink-mid">{label}</span>
      {values.map((value, i) => (
        <span
          key={i}
          className={`text-sm ${
            i === bestIdx ? "font-semibold text-forest" : "text-ink-black"
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
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold text-ink-black">
          Compare Horses
        </h1>
        <p className="mt-2 text-ink-mid">
          Select 2-3 horses to compare side by side.
        </p>
        <Button asChild className="mt-6">
          <Link href="/browse">Browse Horses</Link>
        </Button>
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
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold text-ink-black">
          Listings Not Found
        </h1>
        <p className="mt-2 text-ink-mid">
          Some of the selected listings are no longer available.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/browse">Browse Horses</Link>
        </Button>
      </div>
    );
  }

  // Order listings to match the order of IDs in the URL
  const ordered = ids
    .map((id) => listings.find((l: CompareListing) => l.id === id))
    .filter(Boolean) as CompareListing[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/browse"
            className="mb-2 flex items-center gap-1 text-sm text-ink-mid hover:text-ink-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Browse
          </Link>
          <h1 className="font-heading text-2xl font-semibold text-ink-black">
            Compare {ordered.length} Horses
          </h1>
        </div>
        <CompareShareButton ids={ids} />
      </div>

      {/* Horse names header */}
      <div
        className="mb-2 grid gap-4"
        style={{ gridTemplateColumns: `160px repeat(${ordered.length}, 1fr)` }}
      >
        <div />
        {ordered.map((horse) => (
          <div key={horse.id}>
            <Link
              href={`/horses/${horse.slug}`}
              className="group flex items-center gap-1 font-heading text-lg font-semibold text-ink-black hover:text-accent-blue"
            >
              {horse.name}
              <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            {horse.status === "sold" && (
              <Badge variant="secondary" className="mt-1 bg-ink-light/10 text-ink-mid">
                Sold
              </Badge>
            )}
          </div>
        ))}
      </div>

      <Separator className="mb-4" />

      {/* Comparison rows */}
      <div className="space-y-0">
        <p className="overline mb-2 text-ink-light">BASIC INFO</p>
        <CompareRow
          label="Price"
          values={ordered.map((h) => formatPrice(h.price))}
          highlight="lowest-price"
        />
        <CompareRow
          label="Breed"
          values={ordered.map((h) => h.breed)}
        />
        <CompareRow
          label="Gender"
          values={ordered.map((h) =>
            h.gender ? h.gender.charAt(0).toUpperCase() + h.gender.slice(1) : null
          )}
        />
        <CompareRow
          label="Age"
          values={ordered.map((h) => (h.age_years !== null ? `${h.age_years} years` : null))}
        />
        <CompareRow
          label="Height"
          values={ordered.map((h) => formatHeight(h.height_hands))}
        />
        <CompareRow
          label="Location"
          values={ordered.map((h) =>
            h.location_city && h.location_state
              ? `${h.location_city}, ${h.location_state}`
              : h.location_state
          )}
        />

        <div className="h-4" />
        <p className="overline mb-2 text-ink-light">DISCIPLINE & LEVEL</p>
        <CompareRow
          label="Disciplines"
          values={ordered.map((h) =>
            h.disciplines?.length > 0
              ? h.disciplines.map((d) => d.name).join(", ")
              : null
          )}
        />
        <CompareRow
          label="Level"
          values={ordered.map((h) => h.level)}
        />
        <CompareRow
          label="Suitable For"
          values={ordered.map((h) => h.suitable_for)}
        />

        <div className="h-4" />
        <p className="overline mb-2 text-ink-light">DETAILS</p>
        <CompareRow
          label="Temperament"
          values={ordered.map((h) => h.temperament)}
        />
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
        <CompareRow
          label="Listing Score"
          values={ordered.map((h) => String(h.completeness_score))}
          highlight="highest-score"
        />
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
        className="mt-8 grid gap-4"
        style={{ gridTemplateColumns: `160px repeat(${ordered.length}, 1fr)` }}
      >
        <div />
        {ordered.map((horse) => (
          <Button key={horse.id} asChild variant="outline" className="w-full">
            <Link href={`/horses/${horse.slug}`}>View Listing</Link>
          </Button>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="mt-8 text-xs text-ink-light">
        All representations are made by the seller. ManeExchange does not warrant
        listing accuracy. Listing score reflects documentation completeness, not
        horse quality.
      </p>
    </div>
  );
}
