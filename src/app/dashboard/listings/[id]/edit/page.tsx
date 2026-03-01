import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ListingWizard } from "../../new/wizard";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Edit Listing",
};

type Props = {
  params: Promise<{ id: string }>;
};

/** Fields from the DB row that map directly to wizard form fields. */
const FORM_FIELDS = [
  "name", "breed", "registered_name", "registration_number", "registry",
  "gender", "color", "date_of_birth", "height_hands", "sire", "dam",
  "location_city", "location_state", "location_zip", "barn_name",
  "current_rider", "current_trainer", "turnout_schedule", "feeding_program",
  "shoeing_schedule", "supplements",
  "discipline_ids", "level", "show_experience", "show_record",
  "competition_divisions", "usef_number", "usdf_number", "fei_id",
  "vet_name", "vet_phone", "last_vet_check", "vaccination_status",
  "dental_date", "coggins_date", "coggins_expiry", "known_health_issues",
  "medications", "recent_medical_treatments", "lameness_history",
  "surgical_history", "allergies", "henneke_score", "soundness_level",
  "years_with_current_owner", "number_of_previous_owners", "reason_for_sale",
  "training_history", "temperament", "vices", "suitable_for", "good_with",
  "price", "price_display", "price_negotiable", "warranty",
  "lease_available", "lease_terms", "seller_state", "fl_medical_disclosure",
  "dual_agency_disclosed", "commission_disclosed", "commission_amount",
  "trainer_commission_consent",
] as const;

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return notFound();

  const { data: listing } = await supabase
    .from("horse_listings")
    .select("*")
    .eq("id", id)
    .eq("seller_id", user.id)
    .single();

  if (!listing) return notFound();

  if (listing.status === "removed") return notFound();

  // Fetch registry records for this listing
  const { data: registryRecords } = await supabase
    .from("listing_registry_records")
    .select("*")
    .eq("listing_id", id)
    .order("created_at");

  // Extract only the form-relevant fields, converting price from cents to dollars
  const initialData: Record<string, unknown> = {};
  for (const key of FORM_FIELDS) {
    const value = (listing as Record<string, unknown>)[key];
    if (value != null && value !== "") {
      if (key === "price" && typeof value === "number") {
        initialData[key] = value / 100; // cents → dollars for the form
      } else {
        initialData[key] = value;
      }
    }
  }

  // Map DB records to RegistryRecord shape for the component
  if (registryRecords?.length) {
    initialData.registry_records = registryRecords.map((r) => ({
      registry: r.registry.toLowerCase(),
      registrationNumber: r.registry_number || "",
      registeredName: r.registered_name || undefined,
      verificationStatus: r.status || "unverified",
      verifiedAt: r.verified_at || undefined,
    }));
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/listings"
          className="mb-2 inline-flex items-center text-sm text-ink-mid hover:text-ink-dark"
        >
          <ChevronLeft className="mr-0.5 h-4 w-4" />
          Back to listings
        </Link>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
          Edit Listing
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          Update {listing.name} — changes are saved without affecting listing status.
        </p>
      </div>
      <ListingWizard mode="edit" listingId={id} initialData={initialData} />
    </div>
  );
}
