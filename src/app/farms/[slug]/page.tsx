import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Users,
  Store,
  ChevronRight,
  Phone,
  Mail,
  Globe,
  Instagram,
  Shield,
  ExternalLink,
  Newspaper,
  Lock,
  User,
} from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getFarmData(slug: string) {
  const supabase = await createClient();

  const { data: farm } = await supabase
    .from("farms")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!farm) return null;

  const [{ data: listings }, { data: staff }, { data: owner }] =
    await Promise.all([
      supabase
        .from("horse_listings")
        .select(
          "id, name, slug, breed, gender, price, height_hands, location_state, completeness_grade"
        )
        .eq("farm_id", farm.id)
        .eq("status", "active")
        .order("created_at", { ascending: false }),
      supabase
        .from("farm_staff")
        .select(
          "id, role, title, user_id, profiles:user_id(display_name, avatar_url)"
        )
        .eq("farm_id", farm.id),
      supabase
        .from("profiles")
        .select(
          "id, display_name, full_name, avatar_url, identity_verified"
        )
        .eq("id", farm.owner_id)
        .single(),
    ]);

  // Check if current user is a member (for feed preview)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isMember = false;
  let recentPosts: Record<string, unknown>[] = [];

  if (user) {
    isMember =
      farm.owner_id === user.id ||
      (staff || []).some((s: { user_id: string }) => s.user_id === user.id);

    if (isMember) {
      const { data: posts } = await supabase
        .from("barn_posts")
        .select(
          "id, body, type, created_at, author:profiles!barn_posts_author_id_fkey(display_name, avatar_url)"
        )
        .eq("farm_id", farm.id)
        .order("created_at", { ascending: false })
        .limit(3);
      recentPosts = posts ?? [];
    }
  }

  return {
    farm,
    listings: listings || [],
    staff: staff || [],
    owner,
    isMember,
    recentPosts,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getFarmData(slug);

  if (!result) {
    return { title: "Barn Not Found" };
  }

  const { farm, listings } = result;
  const location = [farm.city, farm.state].filter(Boolean).join(", ");
  const listingCount = listings.length;
  const description = [
    farm.name,
    location ? `located in ${location}` : null,
    listingCount > 0
      ? `${listingCount} horse${listingCount === 1 ? "" : "s"} for sale`
      : null,
  ]
    .filter(Boolean)
    .join(" — ");

  return {
    title: `${farm.name} — ManeExchange`,
    description: `${description}. Browse listings, learn about the farm, and connect on ManeExchange.`,
    openGraph: {
      title: `${farm.name} — ManeExchange`,
      description,
      type: "website",
    },
  };
}

export default async function FarmPage({ params }: Props) {
  const { slug } = await params;
  const result = await getFarmData(slug);

  if (!result) {
    notFound();
  }

  const { farm, listings, staff, owner, isMember, recentPosts } = result;

  const location = [farm.city, farm.state].filter(Boolean).join(", ");
  const hasContact =
    farm.phone || farm.email || farm.website_url || farm.instagram_handle;
  const hasDetails =
    (farm.disciplines && farm.disciplines.length > 0) ||
    farm.year_established ||
    farm.number_of_stalls;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1 text-sm text-ink-light">
            <Link href="/browse" className="hover:text-ink-black">
              Browse
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/browse?view=farms" className="hover:text-ink-black">
              Barns
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink-mid">{farm.name}</span>
          </nav>

          {/* Cover image */}
          <div className="relative mb-6 aspect-[3/1] overflow-hidden rounded-lg bg-paper-warm">
            {farm.cover_url && (
              <Image
                src={farm.cover_url}
                alt={`${farm.name} cover`}
                fill
                sizes="(min-width: 1200px) 1200px, 100vw"
                className="object-cover"
                priority
              />
            )}
          </div>

          {/* Farm header */}
          <div className="-mt-14 mb-8 px-4 md:px-6">
            <div className="flex items-end gap-4">
              {/* Logo */}
              {farm.logo_url ? (
                <Image
                  src={farm.logo_url}
                  alt={`${farm.name} logo`}
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-lg border-2 border-paper-white object-cover shadow-flat"
                />
              ) : (
                <div className="h-16 w-16 shrink-0 rounded-lg border-2 border-paper-white bg-paper-warm shadow-flat" />
              )}
              <div className="pb-1">
                <h1 className="font-serif text-3xl font-bold text-ink-black">
                  {farm.name}
                </h1>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-mid">
              {location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {location}
                </span>
              )}
              {farm.year_established && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Est. {farm.year_established}
                </span>
              )}
              {farm.number_of_stalls && (
                <span className="flex items-center gap-1.5">
                  <Store className="h-4 w-4" />
                  {farm.number_of_stalls} stalls
                </span>
              )}
            </div>

            {/* Disciplines */}
            {farm.disciplines && farm.disciplines.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {farm.disciplines.map((discipline: string) => (
                  <Badge key={discipline} variant="secondary">
                    {discipline}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Description */}
          {farm.description && (
            <section className="mb-8">
              <h2 className="mb-3 font-heading text-lg font-semibold text-ink-black">
                About {farm.name}
              </h2>
              <p className="whitespace-pre-line text-ink-mid">
                {farm.description}
              </p>
            </section>
          )}

          {/* Farm info grid */}
          {(hasContact || hasDetails) && (
            <div className="mb-8 grid gap-6 md:grid-cols-2">
              {/* Contact info */}
              {hasContact && (
                <div className="rounded-lg border-0 bg-paper-cream p-6 shadow-flat">
                  <p className="overline mb-4 text-ink-light">CONTACT</p>
                  <div className="space-y-3">
                    {farm.phone && (
                      <div className="flex items-center gap-3 text-sm text-ink-mid">
                        <Phone className="h-4 w-4 shrink-0 text-ink-light" />
                        <span>{farm.phone}</span>
                      </div>
                    )}
                    {farm.email && (
                      <div className="flex items-center gap-3 text-sm text-ink-mid">
                        <Mail className="h-4 w-4 shrink-0 text-ink-light" />
                        <a
                          href={`mailto:${farm.email}`}
                          className="text-blue hover:underline"
                        >
                          {farm.email}
                        </a>
                      </div>
                    )}
                    {farm.website_url && (
                      <div className="flex items-center gap-3 text-sm text-ink-mid">
                        <Globe className="h-4 w-4 shrink-0 text-ink-light" />
                        <a
                          href={farm.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue hover:underline"
                        >
                          {farm.website_url.replace(/^https?:\/\//, "")}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {farm.instagram_handle && (
                      <div className="flex items-center gap-3 text-sm text-ink-mid">
                        <Instagram className="h-4 w-4 shrink-0 text-ink-light" />
                        <a
                          href={`https://instagram.com/${farm.instagram_handle.replace(/^@/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue hover:underline"
                        >
                          @{farm.instagram_handle.replace(/^@/, "")}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Details */}
              {hasDetails && (
                <div className="rounded-lg border-0 bg-paper-cream p-6 shadow-flat">
                  <p className="overline mb-4 text-ink-light">DETAILS</p>
                  <div className="space-y-3">
                    {farm.disciplines && farm.disciplines.length > 0 && (
                      <div className="text-sm">
                        <p className="font-medium text-ink-black">
                          Disciplines
                        </p>
                        <p className="mt-0.5 text-ink-mid">
                          {farm.disciplines.join(", ")}
                        </p>
                      </div>
                    )}
                    {farm.year_established && (
                      <div className="text-sm">
                        <p className="font-medium text-ink-black">
                          Year Established
                        </p>
                        <p className="mt-0.5 text-ink-mid">
                          {farm.year_established}
                        </p>
                      </div>
                    )}
                    {farm.number_of_stalls && (
                      <div className="text-sm">
                        <p className="font-medium text-ink-black">
                          Number of Stalls
                        </p>
                        <p className="mt-0.5 text-ink-mid">
                          {farm.number_of_stalls}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator className="my-6" />

          {/* Owner section */}
          {owner && (
            <section className="mb-8">
              <p className="overline mb-4 text-ink-light">FARM OWNER</p>
              <Link
                href={`/sellers/${owner.id}`}
                className="inline-flex items-center gap-4 rounded-lg border-0 bg-paper-cream p-4 shadow-flat transition-shadow hover:shadow-folded"
              >
                {owner.avatar_url ? (
                  <Image
                    src={owner.avatar_url}
                    alt={owner.display_name || "Owner"}
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-full bg-paper-warm" />
                )}
                <div>
                  <p className="text-sm font-medium text-ink-black">
                    {owner.display_name || owner.full_name || "Barn Owner"}
                  </p>
                  <p className="text-xs text-ink-light">Barn Owner</p>
                  {owner.identity_verified === true && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      <Shield className="mr-1 h-3 w-3" />
                      Identity Verified
                    </Badge>
                  )}
                </div>
                <ChevronRight className="ml-2 h-4 w-4 text-ink-light" />
              </Link>
            </section>
          )}

          {/* Staff section */}
          {staff.length > 0 && (
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-ink-light" />
                <h2 className="font-heading text-lg font-semibold text-ink-black">
                  Team
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {staff.map(
                  (member: {
                    id: string;
                    role: string;
                    title: string | null;
                    user_id: string;
                    profiles: {
                      display_name: string | null;
                      avatar_url: string | null;
                    }[];
                  }) => {
                    const profile = member.profiles?.[0];
                    return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-lg border-0 bg-paper-cream p-4 shadow-flat"
                    >
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt={profile.display_name || "Member"}
                          width={40}
                          height={40}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 shrink-0 rounded-full bg-paper-warm" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-ink-black">
                          {profile?.display_name || "Team Member"}
                        </p>
                        <p className="text-xs capitalize text-ink-light">
                          {member.title || member.role}
                        </p>
                      </div>
                    </div>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {/* Barn Feed Preview */}
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-ink-light" />
              <h2 className="font-heading text-lg font-semibold text-ink-black">
                Barn Feed
              </h2>
            </div>

            {isMember && recentPosts.length > 0 ? (
              <div className="space-y-3">
                {recentPosts.map((post) => {
                  const postAuthor = post.author as {
                    display_name: string | null;
                    avatar_url: string | null;
                  } | null;
                  return (
                    <div
                      key={post.id as string}
                      className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat"
                    >
                      <div className="flex items-center gap-2.5">
                        {postAuthor?.avatar_url ? (
                          <Image
                            src={postAuthor.avatar_url}
                            alt=""
                            width={28}
                            height={28}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-paper-warm">
                            <User className="h-3.5 w-3.5 text-ink-light" />
                          </div>
                        )}
                        <span className="text-xs font-medium text-ink-black">
                          {postAuthor?.display_name ?? "Member"}
                        </span>
                        <span className="text-xs text-ink-light">
                          {new Date(
                            post.created_at as string
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-ink-mid line-clamp-2">
                        {post.body as string}
                      </p>
                    </div>
                  );
                })}
                <Link
                  href="/dashboard/farm/feed"
                  className="block text-center text-sm font-medium text-primary hover:underline"
                >
                  View all posts
                </Link>
              </div>
            ) : (
              <div className="rounded-lg border-0 bg-paper-cream p-6 text-center shadow-flat">
                <Lock className="mx-auto mb-2 h-5 w-5 text-ink-light" />
                <p className="text-sm text-ink-mid">
                  The barn feed is available to team members.
                </p>
              </div>
            )}
          </section>

          <Separator className="my-6" />

          {/* Horses for sale */}
          <section className="mb-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold text-ink-black">
                Horses for Sale
              </h2>
              {listings.length > 0 && (
                <p className="text-sm text-ink-light">
                  {listings.length} listing
                  {listings.length === 1 ? "" : "s"}
                </p>
              )}
            </div>

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
                  }) => {
                    const priceStr = listing.price
                      ? `$${(listing.price / 100).toLocaleString()}`
                      : "Contact for price";

                    return (
                      <Link
                        key={listing.id}
                        href={`/horses/${listing.slug}`}
                        className="group rounded-lg border-0 bg-paper-cream shadow-flat transition-shadow hover:shadow-folded"
                      >
                        {/* Image placeholder */}
                        <div className="aspect-[3/2] rounded-t-lg bg-paper-warm" />

                        <div className="p-4">
                          <h3 className="font-heading text-base font-semibold text-ink-black group-hover:text-primary">
                            {listing.name}
                          </h3>
                          <p className="mt-0.5 text-sm text-ink-mid">
                            {[listing.breed, listing.gender]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>

                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-base font-bold text-ink-black">
                              {priceStr}
                            </p>
                            {listing.location_state && (
                              <span className="flex items-center gap-1 text-xs text-ink-light">
                                <MapPin className="h-3 w-3" />
                                {listing.location_state}
                              </span>
                            )}
                          </div>

                          {listing.height_hands && (
                            <p className="mt-1 text-xs text-ink-light">
                              {listing.height_hands}hh
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="rounded-lg border-0 bg-paper-warm p-12 text-center">
                <Store className="mx-auto mb-3 h-8 w-8 text-ink-light" />
                <p className="text-sm font-medium text-ink-mid">
                  No horses currently listed
                </p>
                <p className="mt-1 text-xs text-ink-light">
                  Check back soon for new listings from {farm.name}.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
