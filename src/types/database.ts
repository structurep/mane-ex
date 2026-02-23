export type UserRole = "buyer" | "seller" | "trainer" | "admin";
export type SellerTier = "basic" | "standard" | "premium";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  seller_tier: SellerTier;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string;
  tax_id_collected: boolean;
  identity_verified: boolean;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  disciplines: string[];
  min_budget: number | null;
  max_budget: number | null;
  bio: string | null;
  website_url: string | null;
  instagram_handle: string | null;
  profile_complete: boolean;
  created_at: string;
  updated_at: string;
}
