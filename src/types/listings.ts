export type ListingStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "under_offer"
  | "sold"
  | "expired"
  | "removed";

export type WarrantyType = "as_is" | "sound_at_sale" | "sound_for_use";

export interface ListingRegistryRecord {
  id: string;
  listing_id: string;
  registry: string;
  registry_number: string;
  registered_name: string | null;
  status: string;
  verified_at: string | null;
  notes: string | null;
}
export type HorseGender = "mare" | "gelding" | "stallion";
export type MediaType = "photo" | "video";
export type DocumentType =
  | "coggins"
  | "ppe_report"
  | "registration"
  | "vet_records"
  | "show_records"
  | "insurance"
  | "bill_of_sale"
  | "other";
export type DocumentVisibility = "public" | "on_request" | "private" | "escrow_only";
export type CompletenessGrade = "excellent" | "good" | "fair" | "incomplete";
export type SoundnessLevel = "vet_confirmed_sound" | "minor_findings" | "managed_condition" | "not_assessed";

export interface Discipline {
  id: string;
  name: string;
  slug: string;
  category: string;
  sort_order: number;
}

export interface HorseListing {
  id: string;
  seller_id: string;
  farm_id: string | null;
  status: ListingStatus;
  slug: string;

  // Basic Info
  name: string;
  breed: string | null;
  registered_name: string | null;
  registration_number: string | null;
  registry: string | null;
  gender: HorseGender | null;
  color: string | null;
  date_of_birth: string | null;
  age_years: number | null;
  height_hands: number | null;
  sire: string | null;
  dam: string | null;

  // Farm Life
  location_city: string | null;
  location_state: string | null;
  location_zip: string | null;
  location_country: string;
  barn_name: string | null;
  current_rider: string | null;
  current_trainer: string | null;
  turnout_schedule: string | null;
  feeding_program: string | null;
  shoeing_schedule: string | null;
  supplements: string | null;

  // Show Info
  discipline_ids: string[];
  level: string | null;
  show_experience: string | null;
  show_record: string | null;
  competition_divisions: string | null;
  usef_number: string | null;
  usdf_number: string | null;
  fei_id: string | null;

  // Vet Info
  vet_name: string | null;
  vet_phone: string | null;
  last_vet_check: string | null;
  vaccination_status: string | null;
  dental_date: string | null;
  coggins_date: string | null;
  coggins_expiry: string | null;
  known_health_issues: string | null;
  medications: string | null;
  recent_medical_treatments: string | null;
  lameness_history: string | null;
  surgical_history: string | null;
  allergies: string | null;
  henneke_score: number | null;
  soundness_level: SoundnessLevel | null;

  // History
  description: string | null;
  years_with_current_owner: number | null;
  number_of_previous_owners: number | null;
  reason_for_sale: string | null;
  training_history: string | null;
  temperament: string | null;
  vices: string | null;
  suitable_for: string | null;
  good_with: string | null;

  // Trial
  trial_available: boolean;
  trial_location: string | null;

  // Verification badges
  has_current_coggins: boolean;
  has_vet_check_available: boolean;

  // Pricing
  listing_type: "fixed_price" | "price_on_inquiry" | "for_lease" | "auction";
  price: number | null;
  price_display: string | null;
  price_negotiable: boolean;
  warranty: WarrantyType;
  lease_available: boolean;
  lease_terms: string | null;

  // Seller Info
  seller_role: "owner" | "trainer" | "agent" | "dealer" | null;
  contact_preference: "email_only" | "phone_only" | "email_and_phone";

  // Compliance
  seller_state: string | null;
  fl_medical_disclosure: string | null;
  dual_agency_disclosed: boolean;
  commission_disclosed: boolean;
  commission_amount: string | null;
  trainer_commission_consent: boolean;

  // Score
  completeness_score: number;
  completeness_grade: CompletenessGrade;
  basics_score: number | null;
  details_score: number | null;
  trust_score: number | null;
  media_score: number | null;

  // Counters
  view_count: number;
  favorite_count: number;
  inquiry_count: number;

  // Timestamps
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingMedia {
  id: string;
  listing_id: string;
  type: MediaType;
  url: string;
  storage_path: string | null;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
  is_primary: boolean;
  width: number | null;
  height: number | null;
  file_size: number | null;
  created_at: string;
}

export interface ListingDocument {
  id: string;
  listing_id: string;
  type: DocumentType;
  visibility: DocumentVisibility;
  name: string;
  url: string;
  storage_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
  expiry_date: string | null;
  notes: string | null;
}

// Listing with joined media for display
export interface ListingWithMedia extends HorseListing {
  media: ListingMedia[];
  primary_image: ListingMedia | null;
  seller: {
    id: string;
    display_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
    seller_tier: string;
    identity_verified: boolean;
  };
  disciplines: Discipline[];
}

// Wizard form state (client-side)
export interface ListingWizardState {
  currentStep: number;
  data: Partial<HorseListing>;
  media: File[];
  documents: File[];
  errors: Record<string, string>;
  isDirty: boolean;
}

export type WizardStep =
  | "basic"
  | "farm-life"
  | "show"
  | "vet"
  | "media"
  | "verification"
  | "history"
  | "pricing";

export const WIZARD_STEPS: { key: WizardStep; label: string; number: number }[] = [
  { key: "basic", label: "Basic Info", number: 1 },
  { key: "farm-life", label: "Barn Life", number: 2 },
  { key: "show", label: "Show Info", number: 3 },
  { key: "vet", label: "Vet Info", number: 4 },
  { key: "media", label: "Media", number: 5 },
  { key: "verification", label: "Verification", number: 6 },
  { key: "history", label: "History", number: 7 },
  { key: "pricing", label: "Pricing", number: 8 },
];
