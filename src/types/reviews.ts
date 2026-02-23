export type ReviewStage = "inquiry" | "trial" | "offer" | "completion";

export interface Review {
  id: string;
  reviewer_id: string;
  seller_id: string;
  listing_id: string | null;
  offer_id: string | null;
  stage: ReviewStage;
  rating: number;
  title: string | null;
  body: string;
  seller_response: string | null;
  seller_responded_at: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

// Review with reviewer profile for display
export interface ReviewWithAuthor extends Review {
  reviewer: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    city: string | null;
    state: string | null;
  };
}

// Review with listing context for dashboard
export interface ReviewWithListing extends ReviewWithAuthor {
  listing: {
    id: string;
    name: string;
    slug: string;
    primary_image_url: string | null;
  } | null;
}

// Seller review stats (from get_seller_review_stats function)
export interface SellerReviewStats {
  average_rating: number;
  review_count: number;
  by_stage: Partial<Record<ReviewStage, number>>;
}

export const REVIEW_STAGE_LABELS: Record<ReviewStage, string> = {
  inquiry: "After Inquiry",
  trial: "After Trial Visit",
  offer: "After Offer",
  completion: "After Purchase",
};
