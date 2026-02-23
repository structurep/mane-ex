import { z } from "zod";

// Step 1: Basic Info
export const basicInfoSchema = z.object({
  name: z.string().min(2, "Horse name is required"),
  breed: z.string().optional(),
  registered_name: z.string().optional(),
  registration_number: z.string().optional(),
  registry: z.string().optional(),
  gender: z.enum(["mare", "gelding", "stallion"]).optional(),
  color: z.string().optional(),
  date_of_birth: z.string().optional(),
  height_hands: z.coerce.number().min(8).max(20).optional(),
  sire: z.string().optional(),
  dam: z.string().optional(),
});

// Step 2: Farm Life
export const farmLifeSchema = z.object({
  location_city: z.string().optional(),
  location_state: z.string().optional(),
  location_zip: z.string().optional(),
  barn_name: z.string().optional(),
  current_rider: z.string().optional(),
  current_trainer: z.string().optional(),
  turnout_schedule: z.string().optional(),
  feeding_program: z.string().optional(),
  shoeing_schedule: z.string().optional(),
  supplements: z.string().optional(),
});

// Step 3: Show Info
export const showInfoSchema = z.object({
  discipline_ids: z.array(z.string()).optional(),
  level: z.string().optional(),
  show_experience: z.string().optional(),
  show_record: z.string().optional(),
  competition_divisions: z.string().optional(),
  usef_number: z.string().optional(),
  usdf_number: z.string().optional(),
  fei_id: z.string().optional(),
});

// Step 4: Vet Info
export const vetInfoSchema = z.object({
  vet_name: z.string().optional(),
  vet_phone: z.string().optional(),
  last_vet_check: z.string().optional(),
  vaccination_status: z.string().optional(),
  dental_date: z.string().optional(),
  coggins_date: z.string().optional(),
  coggins_expiry: z.string().optional(),
  known_health_issues: z.string().optional(),
  medications: z.string().optional(),
  recent_medical_treatments: z.string().optional(),
  lameness_history: z.string().optional(),
  surgical_history: z.string().optional(),
  allergies: z.string().optional(),
});

// Step 5: Media (validated separately — file uploads)

// Step 6: History
export const historySchema = z.object({
  years_with_current_owner: z.coerce.number().int().min(0).optional(),
  number_of_previous_owners: z.coerce.number().int().min(0).optional(),
  reason_for_sale: z.string().optional(),
  training_history: z.string().optional(),
  temperament: z.string().optional(),
  vices: z.string().optional(),
  suitable_for: z.string().optional(),
  good_with: z.string().optional(),
});

// Step 7: Pricing
export const pricingSchema = z.object({
  price: z.coerce.number().int().min(100, "Price must be at least $1.00").optional(),
  price_display: z.enum(["exact", "range", "contact"]).default("exact"),
  price_negotiable: z.boolean().default(true),
  warranty: z.enum(["as_is", "sound_at_sale", "sound_for_use"]).default("as_is"),
  lease_available: z.boolean().default(false),
  lease_terms: z.string().optional(),
  // State compliance
  seller_state: z.string().optional(),
  fl_medical_disclosure: z.string().optional(),
  dual_agency_disclosed: z.boolean().default(false),
  commission_disclosed: z.boolean().default(false),
  commission_amount: z.string().optional(),
  trainer_commission_consent: z.boolean().default(false),
});

// Full listing schema (for final submit)
export const fullListingSchema = basicInfoSchema
  .merge(farmLifeSchema)
  .merge(showInfoSchema)
  .merge(vetInfoSchema)
  .merge(historySchema)
  .merge(pricingSchema);

export type ListingFormData = z.infer<typeof fullListingSchema>;
