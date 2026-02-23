export type OfferStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "countered"
  | "expired"
  | "withdrawn"
  | "in_escrow";

export type EscrowStatus =
  | "awaiting_payment"
  | "payment_processing"
  | "funds_held"
  | "delivery_confirmed"
  | "dispute_opened"
  | "funds_released"
  | "funds_refunded";

export type PaymentMethod = "ach" | "card";

export interface Offer {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount_cents: number;
  message: string | null;
  payment_method: PaymentMethod;
  parent_offer_id: string | null;
  counter_amount_cents: number | null;
  status: OfferStatus;
  expires_at: string;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EscrowStatusHistoryEntry {
  status: EscrowStatus;
  previous_status: EscrowStatus | null;
  timestamp: string;
  note: string;
}

export interface EscrowTransaction {
  id: string;
  offer_id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount_cents: number;
  platform_fee_cents: number;
  seller_net_cents: number;
  trainer_commission_cents: number;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_transfer_id: string | null;
  stripe_refund_id: string | null;
  payment_method: PaymentMethod;
  status: EscrowStatus;
  status_history: EscrowStatusHistoryEntry[];
  shipping_tracking: string | null;
  expected_delivery_date: string | null;
  delivery_confirmed_at: string | null;
  delivery_confirmed_by: string | null;
  dispute_reason: string | null;
  dispute_opened_at: string | null;
  dispute_resolved_at: string | null;
  auto_release_at: string | null;
  bill_of_sale_data: BillOfSaleData | null;
  bill_of_sale_accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

// Structured Bill of Sale data (stored as JSONB)
export interface BillOfSaleData {
  // Parties
  buyer_name: string;
  buyer_address: string;
  buyer_state: string;
  seller_name: string;
  seller_address: string;
  seller_state: string;

  // Horse
  horse_name: string;
  horse_breed: string | null;
  horse_registered_name: string | null;
  horse_registration_number: string | null;
  horse_color: string | null;
  horse_gender: string | null;
  horse_date_of_birth: string | null;
  horse_height_hands: number | null;

  // Transaction
  sale_price_cents: number;
  warranty_type: string;
  payment_method: string;

  // Compliance
  fl_medical_disclosure: string | null;
  commission_disclosed: boolean;
  commission_amount: string | null;
  trainer_name: string | null;
  dual_agency_disclosed: boolean;

  // Disclaimers
  platform_disclaimer: string;
  warranty_disclaimer: string;
  inspection_acknowledgment: boolean;

  // Timestamps
  generated_at: string;
  accepted_by_buyer_at: string | null;
  accepted_by_seller_at: string | null;
}

// Offer with joined listing and participant info for display
export interface OfferWithDetails extends Offer {
  listing: {
    id: string;
    name: string;
    slug: string;
    price: number | null;
    breed: string | null;
    location_state: string | null;
    completeness_score: number;
    warranty: string;
    primary_image_url: string | null;
  };
  buyer: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    location_state: string | null;
  };
  seller: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    stripe_onboarding_complete: boolean;
  };
  escrow: EscrowTransaction | null;
  counter_offers: Offer[];
}

// Escrow timeline step for UI display
export interface EscrowTimelineStep {
  label: string;
  status: "completed" | "active" | "upcoming";
  timestamp: string | null;
  description: string;
}
