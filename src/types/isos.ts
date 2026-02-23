export type IsoStatus = "active" | "paused" | "fulfilled" | "expired" | "closed";
export type IsoMatchStatus = "pending" | "viewed" | "interested" | "dismissed";

export interface IsoPost {
  id: string;
  user_id: string;
  title: string;
  description: string;
  discipline_ids: string[];
  min_price: number | null;
  max_price: number | null;
  min_height_hands: number | null;
  max_height_hands: number | null;
  min_age: number | null;
  max_age: number | null;
  gender: string[];
  breeds: string[];
  preferred_states: string[];
  level: string | null;
  status: IsoStatus;
  match_count: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface IsoMatch {
  id: string;
  iso_id: string;
  listing_id: string;
  matched_by: string;
  message: string | null;
  status: IsoMatchStatus;
  created_at: string;
}

// ISO with author info for browse page
export interface IsoPostWithAuthor extends IsoPost {
  author: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    city: string | null;
    state: string | null;
  };
  disciplines: { id: string; name: string; slug: string }[];
}

// ISO match with listing data for display
export interface IsoMatchWithDetails extends IsoMatch {
  listing: {
    id: string;
    name: string;
    slug: string;
    breed: string | null;
    price: number | null;
    height_hands: number | null;
    age_years: number | null;
    location_state: string | null;
    primary_image_url: string | null;
  };
  matcher: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

// ISO tier limits
export const ISO_TIER_LIMITS = {
  basic: { can_create: true, max_active: 1, responses_per_month: 0 },
  standard: { can_create: true, max_active: 3, responses_per_month: 5 },
  premium: { can_create: true, max_active: 10, responses_per_month: -1 }, // -1 = unlimited
} as const;
