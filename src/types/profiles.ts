export interface ProfilePhoto {
  id: string;
  user_id: string;
  url: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  is_avatar: boolean;
  is_cover: boolean;
  width: number | null;
  height: number | null;
  file_size: number | null;
  created_at: string;
}

export interface ProfileWithPhotos {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  phone: string | null;
  role: string;
  seller_tier: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string;
  bio: string | null;
  website_url: string | null;
  instagram_handle: string | null;
  disciplines: string[];
  min_budget: number | null;
  max_budget: number | null;
  profile_complete: boolean;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}
