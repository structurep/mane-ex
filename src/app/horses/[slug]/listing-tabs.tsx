"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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

} from "lucide-react";
import Image from "next/image";
import type { HorseListing } from "@/types/listings";
import type { SellerScore } from "@/types/scoring";
import { OfferModal } from "@/components/offers/offer-modal";
import { MessageSellerModal } from "@/components/messaging/message-seller-modal";
import { ListingGallery } from "@/components/marketplace/listing-gallery";
import { HennekeScoreDisplay } from "@/components/marketplace/henneke-score";
import { RegistryBadges, type RegistryRecord, type RegistryType } from "@/components/marketplace/registry-lookup";
import { VerificationChecklist } from "@/components/listings/verification-checklist";
import { VerificationBadge } from "@/components/listings/verification-badge";
import type { ListingRegistryRecord } from "@/types/listings";
import { toggleFavorite } from "@/actions/listings";
import {
  DetailGrid,
  type DetailField,
  IconDetailList,
  type IconDetailItem,
  SectionHeading,
  StatusBadge,
  AlertBanner,
  AvatarCircle,
  EmptyState,
} from "@/components/tailwind-plus";

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

export function ListingTabs({ listing, defaultTab = "overview", demandScore, demandLabel }: { listing: ListingTabsData; defaultTab?: string; demandScore?: number | null; demandLabel?: string | null }) {
  const l = listing;
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await toggleFavorite(l.id);
      if (result.error) return;
      setSaved(result.favorited);
    });
  }

  async function handleShare() {
    const url = window.location.href;
    const title = l.name;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
      return;
    }
    await navigator.clipboard.writeText(url);
  }

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
              <h1 className="display-lg text-[var(--ink-black)]">{l.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-[var(--ink-mid)]">
                  {[l.breed, l.color, l.gender].filter(Boolean).join(" · ")}
                </p>
                <VerificationBadge tier={l.verification_tier} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label={saved ? "Remove from Dream Barn" : "Save to Dream Barn"}
                onClick={handleSave}
                disabled={isPending}
              >
                <Heart className={`h-5 w-5 ${saved ? "fill-coral text-coral" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Share listing" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Price — visible on mobile/tablet where sidebar is hidden */}
          <p className="mt-3 font-serif text-3xl font-bold tracking-tight text-[var(--ink-black)] lg:hidden">
            {priceStr}
            {l.price_negotiable && (
              <span className="ml-2 align-middle text-sm font-normal text-[var(--accent-green)]">Negotiable</span>
            )}
          </p>

          {/* Quick stats bar */}
          <div className="crease-divider mt-4 mb-4" />
          <div className="flex flex-wrap gap-4 text-sm text-[var(--ink-mid)]">
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
            className="w-full flex-wrap justify-start gap-0 border-b border-crease-light pb-0"
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
                <IconDetailList
                  items={[
                    l.age_years != null && { icon: <Calendar className="h-4 w-4" />, label: "Age / YOB", value: `${l.age_years} years` },
                    l.breed && { icon: <Award className="h-4 w-4" />, label: "Breed", value: l.breed },
                    l.gender && { icon: <Heart className="h-4 w-4" />, label: "Sex", value: l.gender.charAt(0).toUpperCase() + l.gender.slice(1) },
                    l.color && { icon: <Palette className="h-4 w-4" />, label: "Color", value: l.color },
                    l.height_hands && { icon: <Ruler className="h-4 w-4" />, label: "Height", value: `${l.height_hands}hh` },
                    l.location_state && { icon: <MapPin className="h-4 w-4" />, label: "Location", value: l.location_city ? `${l.location_city}, ${l.location_state}` : l.location_state },
                    l.registered_name && { icon: <FileText className="h-4 w-4" />, label: "Registered Name", value: l.registered_name },
                    l.registry && { icon: <FileText className="h-4 w-4" />, label: "Registry", value: l.registry },
                    l.sire && { icon: <Award className="h-4 w-4" />, label: "Sire", value: l.sire },
                    l.dam && { icon: <Award className="h-4 w-4" />, label: "Dam", value: l.dam },
                  ].filter(Boolean) as IconDetailItem[]}
                />
                {l.registry_records && l.registry_records.length > 0 && (
                  <div className="mt-3">
                    <RegistryBadges records={l.registry_records.map(mapDbToRegistryRecord)} />
                  </div>
                )}
              </section>

              {/* PRICING section */}
              <section>
                <p className="overline mb-4 text-[11px] tracking-widest text-ink-light">PRICING</p>
                <IconDetailList
                  items={[
                    { icon: <DollarSign className="h-4 w-4" />, label: "Asking Price", value: priceStr, bold: true },
                    l.price_negotiable && { icon: <TrendingUp className="h-4 w-4" />, label: "Negotiable", value: "Yes" },
                  ].filter(Boolean) as IconDetailItem[]}
                />
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
              {(() => {
                const behaviorFields: DetailField[] = [];
                if (l.vices) behaviorFields.push({ label: "Known Vices", value: l.vices });
                if (l.good_with) behaviorFields.push({ label: "Good With", value: l.good_with });
                return behaviorFields.length > 0 ? (
                  <DetailGrid title="Behavior" fields={behaviorFields} />
                ) : null;
              })()}

              {/* Daily Life — grid description list */}
              {(() => {
                const dailyFields: DetailField[] = [];
                if (l.current_rider) dailyFields.push({ label: "Current Rider", value: l.current_rider });
                if (l.current_trainer) dailyFields.push({ label: "Current Trainer", value: l.current_trainer });
                if (l.turnout_schedule) dailyFields.push({ label: "Turnout", value: l.turnout_schedule });
                if (l.feeding_program) dailyFields.push({ label: "Feeding Program", value: l.feeding_program });
                if (l.shoeing_schedule) dailyFields.push({ label: "Shoeing Schedule", value: l.shoeing_schedule });
                if (l.supplements) dailyFields.push({ label: "Supplements", value: l.supplements });

                return dailyFields.length > 0 ? (
                  <DetailGrid title="Daily Life" fields={dailyFields} />
                ) : null;
              })()}

              {/* Ownership history */}
              {(() => {
                const ownerFields: DetailField[] = [];
                if (l.years_with_current_owner != null) ownerFields.push({ label: "Years with Current Owner", value: `${l.years_with_current_owner} year${l.years_with_current_owner !== 1 ? "s" : ""}` });
                if (l.number_of_previous_owners != null) ownerFields.push({ label: "Previous Owners", value: String(l.number_of_previous_owners) });

                return ownerFields.length > 0 ? (
                  <DetailGrid title="Ownership History" fields={ownerFields} />
                ) : null;
              })()}

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
              <AlertBanner variant="info" title="Listing Disclaimer">
                <p>
                  All representations are made by the seller. ManeExchange does
                  not warrant listing accuracy. Mane Score reflects listing
                  completeness and documentation, not the quality, soundness, or
                  value of any horse.
                </p>
              </AlertBanner>
            </div>
          </TabsContent>

          {/* ─── Tab 2: Performance ─── */}
          <TabsContent value="performance" className="mt-6 bg-paper-white">
            <div className="space-y-8">
              {l.show_experience ? (
                <section>
                  <SectionHeading title="Show Experience" />
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
                <EmptyState
                  icon={<Award className="h-8 w-8" />}
                  title="No Show Experience"
                  description="No show experience listed for this horse."
                />
              )}

              {l.competition_divisions && (
                <section>
                  <h2 className="mb-2 text-sm font-semibold text-ink-dark">Competition Divisions</h2>
                  <p className="text-ink-mid">{l.competition_divisions}</p>
                </section>
              )}

              {l.level && (
                <section>
                  <h2 className="mb-2 text-sm font-semibold text-ink-dark">Level</h2>
                  <p className="text-ink-mid">{l.level}</p>
                </section>
              )}

              {l.training_history && (
                <section>
                  <SectionHeading title="Training History" />
                  <p className="whitespace-pre-line text-ink-mid">
                    {l.training_history}
                  </p>
                </section>
              )}

              {/* Registration numbers */}
              {(() => {
                const idFields: DetailField[] = [];
                if (l.usef_number) idFields.push({ label: "USEF", value: l.usef_number });
                if (l.usdf_number) idFields.push({ label: "USDF", value: l.usdf_number });
                if (l.fei_id) idFields.push({ label: "FEI", value: l.fei_id });
                return idFields.length > 0 ? (
                  <DetailGrid title="Competition IDs" fields={idFields} />
                ) : null;
              })()}
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
                  <SectionHeading title="Veterinary Information" />

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
                          <StatusBadge
                            variant={soundness === "vet_confirmed_sound" ? "forest" : soundness === "minor_findings" ? "gold" : "gray"}
                            dot
                          >
                            {soundness === "vet_confirmed_sound"
                              ? "Vet-confirmed sound"
                              : soundness === "minor_findings"
                                ? "Minor findings (described)"
                                : soundness === "managed_condition"
                                  ? "Managed condition"
                                  : "Not recently assessed"}
                          </StatusBadge>
                        )}
                      </div>
                    );
                  })()}

                  {(() => {
                    const vetFields: DetailField[] = [];
                    if (l.vet_name) vetFields.push({ label: "Veterinarian", value: l.vet_name });
                    if (l.vet_phone) vetFields.push({ label: "Vet Phone", value: l.vet_phone });
                    if (l.coggins_date) vetFields.push({ label: "Coggins", value: new Date(l.coggins_date).toLocaleDateString() });
                    if (l.coggins_expiry) vetFields.push({ label: "Coggins Expiry", value: new Date(l.coggins_expiry).toLocaleDateString() });
                    if (l.last_vet_check) vetFields.push({ label: "Last Vet Check", value: new Date(l.last_vet_check).toLocaleDateString() });
                    if (l.vaccination_status) vetFields.push({ label: "Vaccinations", value: l.vaccination_status });
                    if (l.dental_date) vetFields.push({ label: "Last Dental", value: new Date(l.dental_date).toLocaleDateString() });
                    if (l.known_health_issues) vetFields.push({ label: "Known Health Issues", value: l.known_health_issues });
                    if (l.lameness_history) vetFields.push({ label: "Lameness History", value: l.lameness_history });
                    if (l.surgical_history) vetFields.push({ label: "Surgical History", value: l.surgical_history });
                    if (l.allergies) vetFields.push({ label: "Allergies", value: l.allergies });
                    if (l.medications) vetFields.push({ label: "Current Medications", value: l.medications });
                    if (l.recent_medical_treatments) vetFields.push({ label: "Recent Treatments", value: l.recent_medical_treatments });
                    return vetFields.length > 0 ? <DetailGrid fields={vetFields} /> : null;
                  })()}
                </section>
              ) : (
                <EmptyState
                  icon={<FileText className="h-8 w-8" />}
                  title="No Veterinary Information"
                  description="No veterinary information listed for this horse."
                />
              )}

              {/* Warranty */}
              <section>
                <SectionHeading title="Warranty" />
                <div className="flex items-center gap-3">
                  <StatusBadge
                    variant={l.warranty === "as_is" ? "red" : l.warranty === "sound_at_sale" ? "gold" : "forest"}
                    dot
                  >
                    {l.warranty === "as_is"
                      ? "Sold As Is"
                      : l.warranty === "sound_at_sale"
                        ? "Sound at Time of Sale"
                        : "Sound for Intended Use"}
                  </StatusBadge>
                </div>
                {l.warranty === "as_is" && (
                  <p className="mt-2 text-xs text-ink-mid">
                    This horse is sold without any warranties, express or
                    implied. Buyer assumes all risk.
                  </p>
                )}
              </section>

              {/* Document disclaimer */}
              <AlertBanner variant="warning" title="Buyer Advisory">
                <p>
                  Documents provided by seller. ManeExchange has not
                  independently verified accuracy, completeness, or
                  authenticity. A pre-purchase exam (PPE) by your own
                  veterinarian is strongly recommended before any purchase.
                </p>
              </AlertBanner>
            </div>
          </TabsContent>

          {/* ─── Tab 5: Media ─── */}
          <TabsContent value="media" className="mt-6 bg-paper-white">
            <div className="space-y-4">
              <SectionHeading title="Photos & Videos" />
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
          <div className="rounded-lg border border-crease-light bg-paper-cream p-6 shadow-folded">
            <p className="font-serif text-4xl font-bold tracking-tight text-ink-black">{priceStr}</p>
            {l.price_negotiable && (
              <div className="mt-1.5">
                <StatusBadge variant="forest" dot>Negotiable</StatusBadge>
              </div>
            )}

            {l.status === "active" && (
              <div className="mt-5 space-y-2.5">
                {/* Primary CTA: Contact Seller */}
                <MessageSellerModal
                  sellerId={l.seller_id}
                  sellerName={l.seller?.display_name || "Seller"}
                  listingId={l.id}
                  listingName={l.name}
                />

                {/* Secondary CTAs in 2-col grid */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full ${saved ? "border-coral/30 bg-coral/5 text-coral" : ""}`}
                    onClick={handleSave}
                    disabled={isPending}
                  >
                    <Heart className={`mr-1.5 h-3.5 w-3.5 ${saved ? "fill-coral" : ""}`} />
                    {saved ? "Saved" : "Save"}
                  </Button>
                  <MessageSellerModal
                    sellerId={l.seller_id}
                    sellerName={l.seller?.display_name || "Seller"}
                    listingId={l.id}
                    listingName={l.name}
                    trigger={
                      <Button variant="outline" size="sm" className="w-full">
                        <CalendarCheck className="mr-1.5 h-3.5 w-3.5" />
                        Request Trial
                      </Button>
                    }
                  />
                </div>

                {/* Make Offer — tertiary */}
                <OfferModal
                  listingId={l.id}
                  listingName={l.name}
                  listingPrice={l.price}
                  completenessScore={l.completeness_score}
                />
              </div>
            )}

            {l.status === "under_offer" && (
              <div className="mt-5">
                <div className="flex items-center justify-center gap-2 rounded-lg bg-gold/10 py-3">
                  <StatusBadge variant="gold" dot>Under Offer</StatusBadge>
                </div>
                <MessageSellerModal
                  sellerId={l.seller_id}
                  sellerName={l.seller?.display_name || "Seller"}
                  listingId={l.id}
                  listingName={l.name}
                />
              </div>
            )}

            {l.status === "sold" && (
              <div className="mt-5">
                <div className="flex items-center justify-center gap-2 rounded-lg bg-ink-black/5 py-3">
                  <StatusBadge variant="gray">Sold</StatusBadge>
                </div>
              </div>
            )}

            <Separator className="my-5" />

            {/* HorseProof Verification */}
            {l.verification_tier && l.verification_tier !== "none" && (
              <>
                <VerificationChecklist
                  listing={{
                    verification_tier: l.verification_tier,
                    seller_identity_verified: l.seller_identity_verified,
                    trainer_endorsed: l.trainer_endorsed,
                    standardized_video_complete: l.standardized_video_complete,
                    ppe_on_file: l.ppe_on_file,
                    show_record_linked: l.show_record_linked,
                    hp_trainer_name: l.hp_trainer_name,
                    ppe_document_url: l.ppe_document_url,
                    show_record_url: l.show_record_url,
                  }}
                />
                <Separator className="my-5" />
              </>
            )}

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

          {/* Market Demand */}
          {demandScore != null && demandScore > 0 && (
            <div className="rounded-lg border border-crease-light bg-paper-cream p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`h-4 w-4 ${demandScore >= 70 ? "text-oxblood" : demandScore >= 40 ? "text-forest" : "text-ink-light"}`} />
                  <span className="text-sm font-medium text-ink-dark">Market Demand</span>
                </div>
                <span className={`text-sm font-bold ${demandScore >= 70 ? "text-oxblood" : demandScore >= 40 ? "text-forest" : "text-ink-mid"}`}>
                  {demandLabel}
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-surface-wash">
                <div
                  className={`h-1.5 rounded-full transition-all ${demandScore >= 70 ? "bg-oxblood" : demandScore >= 40 ? "bg-forest" : "bg-ink-faint"}`}
                  style={{ width: `${demandScore}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-ink-faint">
                Based on buyer engagement in the last 7 days
              </p>
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
              Payments are held in escrow until you receive and inspect the
              horse. 5-day inspection period included.
            </p>
          </div>
        </div>
      </div>

      {/* Equine purchase disclaimer */}
      <AlertBanner variant="info" title="Equine Purchase Notice" className="mt-8">
        <p>
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
      </AlertBanner>
    </div>
  );
}

/* ── Helper Components ── */


/* ── Seller / Barn Tab ── */

function SellerBarnTab({ listing }: { listing: ListingTabsData }) {
  const l = listing;
  const seller = l.seller;
  const sellerName = seller.display_name || seller.full_name || "Seller";
  const location = [l.location_city, l.location_state].filter(Boolean).join(", ");
  const otherListings = l.other_listings ?? [];

  return (
    <div className="space-y-8">
      {/* Seller card — introduces the seller visually first */}
      <div className="flex items-center gap-3">
        <AvatarCircle
          src={seller.avatar_url}
          initials={sellerName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
          alt={sellerName}
          size={48}
        />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-ink-black">{sellerName}</span>
            {seller.identity_verified && (
              <StatusBadge variant="forest" dot>Verified</StatusBadge>
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

      {/* Seller details */}
      <div>
        <p className="overline mb-3 text-[11px] tracking-widest text-ink-light">SELLER</p>
        <IconDetailList
          items={[
            { icon: <User className="h-4 w-4" />, label: "Seller", value: sellerName, bold: true },
            l.barn_name && { icon: <Home className="h-4 w-4" />, label: "Barn", value: l.barn_name },
            location && { icon: <MapPin className="h-4 w-4" />, label: "Barn Location", value: location },
            { icon: <ShieldCheck className="h-4 w-4" />, label: "Verification", value: seller.identity_verified ? "Verified" : "Unverified" },
          ].filter(Boolean) as IconDetailItem[]}
        />
      </div>

      {/* Reputation */}
      <div>
        <p className="overline mb-3 text-[11px] tracking-widest text-ink-light">REPUTATION</p>
        <IconDetailList
          items={[
            l.seller_score && l.seller_score.mane_score > 0 && { icon: <Star className="h-4 w-4" />, label: "Seller Rating", value: `${(l.seller_score.mane_score / 200).toFixed(1)}/5` },
            otherListings.length > 0 && { icon: <FileText className="h-4 w-4" />, label: "Horses for Sale", value: `${otherListings.length + 1} horses` },
          ].filter(Boolean) as IconDetailItem[]}
        />
      </div>

      {/* Contact */}
      <div>
        <p className="overline mb-3 text-[11px] tracking-widest text-ink-light">CONTACT</p>
        <IconDetailList
          items={[
            { icon: <ExternalLink className="h-4 w-4" />, label: "View Seller", value: <Link href={`/sellers/${seller.id}`} className="text-sm font-medium text-oxblood hover:underline">View Profile <ExternalLink className="ml-0.5 inline h-3 w-3" /></Link> },
            { icon: <MessageCircle className="h-4 w-4" />, label: "Messaging", value: "Available" },
            { icon: <CalendarCheck className="h-4 w-4" />, label: "Trial Requests", value: l.trial_available ? "Available" : "Not available" },
          ]}
        />
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
          <div className="rounded-lg border border-crease-light p-4">
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
          <div className="rounded-lg border border-crease-light p-4">
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
            <div className="rounded-lg border border-crease-light p-4">
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
            <div className="rounded-lg border border-crease-light p-4">
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
