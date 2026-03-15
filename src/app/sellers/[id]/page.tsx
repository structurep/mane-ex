import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StatusBadge } from "@/components/tailwind-plus";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  MessageCircle,
  ChevronRight,
  Store,
} from "lucide-react";
import { ManeScoreBadge } from "@/components/marketplace/mane-score-badge";
import { BadgeShowcase } from "@/components/marketplace/badge-showcase";
import type { SellerScore } from "@/types/scoring";

type Props = {
  params: Promise<{ id: string }>;
};

async function getSellerProfile(id: string) {
  const supabase = await createClient();

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) return null;

  // Fetch active listings
  const { data: listings } = await supabase
    .from("horse_listings")
    .select(
      "id, name, slug, breed, gender, price, height_hands, location_state, completeness_grade, status"
    )
    .eq("seller_id", id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Fetch farm
  const { data: farm } = await supabase
    .from("farms")
    .select("id, name, slug, city, state, disciplines")
    .eq("owner_id", id)
    .single();

  // Fetch seller score
  const { data: sellerScore } = await supabase
    .from("seller_scores")
    .select("*")
    .eq("seller_id", id)
    .single();

  return { profile, listings: listings || [], farm, sellerScore: sellerScore as SellerScore | null };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getSellerProfile(id);

  if (!data) {
    return { title: "Seller Not Found" };
  }

  const name =
    data.profile.display_name || data.profile.full_name || "Seller";

  return {
    title: `${name} — ManeExchange Seller`,
    description: `View ${name}'s horses for sale on ManeExchange. ${data.listings.length} active listing${data.listings.length !== 1 ? "s" : ""}.`,
  };
}

export default async function SellerProfilePage({ params }: Props) {
  const { id } = await params;
  const data = await getSellerProfile(id);

  if (!data) {
    notFound();
  }

  const { profile, listings, farm, sellerScore } = data;

  const displayName =
    profile.display_name || profile.full_name || "Seller";

  const location = [profile.city, profile.state].filter(Boolean).join(", ");

  const memberSince = new Date(profile.created_at).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  return (
    <div className="min-h-screen">
      <Header />

      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1 text-sm text-ink-light">
            <Link href="/browse" className="hover:text-ink-black">
              Browse
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink-mid">{displayName}</span>
          </nav>

          {/* Cover photo */}
          {profile.cover_url && (
            <div className="relative mb-6 h-48 overflow-hidden rounded-[var(--radius-card)] sm:h-56">
              <Image
                src={profile.cover_url}
                alt={`${displayName}'s cover`}
                fill
                sizes="(min-width: 1200px) 1200px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Profile header */}
          <section className={profile.cover_url ? "mb-8 -mt-12 px-4" : "mb-8"}>
            <div className="flex items-start gap-5">
              {/* Avatar */}
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={displayName}
                  width={80}
                  height={80}
                  className="h-20 w-20 flex-shrink-0 rounded-full border-4 border-paper-white object-cover shadow-flat"
                />
              ) : (
                <div className="h-20 w-20 flex-shrink-0 rounded-full bg-paper-warm" />
              )}

              <div className="min-w-0 flex-1">
                <h1 className="font-serif text-3xl font-bold text-ink-black">
                  {displayName}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-mid">
                  {location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Member since {memberSince}
                  </span>
                </div>

                {profile.identity_verified === true && (
                  <StatusBadge variant="forest" dot className="mt-3">
                    Identity Verified
                  </StatusBadge>
                )}

                {/* Mane Score + Badges */}
                {sellerScore && sellerScore.mane_score > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <ManeScoreBadge
                      score={sellerScore.mane_score}
                      grade={sellerScore.grade}
                      variant="compact"
                    />
                    <BadgeShowcase
                      earnedBadges={sellerScore.badges}
                      variant="inline"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Mane Score full card (if score exists) */}
          {sellerScore && sellerScore.mane_score > 0 && (
            <section className="mb-8">
              <ManeScoreBadge
                score={sellerScore.mane_score}
                grade={sellerScore.grade}
                variant="full"
              />
            </section>
          )}

          <Separator className="my-6" />

          {/* Bio */}
          {profile.bio && (
            <section className="mb-8">
              <h2 className="mb-3 font-heading text-lg font-semibold text-ink-black">
                About
              </h2>
              <p className="whitespace-pre-line text-ink-mid">
                {profile.bio}
              </p>
            </section>
          )}

          {/* Farm card */}
          {farm && (
            <section className="mb-8">
              <h2 className="mb-3 font-heading text-lg font-semibold text-ink-black">
                Farm
              </h2>
              <Link
                href={`/farms/${farm.slug}`}
                className="group block rounded-lg border border-crease-light bg-paper-cream p-5 shadow-flat transition-elevation hover-lift hover:shadow-folded"
              >
                <div className="flex items-center gap-3">
                  <Store className="h-5 w-5 text-ink-mid group-hover:text-primary" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-ink-black group-hover:text-primary">
                      {farm.name}
                    </h3>
                    {(farm.city || farm.state) && (
                      <p className="mt-0.5 text-sm text-ink-mid">
                        {[farm.city, farm.state]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-light group-hover:text-primary" />
                </div>
                {farm.disciplines && farm.disciplines.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {farm.disciplines.map((d: string) => (
                      <StatusBadge
                        key={d}
                        variant="blue"
                      >
                        {d}
                      </StatusBadge>
                    ))}
                  </div>
                )}
              </Link>
            </section>
          )}

          <Separator className="my-6" />

          {/* Active listings */}
          <section className="mb-8">
            <h2 className="mb-4 font-heading text-lg font-semibold text-ink-black">
              Active Listings
              {listings.length > 0 && (
                <span className="ml-2 text-sm font-normal text-ink-light">
                  ({listings.length})
                </span>
              )}
            </h2>

            {listings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map(
                  (listing: {
                    id: string;
                    name: string;
                    slug: string;
                    breed: string | null;
                    gender: string | null;
                    price: number | null;
                    height_hands: number | null;
                    location_state: string | null;
                    completeness_grade: string | null;
                    status: string;
                  }) => {
                    const gradeColor =
                      listing.completeness_grade === "excellent"
                        ? "text-navy"
                        : listing.completeness_grade === "good"
                          ? "text-blue"
                          : listing.completeness_grade === "fair"
                            ? "text-gold"
                            : "text-ink-light";

                    return (
                      <Link
                        key={listing.id}
                        href={`/horses/${listing.slug}`}
                        className="group rounded-lg border border-crease-light bg-paper-cream p-4 shadow-flat transition-elevation hover-lift hover:shadow-folded"
                      >
                        {/* Image placeholder */}
                        <div className="mb-3 aspect-[3/2] rounded-md bg-paper-warm" />

                        <h3 className="font-medium text-ink-black group-hover:text-primary">
                          {listing.name}
                        </h3>

                        <p className="mt-0.5 text-sm text-ink-mid">
                          {[listing.breed, listing.location_state]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>

                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-lg font-bold text-ink-black">
                            {listing.price
                              ? `$${(listing.price / 100).toLocaleString()}`
                              : "Contact"}
                          </p>

                          {listing.completeness_grade && (
                            <span
                              className={`text-xs font-medium capitalize ${gradeColor}`}
                            >
                              {listing.completeness_grade}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-crease-light bg-paper-warm px-6 py-10 text-center">
                <p className="text-ink-mid">No active listings</p>
              </div>
            )}
          </section>

          <Separator className="my-6" />

          {/* Contact / INFORM Act section */}
          <section className="mb-8">
            <h2 className="mb-3 font-heading text-lg font-semibold text-ink-black">
              Contact
            </h2>
            <div className="rounded-lg border border-crease-light bg-paper-cream p-5 shadow-flat">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="overline mb-2 text-ink-light">
                    SELLER LOCATION
                  </p>
                  {location ? (
                    <p className="text-sm text-ink-mid">{location}</p>
                  ) : (
                    <p className="text-sm text-ink-light">
                      Location not provided
                    </p>
                  )}
                </div>
                <Button size="lg">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message Seller
                </Button>
              </div>
            </div>
          </section>

          {/* Platform disclaimer */}
          <div className="rounded-md bg-paper-warm p-4 text-xs text-ink-light">
            All representations are made by the seller. ManeExchange does not
            warrant listing accuracy.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
