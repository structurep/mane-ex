"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  MapPin,
  Calendar,
  Ruler,
  Award,
  Heart,
  Share2,
  MessageCircle,
  Shield,
  Clock,
  Eye,
  BarChart3,
  TrendingUp,
  CalendarCheck,
  FileText,
  ChevronRight,
  Home,
  DollarSign,
  Palette,
  Truck,
  ShieldCheck,
  Star,
  ExternalLink,
  User,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import type { HorseListing } from "@/types/listings";
import type { SellerScore } from "@/types/scoring";
import { OfferModal } from "@/components/offers/offer-modal";
import { MessageSellerModal } from "@/components/messaging/message-seller-modal";
import { ListingGallery } from "@/components/marketplace/listing-gallery";
import { HennekeScoreDisplay } from "@/components/marketplace/henneke-score";
import { RegistryBadges, type RegistryRecord, type RegistryType } from "@/components/marketplace/registry-lookup";
import type { ListingRegistryRecord } from "@/types/listings";

type MediaItem = {
  id: string;
  url: string;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
  is_primary: boolean;
  type: "photo" | "video";
};

type SellerInfo = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  seller_tier: string;
  identity_verified: boolean;
};

type SellerScoreInfo = Pick<SellerScore, "mane_score" | "grade" | "badges"> | null;

type OtherListing = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  media: Array<{ url: string; is_primary: boolean }>;
};

export type ListingTabsData = HorseListing & {
  seller: SellerInfo;
  media: MediaItem[];
  seller_score: SellerScoreInfo;
  registry_records?: ListingRegistryRecord[];
  other_listings?: OtherListing[];
};

function mapDbToRegistryRecord(r: ListingRegistryRecord): RegistryRecord {
  return {
    registry: r.registry.toLowerCase() as RegistryType,
    registrationNumber: r.registry_number || "",
    registeredName: r.registered_name || undefined,
    verificationStatus: r.status === "verified" ? "verified" : r.status === "pending" ? "pending" : "unverified",
    verifiedAt: r.verified_at || undefined,
  };
}

function daysSincePublished(dateStr: string): number {
  return Math.max(1, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000));
}

function getCompletenessColor(grade: string | null) {
  switch (grade) {
    case "excellent":
      return "text-forest";
    case "good":
      return "text-blue";
    case "fair":
      return "text-gold";
    default:
      return "text-ink-light";
  }
}

export function ListingTabs({ listing, defaultTab = "overview" }: { listing: ListingTabsData; defaultTab?: string }) {
  const l = listing;

  const priceStr = l.price
    ? `$${(l.price / 100).toLocaleString()}`
    : "Contact for price";

  const completenessColor = getCompletenessColor(l.completeness_grade);
  const daysOnMarket = l.published_at ? daysSincePublished(l.published_at) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Left column — tabs */}
      <div className="lg:col-span-2">
        {/* Title & quick stats — always visible above tabs */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-ink-black md:text-5xl">{l.name}</h1>
              <p className="mt-1 text-ink-mid">
                {[l.breed, l.color, l.gender].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" aria-label="Save to Dream Barn">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Share listing">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick stats bar */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-mid">
            {l.age_years != null && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {l.age_years} years old
              </span>
            )}
            {l.height_hands && (
              <span className="flex items-center gap-1.5">
                <Ruler className="h-4 w-4" />
                {l.height_hands}hh
              </span>
            )}
            {l.location_state && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {l.location_city
                  ? `${l.location_city}, ${l.location_state}`
                  : l.location_state}
              </span>
            )}
            {l.level && (
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                {l.level}
              </span>
            )}
          </div>

          {/* Social proof + days on market */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-light">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {l.view_count} views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {l.favorite_count} saves
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {daysOnMarket !== null
                ? `${daysOnMarket} days on market`
                : "Listed recently"}
            </span>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Tabbed content — 5 consolidated tabs */}
        <Tabs defaultValue={defaultTab === "overview" ? "basics" : defaultTab === "lifestyle" ? "basics" : defaultTab === "pricing" ? "seller" : defaultTab} className="w-full">
          <TabsList
            variant="line"
            className="w-full flex-wrap justify-start gap-0 border-b border-border pb-0"
          >
            <TabsTrigger value="basics" className="text-sm">
              Basics
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-sm">
              Performance
            </TabsTrigger>
            <TabsTrigger value="health" className="text-sm">
              Health &amp; Docs
            </TabsTrigger>
            <TabsTrigger value="media" className="text-sm">
              Media
            </TabsTrigger>
            <TabsTrigger value="seller" className="text-sm">
              Seller &amp; Logistics
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Basics (+ Lifestyle merged) ─── */}
          <TabsContent value="basics" className="mt-6 bg-paper-white">
            <div className="space-y-8">
              {/* Seller quote */}
              {l.temperament && (
                <div className="rounded-lg border border-crease-light bg-white p-5">
                  <div className="border-l-[3px] border-coral pl-4">
                    <p className="italic text-ink-mid leading-relaxed">
                      &ldquo;{l.temperament}&rdquo;
                    </p>
                    <p className="mt-2 text-xs font-medium text-ink-light">
                      — {l.seller?.display_name || l.seller?.full_name || "Seller"}
                    </p>
                  </div>
                </div>
              )}

              {/* IN A WORD / BEST FOR cards */}
              {(l.temperament || l.suitable_for) && (
                <div className="grid grid-cols-2 gap-3">
                  {l.temperament && (
                    <div className="rounded-lg bg-paper-warm px-4 py-3">
                      <p className="overline text-[11px] tracking-widest text-ink-light">IN A WORD</p>
                      <p className="mt-1 text-sm font-semibold text-ink-black">
                        {l.temperament.split(/[.,!?\n]/)[0]?.trim().split(/\s+/).slice(0, 4).join(" ") || "Talented"}
                      </p>
                    </div>
                  )}
                  {l.suitable_for && (
                    <div className="rounded-lg bg-paper-warm px-4 py-3">
                      <p className="overline text-[11px] tracking-widest text-ink-light">BEST FOR</p>
                      <p className="mt-1 text-sm font-semibold text-ink-black">{l.suitable_for}</p>
                    </div>
                  )}
                </div>
              )}

              {/* DETAILS section (barn name removed — lives in Seller tab) */}
              <section>
                <p className="overline mb-4 text-[11px] tracking-widest text-ink-light">DETAILS</p>
                <div className="space-y-0 divide-y divide-crease-light">
                  {l.age_years != null && (
                    <IconDetailRow
                      icon={Calendar}
                      label="Age / YOB"
                      value={`${l.age_years} years`}
                    />
                  )}
                  {l.breed && (
                    <IconDetailRow icon={Award} label="Breed" value={l.breed} />
                  )}
                  {l.gender && (
                    <IconDetailRow
                      icon={Heart}
                      label="Sex"
                      value={l.gender.charAt(0).toUpperCase() + l.gender.slice(1)}
                    />
                  )}
                  {l.color && (
                    <IconDetailRow icon={Palette} label="Color" value={l.color} />
                  )}
                  {l.height_hands && (
                    <IconDetailRow icon={Ruler} label="Height" value={`${l.height_hands}hh`} />
                  )}
                  {l.location_state && (
                    <IconDetailRow
                      icon={MapPin}
                      label="Location"
                      value={l.location_city ? `${l.location_city}, ${l.location_state}` : l.location_state}
                    />
                  )}
                  {l.registered_name && (
                    <IconDetailRow icon={FileText} label="Registered Name" value={l.registered_name} />
                  )}
                  {l.registry && (
                    <IconDetailRow icon={FileText} label="Registry" value={l.registry} />
                  )}
                  {l.sire && (
                    <IconDetailRow icon={Award} label="Sire" value={l.sire} />
                  )}
                  {l.dam && (
                    <IconDetailRow icon={Award} label="Dam" value={l.dam} />
                  )}
                </div>
                {l.registry_records && l.registry_records.length > 0 && (
                  <div className="mt-3">
                    <RegistryBadges records={l.registry_records.map(mapDbToRegistryRecord)} />
                  </div>
                )}
              </section>

              {/* PRICING section */}
              <section>
                <p className="overline mb-4 text-[11px] tracking-widest text-ink-light">PRICING</p>
                <div className="divide-y divide-crease-light">
                  <IconDetailRow
                    icon={DollarSign}
                    label="Asking Price"
                    value={priceStr}
                    bold
                  />
                  {l.price_negotiable && (
                    <IconDetailRow icon={TrendingUp} label="Negotiable" value="Yes" />
                  )}
                </div>
              </section>

              {/* Reason for sale */}
              {l.reason_for_sale && (
                <section>
                  <p className="overline mb-3 text-[11px] tracking-widest text-ink-light">REASON FOR SALE</p>
                  <p className="text-sm text-ink-mid">{l.reason_for_sale}</p>
                </section>
              )}

              {/* ── Lifestyle (merged from former tab) ── */}

              {/* Behavior & temperament */}
              {(l.vices || l.good_with) && (
                <section>
                  <p className="overline mb-4 text-[11px] tracking-widest text-ink-light">BEHAVIOR</p>
                  <div className="space-y-3">
                    {l.vices && <DetailRow label="Known Vices" value={l.vices} />}
                    {l.good_with && <DetailRow label="Good With" value={l.good_with} />}
                  </div>
                </section>
              )}

              {/* Daily Life — only show populated fields */}
              {(l.current_rider ||
                l.current_trainer ||
                l.turnout_schedule ||
                l.feeding_program ||
                l.shoeing_schedule ||
                l.supplements) && (
                <section>
                  <p className="overline mb-4 text-[11px] tracking-widest text-ink-light">DAILY LIFE</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {l.current_rider && (
                      <QuickFact label="Current Rider" value={l.current_rider} />
                    )}
                    {l.current_trainer && (
                      <QuickFact label="Current Trainer" value={l.current_trainer} />
                    )}
                    {l.turnout_schedule && (
                      <QuickFact label="Turnout" value={l.turnout_schedule} />
                    )}
                    {l.feeding_program && (
                      <QuickFact label="Feeding Program" value={l.feeding_program} />
                    )}
                    {l.shoeing_schedule && (
                      <QuickFact label="Shoeing Schedule" value={l.shoeing_schedule} />
                    )}
                    {l.supplements && (
                      <QuickFact label="Supplements" value={l.supplements} />
                    )}
                  </div>
                </section>
              )}

              {/* Ownership history */}
              {(l.years_with_current_owner != null || l.number_of_previous_owners != null) && (
                <section>
                  <p className="overline mb-4 text-[11px] tracking-widest text-ink-light">OWNERSHIP HISTORY</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {l.years_with_current_owner != null && (
                      <QuickFact
                        label="Years with Current Owner"
                        value={`${l.years_with_current_owner} year${l.years_with_current_owner !== 1 ? "s" : ""}`}
                      />
                    )}
                    {l.number_of_previous_owners != null && (
                      <QuickFact
                        label="Previous Owners"
                        value={String(l.number_of_previous_owners)}
                      />
                    )}
                  </div>
                </section>
              )}

              {/* Digital Passport link */}
              <section>
                <Link
                  href={`/horses/${l.slug}/passport`}
                  className="group flex items-center gap-3 rounded-lg border border-crease-light bg-paper-cream px-5 py-4 transition-elevation hover-lift shadow-flat hover:shadow-folded"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-warm text-ink-mid group-hover:text-primary">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-dark group-hover:text-primary">
                      View Digital Passport
                    </p>
                    <p className="text-xs text-ink-light">
                      Identity, pedigree, health timeline, and show history
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-light group-hover:text-primary" />
                </Link>
              </section>

              {/* Platform disclaimer */}
              <div className="rounded-md bg-paper-warm p-4 text-xs text-ink-light">
                All representations are made by the seller. ManeExchange does
                not warrant listing accuracy. Mane Score reflects listing
                completeness and documentation, not the quality, soundness, or
                value of any horse.
              </div>
            </div>
          </TabsContent>

          {/* ─── Tab 2: Performance ─── */}
          <TabsContent value="performance" className="mt-6 bg-paper-white">
            <div className="space-y-8">
              {l.show_experience ? (
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-ink-black">
                    Show Experience
                  </h2>
                  <p className="whitespace-pre-line text-ink-mid">
                    {l.show_experience}
                  </p>
                  {l.show_record && (
                    <div className="mt-3 rounded-md bg-paper-warm p-4">
                      <p className="overline mb-2 text-[11px] tracking-widest text-ink-light">
                        SHOW RECORD
                      </p>
                      <p className="whitespace-pre-line text-sm text-ink-mid">
                        {l.show_record}
                      </p>
                    </div>
                  )}
                </section>
              ) : (
                <EmptyTabMessage message="No show experience listed for this horse." />
              )}

              {l.competition_divisions && (
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-ink-black">
                    Competition Divisions
                  </h2>
                  <p className="text-ink-mid">{l.competition_divisions}</p>
                </section>
              )}

              {l.level && (
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-ink-black">
                    Level
                  </h2>
                  <p className="text-ink-mid">{l.level}</p>
                </section>
              )}

              {l.training_history && (
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-ink-black">
                    Training History
                  </h2>
                  <p className="whitespace-pre-line text-ink-mid">
                    {l.training_history}
                  </p>
                </section>
              )}

              {/* Registration numbers */}
              {(l.usef_number || l.usdf_number || l.fei_id) && (
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-ink-black">
                    Competition IDs
                  </h2>
                  <div className="space-y-2">
                    {l.usef_number && (
                      <p className="text-sm text-ink-mid">
                        <span className="font-medium text-ink-dark">USEF:</span>{" "}
                        {l.usef_number}
                      </p>
                    )}
                    {l.usdf_number && (
                      <p className="text-sm text-ink-mid">
                        <span className="font-medium text-ink-dark">USDF:</span>{" "}
                        {l.usdf_number}
                      </p>
                    )}
                    {l.fei_id && (
                      <p className="text-sm text-ink-mid">
                        <span className="font-medium text-ink-dark">FEI:</span>{" "}
                        {l.fei_id}
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>
          </TabsContent>

          {/* ─── Tab 3: Health & Docs ─── */}
          <TabsContent value="health" className="mt-6 bg-paper-white">
            <div className="space-y-8">
              {(l.vet_name ||
                l.coggins_date ||
                l.known_health_issues ||
                l.lameness_history ||
                l.surgical_history ||
                l.allergies ||
                l.medications ||
                l.recent_medical_treatments ||
                l.vaccination_status ||
                l.dental_date ||
                l.last_vet_check) ? (
                <section>
                  <h2 className="mb-4 text-lg font-semibold text-ink-black">
                    Veterinary Information
                  </h2>

                  {/* Henneke BCS + Soundness badges */}
                  {(() => {
                    const ext = l as unknown as Record<string, unknown>;
                    const henneke = ext.henneke_score as number | null;
                    const soundness = ext.soundness_level as string | null;
                    if (!henneke && !soundness) return null;
                    return (
                      <div className="mb-4 flex flex-wrap gap-3">
                        {henneke != null && (
                          <HennekeScoreDisplay score={henneke} />
                        )}
                        {soundness && (
                          <div className="rounded-lg border border-crease-light bg-paper-cream p-3">
                            <p className="text-xs text-ink-light">Soundness</p>
                            <p className="text-sm font-medium text-ink-black">
                              {soundness === "vet_confirmed_sound"
                                ? "Vet-confirmed sound"
                                : soundness === "minor_findings"
                                  ? "Minor findings (described)"
                                  : soundness === "managed_condition"
                                    ? "Managed condition"
                                    : "Not recently assessed"}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="space-y-3">
                    {l.vet_name && (
                      <DetailRow label="Veterinarian" value={l.vet_name} />
                    )}
                    {l.vet_phone && (
                      <DetailRow label="Vet Phone" value={l.vet_phone} />
                    )}
                    {l.coggins_date && (
                      <DetailRow
                        label="Coggins"
                        value={new Date(l.coggins_date).toLocaleDateString()}
                      />
                    )}
                    {l.coggins_expiry && (
                      <DetailRow
                        label="Coggins Expiry"
                        value={new Date(l.coggins_expiry).toLocaleDateString()}
                      />
                    )}
                    {l.last_vet_check && (
                      <DetailRow
                        label="Last Vet Check"
                        value={new Date(l.last_vet_check).toLocaleDateString()}
                      />
                    )}
                    {l.vaccination_status && (
                      <DetailRow label="Vaccinations" value={l.vaccination_status} />
                    )}
                    {l.dental_date && (
                      <DetailRow
                        label="Last Dental"
                        value={new Date(l.dental_date).toLocaleDateString()}
                      />
                    )}
                    {l.known_health_issues && (
                      <DetailRow label="Known Health Issues" value={l.known_health_issues} />
                    )}
                    {l.lameness_history && (
                      <DetailRow label="Lameness History" value={l.lameness_history} />
                    )}
                    {l.surgical_history && (
                      <DetailRow label="Surgical History" value={l.surgical_history} />
                    )}
                    {l.allergies && (
                      <DetailRow label="Allergies" value={l.allergies} />
                    )}
                    {l.medications && (
                      <DetailRow label="Current Medications" value={l.medications} />
                    )}
                    {l.recent_medical_treatments && (
                      <DetailRow
                        label="Recent Treatments"
                        value={l.recent_medical_treatments}
                      />
                    )}
                  </div>
                </section>
              ) : (
                <EmptyTabMessage message="No veterinary information listed for this horse." />
              )}

              {/* Warranty */}
              <section>
                <h2 className="mb-3 text-lg font-semibold text-ink-black">
                  Warranty
                </h2>
                <div className="rounded-md border border-border bg-paper-warm p-4">
                  <p className="text-sm font-bold uppercase tracking-wide text-ink-black">
                    {l.warranty === "as_is"
                      ? "SOLD AS IS"
                      : l.warranty === "sound_at_sale"
                        ? "SOUND AT TIME OF SALE"
                        : "SOUND FOR INTENDED USE"}
                  </p>
                  {l.warranty === "as_is" && (
                    <p className="mt-1 text-xs text-ink-mid">
                      This horse is sold without any warranties, express or
                      implied. Buyer assumes all risk.
                    </p>
                  )}
                </div>
              </section>

              {/* Document disclaimer */}
              <div className="rounded-md bg-paper-warm p-4 text-xs text-ink-light">
                Documents provided by seller. ManeExchange has not
                independently verified accuracy, completeness, or
                authenticity. A pre-purchase exam (PPE) by your own
                veterinarian is strongly recommended before any purchase.
              </div>
            </div>
          </TabsContent>

          {/* ─── Tab 5: Media ─── */}
          <TabsContent value="media" className="mt-6 bg-paper-white">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-ink-black">
                Photos &amp; Videos
              </h2>
              <ListingGallery media={l.media || []} />
            </div>
          </TabsContent>

          {/* ─── Tab 5: Seller & Logistics (merged Seller/Barn + Estimates) ─── */}
          <TabsContent value="seller" className="mt-6 bg-paper-white">
            <div className="space-y-10">
              <SellerBarnTab listing={l} />
              <Separator />
              <EstimatesTab listing={l} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right column — price card (sticky, desktop only) */}
      <div className="hidden lg:col-span-1 lg:block">
        <div className="sticky top-20 space-y-4">
          {/* Price card */}
          <div className="rounded-lg border border-border bg-paper-cream p-6 shadow-folded">
            <p className="font-serif text-4xl font-bold tracking-tight text-ink-black">{priceStr}</p>
            {l.price_negotiable && (
              <p className="mt-1 text-xs text-ink-light">
                Price negotiable
              </p>
            )}

            <div className="mt-4 space-y-2">
              <MessageSellerModal
                sellerId={l.seller_id}
                sellerName={l.seller?.display_name || "Seller"}
                listingId={l.id}
                listingName={l.name}
              />
              {l.status === "active" && (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    asChild
                  >
                    <Link href="/dashboard/trials">
                      <CalendarCheck className="mr-2 h-4 w-4" />
                      Request a Trial
                    </Link>
                  </Button>
                  <OfferModal
                    listingId={l.id}
                    listingName={l.name}
                    listingPrice={l.price}
                    completenessScore={l.completeness_score}
                  />
                </>
              )}
              {l.status === "under_offer" && (
                <Badge
                  variant="secondary"
                  className="w-full justify-center py-2 text-gold bg-gold/10"
                >
                  Under Offer
                </Badge>
              )}
              {l.status === "sold" && (
                <Badge
                  variant="secondary"
                  className="w-full justify-center py-2 text-ink-light bg-ink-faint/10"
                >
                  Sold
                </Badge>
              )}
            </div>

            <Separator className="my-4" />

            {/* Completeness score */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className={`h-4 w-4 ${completenessColor}`} />
                <span className="text-sm font-medium text-ink-dark">
                  Listing Completeness
                </span>
              </div>
              <span data-testid="mane-score-total" className={`text-sm font-bold ${completenessColor}`}>
                {l.completeness_score}/1000
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-light">
              Reflects documentation level, not horse quality.
            </p>

            {l.basics_score != null && l.details_score != null && l.trust_score != null && l.media_score != null && (
              <div data-testid="mane-score-buckets" className="mt-3 space-y-2">
                {[
                  { label: 'Basics', score: l.basics_score, max: 200, hint: 'Core listing info' },
                  { label: 'Details', score: l.details_score, max: 250, hint: 'Performance & pedigree depth' },
                  { label: 'Trust', score: l.trust_score, max: 250, hint: 'Health & transparency' },
                  { label: 'Media', score: l.media_score, max: 300, hint: 'Photos & video completeness' },
                ].map((b) => (
                  <div key={b.label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink-mid">{b.label}</span>
                      <span className="font-medium text-ink-dark">{b.score}/{b.max}</span>
                    </div>
                    <div className="mt-0.5 h-1.5 rounded-full bg-surface-wash">
                      <div
                        className="h-1.5 rounded-full bg-oxblood transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, b.max > 0 ? Math.round((b.score / b.max) * 100) : 0))}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-[10px] text-ink-faint">{b.hint}</p>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* ManeVault teaser */}
          <div className="rounded-lg border border-forest/20 bg-forest-light p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-forest" />
              <span className="text-sm font-medium text-ink-dark">
                ManeVault Protected
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-mid">
              Payments are held in escrow until you receive and inspect the
              horse. 5-day inspection period included.
            </p>
          </div>
        </div>
      </div>

      {/* Equine purchase disclaimer */}
      <div className="mt-8 rounded-md bg-paper-warm px-4 py-3">
        <p className="text-[11px] leading-relaxed text-ink-faint">
          <span className="font-medium text-ink-light">Important:</span>{" "}
          ManeExchange is a marketplace platform and is not a party to any
          transaction between buyers and sellers. All listing information is
          provided by the seller and has not been independently verified.
          We strongly recommend a pre-purchase examination (PPE) by a licensed
          veterinarian and review of all registration documents before completing
          any purchase. Equine activities involve inherent risks; buyers assume
          all risk associated with the purchase and ownership of any horse.
          See our{" "}
          <a href="/terms" className="underline hover:text-ink-mid">
            Terms of Service
          </a>{" "}
          for full details.
        </p>
      </div>
    </div>
  );
}

/* ── Helper Components ── */

function IconDetailRow({
  icon: Icon,
  label,
  value,
  bold,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-ink-faint" />
      <span className="w-28 shrink-0 text-sm text-ink-light">{label}</span>
      <span className={`text-sm ${bold ? "font-semibold text-ink-black" : "font-medium text-ink-dark"}`}>
        {value}
      </span>
    </div>
  );
}

function QuickFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-paper-warm px-3 py-2.5">
      <p className="text-xs text-ink-light">{label}</p>
      <p className="text-sm font-medium text-ink-dark">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-ink-mid">
      <span className="font-medium text-ink-dark">{label}:</span> {value}
    </p>
  );
}

function EmptyTabMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-md bg-paper-warm px-6 py-12 text-sm text-ink-light">
      {message}
    </div>
  );
}

/* ── Seller / Barn Tab ── */

function SellerBarnTab({ listing }: { listing: ListingTabsData }) {
  const l = listing;
  const seller = l.seller;
  const sellerName = seller.display_name || seller.full_name || "Seller";
  const location = [l.location_city, l.location_state].filter(Boolean).join(", ");
  const otherListings = l.other_listings ?? [];

  return (
    <div className="space-y-8">
      {/* Seller details */}
      <div>
        <p className="overline mb-3 text-[11px] tracking-widest text-ink-light">SELLER</p>
        <div className="divide-y divide-crease-light">
          <IconDetailRow icon={User} label="Seller" value={sellerName} bold />
          {l.barn_name && (
            <IconDetailRow icon={Home} label="Barn" value={l.barn_name} />
          )}
          {location && (
            <IconDetailRow icon={MapPin} label="Barn Location" value={location} />
          )}
          <IconDetailRow
            icon={ShieldCheck}
            label="Verification"
            value={seller.identity_verified ? "Verified" : "Unverified"}
          />
        </div>
      </div>

      {/* Reputation */}
      <div>
        <p className="overline mb-3 text-[11px] tracking-widest text-ink-light">REPUTATION</p>
        <div className="divide-y divide-crease-light">
          {l.seller_score && l.seller_score.mane_score > 0 && (
            <IconDetailRow
              icon={Star}
              label="Seller Rating"
              value={`${(l.seller_score.mane_score / 200).toFixed(1)}/5`}
            />
          )}
          <IconDetailRow icon={Clock} label="Response Time" value="Within 24 hours" />
          {otherListings.length > 0 && (
            <IconDetailRow
              icon={FileText}
              label="Horses for Sale"
              value={`${otherListings.length + 1} horses`}
            />
          )}
        </div>
      </div>

      {/* Contact */}
      <div>
        <p className="overline mb-3 text-[11px] tracking-widest text-ink-light">CONTACT</p>
        <div className="divide-y divide-crease-light">
          <div className="flex items-center gap-4 py-3">
            <ExternalLink className="h-4 w-4 shrink-0 text-ink-faint" />
            <span className="w-28 shrink-0 text-sm text-ink-light">View Seller</span>
            <Link
              href={`/sellers/${seller.id}`}
              className="text-sm font-medium text-oxblood hover:underline"
            >
              View Profile <ExternalLink className="ml-0.5 inline h-3 w-3" />
            </Link>
          </div>
          <IconDetailRow icon={MessageCircle} label="Messaging" value="Available" />
          <IconDetailRow
            icon={CalendarCheck}
            label="Trial Requests"
            value={l.trial_available ? "Available" : "Not available"}
          />
        </div>
      </div>

      {/* Seller avatar card */}
      <div className="flex items-center gap-3">
        {seller.avatar_url ? (
          <Image
            src={seller.avatar_url}
            alt={sellerName}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-warm text-ink-faint">
            <User className="h-5 w-5" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-ink-black">{sellerName}</span>
            {seller.identity_verified && (
              <ShieldCheck className="h-4 w-4 text-forest" />
            )}
          </div>
          {l.barn_name && (
            <p className="text-xs text-ink-mid">{l.barn_name}</p>
          )}
          {location && (
            <p className="text-xs text-ink-light">{location}</p>
          )}
        </div>
      </div>

      {/* Other horses by this seller */}
      {otherListings.length > 0 && (
        <div>
          <p className="overline mb-3 text-[11px] tracking-widest text-ink-light">OTHER HORSES BY THIS SELLER</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {otherListings.map((ol) => {
              const primaryMedia = ol.media?.find((m) => m.is_primary) ?? ol.media?.[0];
              return (
                <Link key={ol.id} href={`/horses/${ol.slug}`} className="group">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-paper-warm">
                    {primaryMedia ? (
                      <Image
                        src={primaryMedia.url}
                        alt={ol.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-ink-faint">
                        No photo
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-ink-dark group-hover:text-ink-black">
                    {ol.name}
                  </p>
                  <p className="text-xs text-ink-mid">
                    {ol.price ? `$${(ol.price / 100).toLocaleString()}` : "Contact for price"}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ManeVault teaser */}
      <div className="rounded-lg border border-forest/20 bg-forest-light p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-forest" />
          <span className="text-sm font-medium text-ink-dark">
            ManeVault Protected
          </span>
        </div>
        <p className="mt-1 text-xs text-ink-mid">
          Payments are held in escrow until you receive and inspect
          the horse. 5-day inspection period included.
        </p>
      </div>
    </div>
  );
}

/* ── Estimates Tab ── */

function EstimatesTab({ listing }: { listing: ListingTabsData }) {
  const l = listing;
  const location = [l.location_city, l.location_state].filter(Boolean).join(", ");
  const priceValue = l.price ? l.price / 100 : 0;

  // Estimated monthly insurance premiums based on industry averages
  const mortalityRate = 0.035;
  const majorMedicalRate = 0.025;
  const mortalityMonthly = priceValue > 0 ? Math.round((priceValue * mortalityRate) / 12) : 0;
  const fullCoverageMonthly = priceValue > 0 ? Math.round((priceValue * (mortalityRate + majorMedicalRate)) / 12) : 0;

  return (
    <div className="space-y-8">
      {/* Transportation estimates */}
      <div>
        <p className="overline mb-1 text-[11px] tracking-widest text-ink-light">TRANSPORTATION ESTIMATES</p>
        <p className="mb-4 text-sm text-ink-mid">
          Estimated ranges for shipping from {location || "seller location"} based on market averages. Actual quotes may vary by route, season, and availability.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue" />
              <p className="font-semibold text-ink-black">Commercial Van (Direct)</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-ink-mid">3–5 days typical</span>
              <span className="font-medium text-ink-dark">$1,200–$2,400</span>
            </div>
            <p className="mt-2 text-xs text-ink-light">Door-to-door, single or small group</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue" />
              <p className="font-semibold text-ink-black">Commercial Carrier</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-ink-mid">5–10 days typical</span>
              <span className="font-medium text-ink-dark">$800–$1,800</span>
            </div>
            <p className="mt-2 text-xs text-ink-light">Shared route, scheduled departures</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Transport quotes will be provided during the offer process. ManeExchange partners with vetted carriers only.
        </p>
      </div>

      {/* Insurance estimates */}
      {priceValue > 0 && (
        <div>
          <p className="overline mb-1 text-[11px] tracking-widest text-ink-light">INSURANCE ESTIMATES</p>
          <p className="mb-4 text-sm text-ink-mid">
            Estimated monthly premiums based on the listing price of ${priceValue.toLocaleString()}. Actual rates depend on age, use, location, and claims history.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-forest" />
                <p className="font-semibold text-ink-black">Mortality + Major Medical</p>
              </div>
              <p className="mt-2 text-xs text-ink-mid">Full value coverage, illness and injury</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-ink-mid">Est. monthly</span>
                <span className="font-medium text-ink-dark">~${fullCoverageMonthly}/mo</span>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gold" />
                <p className="font-semibold text-ink-black">Mortality Only</p>
              </div>
              <p className="mt-2 text-xs text-ink-mid">Death and theft coverage</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-ink-mid">Est. monthly</span>
                <span className="font-medium text-ink-dark">~${mortalityMonthly}/mo</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            Estimates based on industry-average rates (~3.5% mortality, ~2.5% major medical annually). Binding quotes available through ManeExchange insurance partners after purchase.
          </p>
        </div>
      )}
    </div>
  );
}
