import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileCTA } from "./mobile-cta";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import type { HorseListing } from "@/types/listings";
import type { SellerScore } from "@/types/scoring";
import Image from "next/image";
import { ListingGallery } from "@/components/listing-gallery";
import { ListingTabs, type ListingTabsData } from "./listing-tabs";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

async function getListing(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("horse_listings")
    .select(
      `
      *,
      seller:profiles!seller_id(id, display_name, full_name, avatar_url, seller_tier, identity_verified),
      media:listing_media(id, url, alt_text, caption, sort_order, is_primary, type),
      registry_records:listing_registry_records(id, registry, registry_number, registered_name, status, verified_at)
`
    )
    .eq("slug", slug)
    .in("status", ["active", "under_offer", "sold"])
    .single();

  if (error || !data) return null;

  // Fetch seller's Mane Score
  const { data: sellerScore } = await supabase
    .from("seller_scores")
    .select("mane_score, grade, badges")
    .eq("seller_id", data.seller.id)
    .single();

  // Fetch other active listings by the same seller (for "Other Horses" section)
  const { data: otherListings } = await supabase
    .from("horse_listings")
    .select("id, name, slug, price, media:listing_media(url, is_primary)")
    .eq("seller_id", data.seller.id)
    .eq("status", "active")
    .neq("id", data.id)
    .order("completeness_score", { ascending: false })
    .limit(3);

  return {
    ...data,
    seller_score: sellerScore as Pick<SellerScore, "mane_score" | "grade" | "badges"> | null,
    other_listings: (otherListings ?? []) as Array<{
      id: string;
      name: string;
      slug: string;
      price: number | null;
      media: Array<{ url: string; is_primary: boolean }>;
    }>,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);

  if (!listing) {
    return { title: "Horse Not Found" };
  }

  const l = listing as unknown as HorseListing;
  const priceStr = l.price
    ? `$${(l.price / 100).toLocaleString()}`
    : "Contact for price";
  const description = [
    l.breed,
    l.gender,
    l.height_hands ? `${l.height_hands}hh` : null,
    l.age_years ? `${l.age_years}yo` : null,
    l.location_state,
    priceStr,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    title: l.name,
    description: `${l.name} — ${description}. Documentation, veterinary records, and show history on ManeExchange.`,
    openGraph: {
      title: `${l.name} — ${priceStr}`,
      description,
      type: "website",
    },
  };
}

export default async function ListingDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const listing = await getListing(slug);

  if (!listing) {
    notFound();
  }

  const l = listing as unknown as HorseListing & {
    seller: { id: string; display_name: string; full_name: string; avatar_url: string | null; seller_tier: string; identity_verified: boolean };
    media: { id: string; url: string; alt_text: string | null; caption: string | null; sort_order: number; is_primary: boolean; type: "photo" | "video" }[];
    seller_score: Pick<SellerScore, "mane_score" | "grade" | "badges"> | null;
  };

  const priceStr = l.price
    ? `$${(l.price / 100).toLocaleString()}`
    : "Contact for price";

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: l.name,
    description: l.show_record || l.training_history || `${l.breed || "Horse"} for sale on ManeExchange`,
    image: l.media?.filter((m: { is_primary: boolean }) => m.is_primary).map((m: { url: string }) => m.url) || [],
    brand: l.breed ? { "@type": "Brand", name: l.breed } : undefined,
    offers: l.price
      ? {
          "@type": "Offer",
          priceCurrency: "USD",
          price: (l.price / 100).toFixed(2),
          availability:
            l.status === "active"
              ? "https://schema.org/InStock"
              : l.status === "sold"
                ? "https://schema.org/SoldOut"
                : "https://schema.org/LimitedAvailability",
          seller: {
            "@type": "Organization",
            name: l.seller?.display_name || "ManeExchange Seller",
          },
        }
      : undefined,
    additionalProperty: [
      l.height_hands && { "@type": "PropertyValue", name: "Height", value: `${l.height_hands} hands` },
      l.age_years && { "@type": "PropertyValue", name: "Age", value: `${l.age_years} years` },
      l.gender && { "@type": "PropertyValue", name: "Gender", value: l.gender },
      l.color && { "@type": "PropertyValue", name: "Color", value: l.color },
      l.location_state && { "@type": "PropertyValue", name: "Location", value: l.location_state },
    ].filter(Boolean),
  };

  // Hero image rendered as Server Component (outside client hydration boundary)
  const sortedMedia = [...(l.media || [])].sort((a, b) => {
    if (a.type === "photo" && b.type !== "photo") return -1;
    if (a.type !== "photo" && b.type === "photo") return 1;
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.sort_order - b.sort_order;
  });
  const heroPhoto = sortedMedia.find((m) => m.type === "photo");
  const heroImage = heroPhoto ? (
    <Image
      src={heroPhoto.url}
      alt={heroPhoto.alt_text || "Listing photo"}
      fill
      sizes="(max-width: 1024px) 100vw, 66vw"
      priority
      fetchPriority="high"
      quality={60}
      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
    />
  ) : null;

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/browse">Browse</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {l.breed && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/browse?breed=${encodeURIComponent(l.breed)}`}>
                      {l.breed}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage>{l.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Gallery — always visible above tabs */}
          <div className="mb-2 lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <ListingGallery media={l.media || []} heroImage={heroImage} />
            </div>
            {/* Empty spacer to align with sidebar grid */}
            <div className="hidden lg:block" />
          </div>

          {/* Tabbed layout + sidebar */}
          <ListingTabs listing={l as unknown as ListingTabsData} defaultTab={tab} />
        </div>
      </main>

      {/* Mobile sticky CTA */}
      <MobileCTA
        listingId={l.id}
        listingName={l.name}
        sellerId={l.seller_id}
        sellerName={l.seller?.display_name || "Seller"}
        price={l.price}
        completenessScore={l.completeness_score}
        status={l.status}
      />

      <Footer />
    </div>
  );
}
