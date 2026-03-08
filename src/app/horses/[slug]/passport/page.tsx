import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  ChevronRight,
  ChevronLeft,
  Shield,
  Heart,
  Activity,
  Award,
  BookOpen,
  Users,
  Calendar,
  MapPin,
  FileText,
  Scissors,
  BarChart3,
} from "lucide-react";
import type { HorseListing } from "@/types/listings";
import {
  VerificationBadge,
  DocumentVault,
  PassportQRCode,
  PassportShareControls,
  HennekeBCSHistory,
  FarrierLog,
  type PassportDocument,
  type VerificationLevel,
} from "@/components/marketplace/passport-enhancements";
import { BloodlineExplorer } from "@/components/marketplace/bloodline-explorer";

type Props = {
  params: Promise<{ slug: string }>;
};

type MediaItem = {
  id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  type: "photo" | "video";
};

type ListingWithMedia = HorseListing & {
  seller: {
    id: string;
    display_name: string | null;
    full_name: string | null;
  };
  media: MediaItem[];
};

async function getListing(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("horse_listings")
    .select(
      `
      *,
      seller:profiles!seller_id(id, display_name, full_name),
      media:listing_media(id, url, alt_text, is_primary, type)
    `
    )
    .eq("slug", slug)
    .in("status", ["active", "under_offer", "sold"])
    .single();

  if (error || !data) return null;
  return data as unknown as ListingWithMedia;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);

  if (!listing) {
    return { title: "Horse Not Found" };
  }

  return {
    title: `${listing.name} — Digital Passport | ManeExchange`,
    description: `Digital passport for ${listing.name}. Identity, pedigree, health timeline, show history, and ownership records.`,
    openGraph: {
      title: `${listing.name} — Digital Passport`,
      description: `Complete identity and history for ${listing.name} on ManeExchange.`,
      type: "website",
    },
  };
}

/* ────────────────────────────────────────────
   Helper: format a date string for display
   ──────────────────────────────────────────── */
function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ────────────────────────────────────────────
   Timeline dot component (reusable)
   ──────────────────────────────────────────── */
function TimelineDot({ color = "bg-ink-faint" }: { color?: string }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className={`h-3 w-3 rounded-full ${color} ring-2 ring-paper-white`} />
    </div>
  );
}

/* ────────────────────────────────────────────
   Section wrapper for passport blocks
   ──────────────────────────────────────────── */
function PassportSection({
  icon,
  title,
  verificationLevel,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  verificationLevel?: VerificationLevel;
  children: React.ReactNode;
}) {
  return (
    <section className="relative">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-warm text-ink-mid">
          {icon}
        </span>
        <h2 className="text-lg font-semibold text-ink-black">{title}</h2>
        {verificationLevel && (
          <VerificationBadge level={verificationLevel} compact />
        )}
      </div>
      <div className="ml-4 border-l-2 border-crease-light pl-6">
        {children}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   Sample enhancement data (static until DB)
   ──────────────────────────────────────────── */

const sampleDocuments: PassportDocument[] = [
  {
    id: "d1",
    name: "Pre-Purchase Exam Report",
    type: "ppe_report",
    uploadedAt: "2026-01-15",
    uploadedBy: "Dr. Sarah Miller, DVM",
    fileSize: "2.4 MB",
    verified: true,
  },
  {
    id: "d2",
    name: "Coggins Test - Negative",
    type: "coggins",
    uploadedAt: "2026-02-01",
    uploadedBy: "Seller",
    fileSize: "340 KB",
    verified: true,
  },
  {
    id: "d3",
    name: "Front Limb X-Rays (4 views)",
    type: "xray",
    uploadedAt: "2026-01-15",
    uploadedBy: "Dr. Sarah Miller, DVM",
    fileSize: "8.1 MB",
    verified: true,
  },
  {
    id: "d4",
    name: "AQHA Registration Certificate",
    type: "registration",
    uploadedAt: "2025-09-20",
    uploadedBy: "Seller",
    fileSize: "1.1 MB",
    verified: false,
  },
];

const sampleBCSHistory = [
  { date: "2026-02-15", score: 5, assessedBy: "Dr. Miller, DVM" },
  { date: "2025-11-10", score: 5, assessedBy: "Dr. Miller, DVM" },
  { date: "2025-08-20", score: 6, assessedBy: "Dr. Torres, DVM" },
  { date: "2025-05-01", score: 4, assessedBy: "Self-assessed" },
];

const sampleFarrierEntries = [
  {
    date: "2026-02-10",
    type: "full_shoe" as const,
    farrier: "Jake Henderson, CJF",
    notes: "Reset fronts, new hinds. Good hoof growth.",
  },
  {
    date: "2026-01-05",
    type: "trim" as const,
    farrier: "Jake Henderson, CJF",
    notes: "Barefoot trim for turnout period.",
  },
  {
    date: "2025-11-28",
    type: "full_shoe" as const,
    farrier: "Jake Henderson, CJF",
  },
  {
    date: "2025-10-15",
    type: "corrective" as const,
    farrier: "Jake Henderson, CJF",
    notes: "Slight medial deviation in LF — corrective shoe applied.",
  },
];

/* ════════════════════════════════════════════
   Main Passport Page
   ════════════════════════════════════════════ */
export default async function HorsePassportPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListing(slug);

  if (!listing) {
    notFound();
  }

  const l = listing;

  const primaryImage = l.media?.find((m) => m.is_primary) || l.media?.[0];
  const passportId = `MX-${l.id.slice(0, 8).toUpperCase()}`;

  // Build health timeline from listing fields
  const healthEvents: { date: string; sortDate: string; label: string; detail: string; color: string }[] = [];

  if (l.coggins_date) {
    healthEvents.push({
      date: fmtDate(l.coggins_date),
      sortDate: l.coggins_date,
      label: "Coggins Test",
      detail: l.coggins_expiry ? `Valid through ${fmtDate(l.coggins_expiry)}` : "Negative result on file",
      color: "bg-forest",
    });
  }
  if (l.last_vet_check) {
    healthEvents.push({
      date: fmtDate(l.last_vet_check),
      sortDate: l.last_vet_check,
      label: "Veterinary Exam",
      detail: l.vet_name ? `Examined by ${l.vet_name}` : "Routine wellness check",
      color: "bg-blue",
    });
  }
  if (l.dental_date) {
    healthEvents.push({
      date: fmtDate(l.dental_date),
      sortDate: l.dental_date,
      label: "Dental Float",
      detail: "Routine dental maintenance",
      color: "bg-gold",
    });
  }
  if (l.vaccination_status) {
    healthEvents.push({
      date: l.last_vet_check ? fmtDate(l.last_vet_check) : "On file",
      sortDate: l.last_vet_check || "2000-01-01",
      label: "Vaccinations",
      detail: l.vaccination_status,
      color: "bg-forest",
    });
  }

  // Sort health events by date descending (most recent first)
  healthEvents.sort((a, b) => (b.sortDate > a.sortDate ? 1 : -1));

  return (
    <div className="min-h-screen bg-paper-cream">
      <Header />

      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-[900px]">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1 text-sm text-ink-light">
            <Link href="/browse" className="hover:text-ink-black">
              Browse
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/horses/${l.slug}`} className="hover:text-ink-black">
              {l.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink-mid">Digital Passport</span>
          </nav>

          {/* Back link */}
          <Link
            href={`/horses/${l.slug}`}
            className="mb-6 inline-flex items-center gap-1 text-sm text-blue hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to listing
          </Link>

          {/* ── Passport Document ── */}
          <div className="overflow-hidden rounded-lg border border-crease-light bg-paper-white shadow-lifted">

            {/* ── HEADER ── */}
            <div className="border-b-2 border-crease-mid bg-paper-warm px-6 py-6 sm:px-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="overline mb-1 text-ink-light">Digital Passport</p>
                  <h1 className="text-2xl font-bold tracking-tight text-ink-black sm:text-3xl">
                    {l.name}
                  </h1>
                  {l.registered_name && l.registered_name !== l.name && (
                    <p className="mt-0.5 text-sm text-ink-mid">
                      Registered: {l.registered_name}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-ink-mid">
                    {[l.breed, l.color, l.gender ? l.gender.charAt(0).toUpperCase() + l.gender.slice(1) : null]
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="overline mb-1 text-ink-light">Passport ID</p>
                  <p className="font-heading text-sm font-semibold tracking-widest text-ink-dark">
                    {passportId}
                  </p>
                  {l.registration_number && (
                    <p className="mt-1 text-xs text-ink-mid">
                      {l.registry || "Registry"}: {l.registration_number}
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile passport ID */}
              <div className="mt-3 sm:hidden">
                <p className="text-xs text-ink-light">
                  Passport ID: <span className="font-semibold tracking-widest text-ink-dark">{passportId}</span>
                </p>
                {l.registration_number && (
                  <p className="text-xs text-ink-mid">
                    {l.registry || "Registry"}: {l.registration_number}
                  </p>
                )}
              </div>
            </div>

            {/* ── BODY ── */}
            <div className="space-y-10 px-6 py-8 sm:px-8">

              {/* ─── SECTION 1: Identity ─── */}
              <PassportSection
                icon={<Shield className="h-4 w-4" />}
                title="Identity"
                verificationLevel={l.registration_number ? "registry_verified" : "self_reported"}
              >
                <div className="flex flex-col gap-6 sm:flex-row">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    <div className="h-40 w-40 overflow-hidden rounded-md border border-crease-light bg-paper-warm">
                      {primaryImage ? (
                        <img
                          src={primaryImage.url}
                          alt={primaryImage.alt_text || l.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-ink-faint">
                          <Heart className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid flex-1 grid-cols-2 gap-3 self-start sm:grid-cols-3">
                    {l.breed && (
                      <StatField label="Breed" value={l.breed} />
                    )}
                    {l.color && (
                      <StatField label="Color" value={l.color} />
                    )}
                    {l.gender && (
                      <StatField
                        label="Gender"
                        value={l.gender.charAt(0).toUpperCase() + l.gender.slice(1)}
                      />
                    )}
                    {l.age_years != null && (
                      <StatField
                        label="Age"
                        value={`${l.age_years} year${l.age_years !== 1 ? "s" : ""}`}
                      />
                    )}
                    {l.date_of_birth && (
                      <StatField label="Foaled" value={fmtDate(l.date_of_birth)} />
                    )}
                    {l.height_hands && (
                      <StatField label="Height" value={`${l.height_hands}hh`} />
                    )}
                    {l.registry && (
                      <StatField label="Registry" value={l.registry} />
                    )}
                    {l.registration_number && (
                      <StatField label="Reg. Number" value={l.registration_number} />
                    )}
                    {l.location_state && (
                      <StatField
                        label="Location"
                        value={
                          l.location_city
                            ? `${l.location_city}, ${l.location_state}`
                            : l.location_state
                        }
                      />
                    )}
                  </div>
                </div>
              </PassportSection>

              {/* ─── SECTION 2: Pedigree Tree ─── */}
              {(l.sire || l.dam) && (
                <PassportSection
                  icon={<Users className="h-4 w-4" />}
                  title="Pedigree"
                  verificationLevel={l.registration_number ? "registry_verified" : "self_reported"}
                >
                  <div className="overflow-x-auto">
                    <div className="min-w-[500px] py-2">
                      {/* 3-generation pedigree tree: left-to-right */}
                      <div className="flex items-center gap-0">

                        {/* Column 1: Horse */}
                        <div className="flex w-[140px] flex-shrink-0 flex-col items-center">
                          <PedigreeNode
                            name={l.name}
                            detail={l.breed || undefined}
                            variant="primary"
                          />
                        </div>

                        {/* Connector lines to parents */}
                        <div className="flex w-8 flex-shrink-0 flex-col items-center">
                          <div className="h-[1px] w-full bg-crease-mid" />
                        </div>

                        {/* Column 2: Parents */}
                        <div className="flex w-[140px] flex-shrink-0 flex-col gap-8">
                          {/* Sire */}
                          <div className="relative">
                            <PedigreeNode
                              name={l.sire || "Unknown"}
                              detail="Sire"
                              variant={l.sire ? "default" : "unknown"}
                            />
                            {/* Vertical line connecting sire to dam */}
                            <div className="absolute -bottom-8 left-1/2 h-8 w-[1px] bg-crease-mid" />
                            {/* Horizontal line from center of connecting column to sire */}
                            <div className="absolute top-1/2 -left-8 h-[1px] w-8 bg-crease-mid" />
                          </div>
                          {/* Dam */}
                          <div className="relative">
                            <PedigreeNode
                              name={l.dam || "Unknown"}
                              detail="Dam"
                              variant={l.dam ? "default" : "unknown"}
                            />
                            {/* Horizontal line from center of connecting column to dam */}
                            <div className="absolute top-1/2 -left-8 h-[1px] w-8 bg-crease-mid" />
                          </div>
                        </div>

                        {/* Connector lines to grandparents */}
                        <div className="flex w-8 flex-shrink-0 flex-col items-center">
                          <div className="h-[1px] w-full bg-crease-light" />
                        </div>

                        {/* Column 3: Grandparents */}
                        <div className="flex w-[140px] flex-shrink-0 flex-col gap-3">
                          <div className="relative">
                            <PedigreeNode name="—" detail="Sire's Sire" variant="unknown" size="sm" />
                            <div className="absolute top-1/2 -left-8 h-[1px] w-8 bg-crease-light" />
                          </div>
                          <div className="relative">
                            <PedigreeNode name="—" detail="Sire's Dam" variant="unknown" size="sm" />
                            <div className="absolute top-1/2 -left-8 h-[1px] w-8 bg-crease-light" />
                          </div>

                          <div className="h-2" /> {/* spacer between sire/dam lines */}

                          <div className="relative">
                            <PedigreeNode name="—" detail="Dam's Sire" variant="unknown" size="sm" />
                            <div className="absolute top-1/2 -left-8 h-[1px] w-8 bg-crease-light" />
                          </div>
                          <div className="relative">
                            <PedigreeNode name="—" detail="Dam's Dam" variant="unknown" size="sm" />
                            <div className="absolute top-1/2 -left-8 h-[1px] w-8 bg-crease-light" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-ink-light">
                    Grandparent data will be populated when registry records are linked.
                  </p>
                </PassportSection>
              )}

              {/* ─── SECTION 2B: Bloodline Explorer ─── */}
              {(l.sire || l.dam) && (
                <PassportSection
                  icon={<Users className="h-4 w-4" />}
                  title="Bloodline Explorer"
                  verificationLevel={l.registration_number ? "registry_verified" : "self_reported"}
                >
                  <BloodlineExplorer horseName={l.name} />
                </PassportSection>
              )}

              {/* ─── SECTION 3: Ownership History ─── */}
              <PassportSection
                icon={<BookOpen className="h-4 w-4" />}
                title="Ownership History"
                verificationLevel="self_reported"
              >
                <div className="space-y-0">
                  {/* Current Owner */}
                  <OwnershipEntry
                    label="Current Owner"
                    name={l.seller?.display_name || l.seller?.full_name || "Current Owner"}
                    duration={
                      l.years_with_current_owner != null
                        ? `${l.years_with_current_owner} year${l.years_with_current_owner !== 1 ? "s" : ""}`
                        : undefined
                    }
                    location={
                      l.location_state
                        ? l.location_city
                          ? `${l.location_city}, ${l.location_state}`
                          : l.location_state
                        : undefined
                    }
                    isCurrent
                  />

                  {/* Previous owners — sample data based on listing fields */}
                  {l.number_of_previous_owners != null && l.number_of_previous_owners > 0 && (
                    <>
                      {Array.from({ length: Math.min(l.number_of_previous_owners, 2) }).map((_, i) => (
                        <OwnershipEntry
                          key={i}
                          label={`Previous Owner ${i + 1}`}
                          name="(Records available upon request)"
                          isCurrent={false}
                        />
                      ))}
                    </>
                  )}

                  {l.number_of_previous_owners == null && (
                    <p className="mt-2 text-sm text-ink-light">
                      Previous ownership records not provided.
                    </p>
                  )}
                </div>
              </PassportSection>

              {/* ─── SECTION 4: Health Timeline ─── */}
              <PassportSection
                icon={<Activity className="h-4 w-4" />}
                title="Health Timeline"
                verificationLevel={l.coggins_date ? "vet_verified" : "self_reported"}
              >
                {healthEvents.length > 0 ? (
                  <div className="space-y-0">
                    {healthEvents.map((evt, i) => (
                      <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                        {/* Timeline line */}
                        {i < healthEvents.length - 1 && (
                          <div className="absolute left-[5px] top-4 h-full w-[1px] bg-crease-light" />
                        )}
                        <TimelineDot color={evt.color} />
                        <div className="flex-1 -mt-0.5">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-sm font-medium text-ink-dark">
                              {evt.label}
                            </p>
                            <span className="flex-shrink-0 text-xs text-ink-light">
                              {evt.date}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-ink-mid">{evt.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-light">
                    No health records have been provided for this listing. Request
                    records from the seller before purchasing.
                  </p>
                )}

                {/* Additional health notes */}
                {(l.known_health_issues || l.lameness_history || l.surgical_history || l.allergies || l.medications) && (
                  <div className="mt-6 rounded-md border border-crease-light bg-paper-cream p-4">
                    <p className="overline mb-2 text-ink-light">Health Notes</p>
                    <div className="space-y-2">
                      {l.known_health_issues && (
                        <HealthNote label="Known Issues" value={l.known_health_issues} />
                      )}
                      {l.lameness_history && (
                        <HealthNote label="Lameness History" value={l.lameness_history} />
                      )}
                      {l.surgical_history && (
                        <HealthNote label="Surgical History" value={l.surgical_history} />
                      )}
                      {l.allergies && (
                        <HealthNote label="Allergies" value={l.allergies} />
                      )}
                      {l.medications && (
                        <HealthNote label="Medications" value={l.medications} />
                      )}
                    </div>
                  </div>
                )}
              </PassportSection>

              {/* ─── SECTION 5: Show History ─── */}
              {(l.show_experience || l.show_record) && (
                <PassportSection
                  icon={<Award className="h-4 w-4" />}
                  title="Show History"
                  verificationLevel={l.usef_number ? "registry_verified" : "self_reported"}
                >
                  {l.show_experience && (
                    <div className="mb-4">
                      <p className="overline mb-1 text-ink-light">Experience</p>
                      <p className="whitespace-pre-line text-sm text-ink-mid">
                        {l.show_experience}
                      </p>
                    </div>
                  )}

                  {l.show_record && (
                    <div className="rounded-md border border-crease-light bg-paper-cream p-4">
                      <p className="overline mb-2 text-ink-light">Show Record</p>
                      <p className="whitespace-pre-line text-sm text-ink-mid">
                        {l.show_record}
                      </p>
                    </div>
                  )}

                  {l.competition_divisions && (
                    <div className="mt-4">
                      <p className="overline mb-1 text-ink-light">Divisions</p>
                      <p className="text-sm text-ink-mid">{l.competition_divisions}</p>
                    </div>
                  )}

                  {l.level && (
                    <div className="mt-4">
                      <p className="overline mb-1 text-ink-light">Level</p>
                      <p className="text-sm text-ink-mid">{l.level}</p>
                    </div>
                  )}

                  {/* Competition IDs */}
                  {(l.usef_number || l.usdf_number || l.fei_id) && (
                    <div className="mt-4 flex flex-wrap gap-4">
                      {l.usef_number && (
                        <div>
                          <p className="text-xs text-ink-light">USEF</p>
                          <p className="text-sm font-medium text-ink-dark">{l.usef_number}</p>
                        </div>
                      )}
                      {l.usdf_number && (
                        <div>
                          <p className="text-xs text-ink-light">USDF</p>
                          <p className="text-sm font-medium text-ink-dark">{l.usdf_number}</p>
                        </div>
                      )}
                      {l.fei_id && (
                        <div>
                          <p className="text-xs text-ink-light">FEI</p>
                          <p className="text-sm font-medium text-ink-dark">{l.fei_id}</p>
                        </div>
                      )}
                    </div>
                  )}
                </PassportSection>
              )}

              {/* ─── SECTION 6: Training Log ─── */}
              {l.training_history && (
                <PassportSection
                  icon={<Calendar className="h-4 w-4" />}
                  title="Training Log"
                  verificationLevel="self_reported"
                >
                  <div className="rounded-md border border-crease-light bg-paper-cream p-4">
                    <p className="whitespace-pre-line text-sm text-ink-mid">
                      {l.training_history}
                    </p>
                  </div>

                  {l.current_trainer && (
                    <div className="mt-4">
                      <p className="overline mb-1 text-ink-light">Current Trainer</p>
                      <p className="text-sm text-ink-dark">{l.current_trainer}</p>
                    </div>
                  )}

                  {l.current_rider && (
                    <div className="mt-3">
                      <p className="overline mb-1 text-ink-light">Current Rider</p>
                      <p className="text-sm text-ink-dark">{l.current_rider}</p>
                    </div>
                  )}
                </PassportSection>
              )}

              {/* ─── SECTION 7: Body Condition History ─── */}
              <PassportSection
                icon={<BarChart3 className="h-4 w-4" />}
                title="Body Condition History"
                verificationLevel="vet_verified"
              >
                <HennekeBCSHistory
                  entries={sampleBCSHistory}
                  currentScore={5}
                />
              </PassportSection>

              {/* ─── SECTION 8: Farrier & Hoof Care ─── */}
              <PassportSection
                icon={<Scissors className="h-4 w-4" />}
                title="Farrier & Hoof Care"
                verificationLevel="self_reported"
              >
                <FarrierLog
                  entries={sampleFarrierEntries}
                  nextDue="2026-03-15"
                />
              </PassportSection>

              {/* ─── SECTION 9: Document Vault ─── */}
              <PassportSection
                icon={<FileText className="h-4 w-4" />}
                title="Document Vault"
                verificationLevel="document_verified"
              >
                <DocumentVault documents={sampleDocuments} isOwner={false} />
              </PassportSection>

              {/* ─── QR CODE + SHARE CONTROLS ─── */}
              <div className="crease-divider" />
              <div className="grid gap-6 sm:grid-cols-2">
                <PassportQRCode
                  passportId={passportId}
                  horseName={l.name}
                  passportUrl={`https://mane-ex.vercel.app/horses/${l.slug}/passport`}
                />
                <div className="flex flex-col justify-center">
                  <h3 className="mb-2 font-heading text-base font-semibold text-ink-black">
                    Share this Passport
                  </h3>
                  <p className="mb-4 text-sm text-ink-mid">
                    Send to your trainer, vet, or potential buyers. Print the QR
                    code for barn use or show documentation.
                  </p>
                  <PassportShareControls
                    passportUrl={`https://mane-ex.vercel.app/horses/${l.slug}/passport`}
                    horseName={l.name}
                    passportId={passportId}
                  />
                </div>
              </div>

              {/* ─── FOOTER DISCLAIMER ─── */}
              <div className="crease-divider" />
              <div className="rounded-md bg-paper-warm p-4 text-xs text-ink-light">
                <p className="font-medium text-ink-mid">Disclaimer</p>
                <p className="mt-1">
                  This Digital Passport compiles information provided by the seller.
                  ManeExchange has not independently verified the accuracy, completeness,
                  or authenticity of any data herein. A pre-purchase exam (PPE) by a
                  licensed veterinarian is strongly recommended before any transaction.
                  Registry records and pedigree data should be confirmed directly with
                  the relevant governing body.
                </p>
              </div>
            </div>

            {/* ── DOCUMENT FOOTER ── */}
            <div className="border-t border-crease-light bg-paper-warm px-6 py-4 sm:px-8">
              <div className="flex items-center justify-between text-xs text-ink-light">
                <span>
                  Issued by ManeExchange
                </span>
                <span>
                  {passportId}
                </span>
              </div>
            </div>
          </div>

          {/* Back to listing link */}
          <div className="mt-6 text-center">
            <Link
              href={`/horses/${l.slug}`}
              className="inline-flex items-center gap-1 text-sm text-blue hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              Return to listing
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ════════════════════════════════════════════
   Helper Components
   ════════════════════════════════════════════ */

function StatField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-paper-cream px-3 py-2">
      <p className="text-[11px] uppercase tracking-wider text-ink-light">{label}</p>
      <p className="text-sm font-medium text-ink-dark">{value}</p>
    </div>
  );
}

function PedigreeNode({
  name,
  detail,
  variant = "default",
  size = "md",
}: {
  name: string;
  detail?: string;
  variant?: "primary" | "default" | "unknown";
  size?: "sm" | "md";
}) {
  const bgClass =
    variant === "primary"
      ? "bg-paper-warm border-crease-mid"
      : variant === "unknown"
        ? "bg-paper-cream border-crease-light border-dashed"
        : "bg-paper-cream border-crease-mid";

  const textClass =
    variant === "unknown" ? "text-ink-light italic" : "text-ink-dark";

  const padClass = size === "sm" ? "px-2 py-1.5" : "px-3 py-2";

  return (
    <div className={`w-full rounded-md border ${bgClass} ${padClass}`}>
      <p className={`text-sm font-medium ${textClass} ${size === "sm" ? "text-xs" : ""}`}>
        {name}
      </p>
      {detail && (
        <p className={`text-ink-light ${size === "sm" ? "text-[10px]" : "text-[11px]"}`}>
          {detail}
        </p>
      )}
    </div>
  );
}

function OwnershipEntry({
  label,
  name,
  duration,
  location,
  isCurrent,
}: {
  label: string;
  name: string;
  duration?: string;
  location?: string;
  isCurrent: boolean;
}) {
  return (
    <div className="relative flex gap-4 pb-5 last:pb-0">
      {/* Vertical timeline line */}
      <div className="relative flex flex-col items-center">
        <div
          className={`h-3 w-3 rounded-full ring-2 ring-paper-white ${
            isCurrent ? "bg-forest" : "bg-ink-faint"
          }`}
        />
        <div className="mt-1 h-full w-[1px] bg-crease-light last:hidden" />
      </div>
      <div className="flex-1 -mt-0.5">
        <p className="text-[11px] uppercase tracking-wider text-ink-light">{label}</p>
        <p className="text-sm font-medium text-ink-dark">{name}</p>
        {duration && (
          <p className="text-xs text-ink-mid">{duration} ownership</p>
        )}
        {location && (
          <p className="flex items-center gap-1 text-xs text-ink-mid">
            <MapPin className="h-3 w-3" />
            {location}
          </p>
        )}
      </div>
    </div>
  );
}

function HealthNote({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-dark">{label}</p>
      <p className="text-sm text-ink-mid">{value}</p>
    </div>
  );
}
