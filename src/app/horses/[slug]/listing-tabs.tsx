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
} from "lucide-react";
import type { HorseListing } from "@/types/listings";
import type { SellerScore } from "@/types/scoring";
import { OfferModal } from "@/components/offer-modal";
import { ManeScoreBadge } from "@/components/mane-score-badge";
import { BadgeShowcase } from "@/components/badge-showcase";
import { ListingGallery } from "@/components/listing-gallery";
import { HennekeScoreDisplay } from "@/components/henneke-score";

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

export type ListingTabsData = HorseListing & {
  seller: SellerInfo;
  media: MediaItem[];
  seller_score: SellerScoreInfo;
};

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

        {/* Tabbed content */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList
            variant="line"
            className="w-full flex-wrap justify-start gap-0 border-b border-border pb-0"
          >
            <TabsTrigger value="overview" className="text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-sm">
              Performance
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="text-sm">
              Lifestyle
            </TabsTrigger>
            <TabsTrigger value="health" className="text-sm">
              Health &amp; Docs
            </TabsTrigger>
            <TabsTrigger value="media" className="text-sm">
              Media
            </TabsTrigger>
            <TabsTrigger value="seller" className="text-sm lg:hidden">
              Seller
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-sm lg:hidden">
              Pricing
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Overview ─── */}
          <TabsContent value="overview" className="mt-6 bg-paper-white">
            <div className="space-y-8">
              {/* Quick facts grid */}
              <section>
                <h2 className="mb-4 text-lg font-semibold text-ink-black">
                  Quick Facts
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {l.breed && (
                    <QuickFact label="Breed" value={l.breed} />
                  )}
                  {l.color && (
                    <QuickFact label="Color" value={l.color} />
                  )}
                  {l.gender && (
                    <QuickFact
                      label="Gender"
                      value={l.gender.charAt(0).toUpperCase() + l.gender.slice(1)}
                    />
                  )}
                  {l.age_years != null && (
                    <QuickFact label="Age" value={`${l.age_years} years`} />
                  )}
                  {l.height_hands && (
                    <QuickFact label="Height" value={`${l.height_hands}hh`} />
                  )}
                  {l.level && (
                    <QuickFact label="Level" value={l.level} />
                  )}
                  {l.registered_name && (
                    <QuickFact label="Registered Name" value={l.registered_name} />
                  )}
                  {l.registry && (
                    <QuickFact label="Registry" value={l.registry} />
                  )}
                  {l.sire && (
                    <QuickFact label="Sire" value={l.sire} />
                  )}
                  {l.dam && (
                    <QuickFact label="Dam" value={l.dam} />
                  )}
                </div>
              </section>

              {/* Description / Temperament preview */}
              {l.temperament && (
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-ink-black">
                    About This Horse
                  </h2>
                  <p className="whitespace-pre-line text-ink-mid">
                    {l.temperament}
                  </p>
                </section>
              )}

              {/* Reason for sale */}
              {l.reason_for_sale && (
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-ink-black">
                    Reason for Sale
                  </h2>
                  <p className="text-ink-mid">{l.reason_for_sale}</p>
                </section>
              )}

              {/* Suitable for */}
              {l.suitable_for && (
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-ink-black">
                    Suitable For
                  </h2>
                  <p className="text-ink-mid">{l.suitable_for}</p>
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
                      <p className="overline mb-2 text-ink-light">
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

          {/* ─── Tab 3: Lifestyle ─── */}
          <TabsContent value="lifestyle" className="mt-6 bg-paper-white">
            <div className="space-y-8">
              {l.temperament && (
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-ink-black">
                    Temperament
                  </h2>
                  <p className="whitespace-pre-line text-ink-mid">
                    {l.temperament}
                  </p>
                </section>
              )}

              {l.vices && (
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-ink-black">
                    Known Vices
                  </h2>
                  <p className="text-ink-mid">{l.vices}</p>
                </section>
              )}

              {l.good_with && (
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-ink-black">
                    Good With
                  </h2>
                  <p className="text-ink-mid">{l.good_with}</p>
                </section>
              )}

              {l.suitable_for && (
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-ink-black">
                    Suitable Rider Level
                  </h2>
                  <p className="text-ink-mid">{l.suitable_for}</p>
                </section>
              )}

              {/* Barn / Living details */}
              {(l.barn_name ||
                l.current_rider ||
                l.current_trainer ||
                l.turnout_schedule ||
                l.feeding_program ||
                l.shoeing_schedule ||
                l.supplements) && (
                <section>
                  <h2 className="mb-4 text-lg font-semibold text-ink-black">
                    Daily Life
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {l.barn_name && (
                      <QuickFact label="Barn" value={l.barn_name} />
                    )}
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
                  <h2 className="mb-4 text-lg font-semibold text-ink-black">
                    Ownership History
                  </h2>
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

              {!l.temperament &&
                !l.vices &&
                !l.good_with &&
                !l.suitable_for &&
                !l.barn_name &&
                !l.current_rider &&
                !l.current_trainer &&
                !l.turnout_schedule && (
                  <EmptyTabMessage message="No lifestyle details listed for this horse." />
                )}
            </div>
          </TabsContent>

          {/* ─── Tab 4: Health & Docs ─── */}
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

          {/* ─── Tab 6: Seller / Barn (mobile only — desktop has sidebar) ─── */}
          <TabsContent value="seller" className="mt-6 bg-paper-white lg:hidden">
            <div className="space-y-6">
              <SellerCard
                seller={l.seller}
                sellerScore={l.seller_score}
              />

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
          </TabsContent>

          {/* ─── Tab 7: Pricing (mobile only — desktop has sidebar) ─── */}
          <TabsContent value="pricing" className="mt-6 bg-paper-white lg:hidden">
            <div className="space-y-6">
              <PricingCard
                listing={l}
                priceStr={priceStr}
                completenessColor={completenessColor}
              />
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

            {/* Deal Rating Badge */}
            {l.price && (
              <div className="mt-2 mb-1">
                <Badge
                  variant="secondary"
                  className="bg-forest/10 text-forest text-xs"
                >
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Competitively Priced
                </Badge>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <Button className="w-full" size="lg">
                <MessageCircle className="mr-2 h-4 w-4" />
                Message Seller
              </Button>
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
              <span className={`text-sm font-bold ${completenessColor}`}>
                {l.completeness_score}/1000
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-light">
              Reflects documentation level, not horse quality.
            </p>

            {l.basics_score != null && l.details_score != null && l.trust_score != null && l.media_score != null && (
              <div className="mt-3 space-y-2">
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

            <Separator className="my-4" />

            {/* Seller info */}
            <SellerCard seller={l.seller} sellerScore={l.seller_score} />
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
    </div>
  );
}

/* ── Helper Components ── */

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

function SellerCard({
  seller,
  sellerScore,
}: {
  seller: SellerInfo;
  sellerScore: SellerScoreInfo;
}) {
  return (
    <div>
      <p className="overline mb-2 text-ink-light">SELLER</p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-paper-warm" />
        <div>
          <Link
            href={`/sellers/${seller.id}`}
            className="text-sm font-medium text-ink-dark hover:underline"
          >
            {seller.display_name || seller.full_name || "Seller"}
          </Link>
          {seller.identity_verified && (
            <Badge variant="secondary" className="mt-0.5 text-xs">
              <Shield className="mr-1 h-3 w-3" />
              Identity Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Seller Mane Score + badges */}
      {sellerScore && sellerScore.mane_score > 0 && (
        <div className="mt-3 space-y-2">
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
  );
}

function PricingCard({
  listing,
  priceStr,
  completenessColor,
}: {
  listing: ListingTabsData;
  priceStr: string;
  completenessColor: string;
}) {
  const l = listing;

  return (
    <div className="rounded-lg border border-border bg-paper-cream p-6 shadow-folded">
      <p className="font-serif text-4xl font-bold tracking-tight text-ink-black">{priceStr}</p>
      {l.price_negotiable && (
        <p className="mt-1 text-xs text-ink-light">Price negotiable</p>
      )}

      {/* Deal Rating Badge */}
      {l.price && (
        <div className="mt-2 mb-1">
          <Badge
            variant="secondary"
            className="bg-forest/10 text-forest text-xs"
          >
            <TrendingUp className="mr-1 h-3 w-3" />
            Competitively Priced
          </Badge>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <Button className="w-full" size="lg">
          <MessageCircle className="mr-2 h-4 w-4" />
          Message Seller
        </Button>
        {l.status === "active" && (
          <>
            <Button variant="outline" className="w-full" size="lg" asChild>
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
        <span className={`text-sm font-bold ${completenessColor}`}>
          {l.completeness_score}/1000
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-light">
        Reflects documentation level, not horse quality.
      </p>

      {l.basics_score != null && l.details_score != null && l.trust_score != null && l.media_score != null && (
        <div className="mt-3 space-y-2">
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

      {/* ManeVault teaser */}
      <div className="mt-4 rounded-md bg-paper-warm p-3">
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
  );
}
