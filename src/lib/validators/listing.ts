import { z } from "zod";

// Step 1: Basic Info
export const basicInfoSchema = z.object({
  name: z.string().min(2, "Horse name is required").max(100, "Name cannot exceed 100 characters"),
  breed: z.string().max(100).optional(),
  registered_name: z.string().max(200).optional(),
  registration_number: z.string().max(50).optional(),
  registry: z.string().max(50).optional(),
  gender: z.enum(["mare", "gelding", "stallion"]).optional(),
  color: z.string().max(200).optional(),
  date_of_birth: z.string().max(200).optional(),
  height_hands: z.coerce.number().min(8).max(20).optional(),
  sire: z.string().max(200).optional(),
  dam: z.string().max(200).optional(),
  is_microchipped: z.boolean().default(false),
});

// Step 2: Farm Life
export const farmLifeSchema = z.object({
  location_city: z.string().max(200).optional(),
  location_state: z.string().max(200).optional(),
  location_zip: z.string().max(200).optional(),
  trial_available: z.boolean().default(false),
  trial_location: z.string().max(200).optional(),
  barn_name: z.string().max(200).optional(),
  current_rider: z.string().max(200).optional(),
  current_trainer: z.string().max(200).optional(),
  turnout_schedule: z.string().max(2000).optional(),
  feeding_program: z.string().max(2000).optional(),
  shoeing_schedule: z.string().max(2000).optional(),
  supplements: z.string().max(2000).optional(),
});

// Step 3: Show Info
export const showInfoSchema = z.object({
  discipline_ids: z.array(z.string()).optional(),
  level: z.string().max(200).optional(),
  show_experience: z.string().max(2000).optional(),
  show_record: z.string().max(2000).optional(),
  competition_divisions: z.string().max(2000).optional(),
  usef_number: z.string().max(200).optional(),
  usdf_number: z.string().max(200).optional(),
  fei_id: z.string().max(200).optional(),
});

// Step 4: Vet Info
export const vetInfoSchema = z.object({
  vet_name: z.string().max(200).optional(),
  vet_phone: z.string().max(200).optional(),
  last_vet_check: z.string().max(200).optional(),
  vaccination_status: z.string().max(200).optional(),
  dental_date: z.string().max(200).optional(),
  coggins_date: z.string().max(200).optional(),
  coggins_expiry: z.string().max(200).optional(),
  known_health_issues: z.string().max(2000).optional(),
  medications: z.string().max(2000).optional(),
  recent_medical_treatments: z.string().max(2000).optional(),
  lameness_history: z.string().max(2000).optional(),
  surgical_history: z.string().max(2000).optional(),
  allergies: z.string().max(2000).optional(),
  henneke_score: z.coerce.number().int().min(1).max(9).optional(),
  soundness_level: z.enum(["vet_confirmed_sound", "minor_findings", "managed_condition", "not_assessed"]).optional(),
});

// Step 5: Media (validated separately — file uploads)

// Step 6: Verification
export const verificationSchema = z.object({
  has_current_coggins: z.boolean().default(false),
  has_vet_check_available: z.boolean().default(false),
});

// Step 7: History
export const historySchema = z.object({
  description: z.string().max(5000, "Description cannot exceed 5,000 characters").optional(),
  years_with_current_owner: z.coerce.number().int().min(0).optional(),
  number_of_previous_owners: z.coerce.number().int().min(0).optional(),
  reason_for_sale: z.string().max(1000).optional(),
  training_history: z.string().max(2000).optional(),
  temperament: z.string().max(1000).optional(),
  vices: z.string().max(1000).optional(),
  suitable_for: z.string().max(500).optional(),
  good_with: z.string().max(500).optional(),
});

// Step 7: Pricing
export const pricingSchema = z.object({
  listing_type: z.enum(["fixed_price", "price_on_inquiry", "for_lease", "auction"]).default("fixed_price"),
  price: z.coerce.number().int().min(100, "Price must be at least $1.00").optional(),
  price_display: z.enum(["exact", "range", "contact"]).default("exact"),
  price_negotiable: z.boolean().default(true),
  warranty: z.enum(["as_is", "sound_at_sale", "sound_for_use"]).default("as_is"),
  lease_available: z.boolean().default(false),
  lease_terms: z.string().max(2000).optional(),
  // Seller info
  seller_role: z.enum(["owner", "trainer", "agent", "dealer"]).optional(),
  contact_preference: z.enum(["email_only", "phone_only", "email_and_phone"]).default("email_and_phone"),
  // State compliance
  seller_state: z.string().max(200).optional(),
  fl_medical_disclosure: z.string().max(2000).optional(),
  dual_agency_disclosed: z.boolean().default(false),
  commission_disclosed: z.boolean().default(false),
  commission_amount: z.string().max(200).optional(),
  trainer_commission_consent: z.boolean().default(false),
});

// Full listing schema (for final submit)
export const fullListingSchema = basicInfoSchema
  .merge(farmLifeSchema)
  .merge(showInfoSchema)
  .merge(vetInfoSchema)
  .merge(verificationSchema)
  .merge(historySchema)
  .merge(pricingSchema)
  .extend({
    media_checklist: z.object({
      angles: z.array(z.string()).default([]),
      videos: z.array(z.string()).default([]),
    }).optional(),
  });

export type ListingFormData = z.infer<typeof fullListingSchema>;
