export interface FeedListing {
  id: string;
  name: string;
  slug: string;
  breed: string | null;
  price: number | null;
  height_hands: number | null;
  location_state: string | null;
  primary_image_url: string | null;
  seller_id: string;
  created_at: string;
  view_count: number;
  favorite_count: number;
}

export interface TrendingListing extends FeedListing {
  trending_score: number;
}

export type FeedSection = "new_this_week" | "trending" | "just_sold" | "for_you";

export interface FeedSectionData {
  type: FeedSection;
  title: string;
  listings: FeedListing[];
}
