// ── Seller Score Types ──
// LEGAL: All score descriptions framed as "listing completeness and seller activity"
// NEVER as horse quality, soundness, or value.

export type SellerBadge =
  | "documentation_champion"
  | "fast_responder"
  | "elite_seller"
  | "trending"
  | "highly_rated"
  | "escrow_verified"
  | "platinum"
  | "consistent"
  | "community_favorite";

export type ScoreGrade = "elite" | "excellent" | "strong" | "building" | "new";

export type LeaderboardCategory =
  | "most_complete"
  | "most_active"
  | "most_credible";

export interface SellerScore {
  id: string;
  seller_id: string;
  mane_score: number;
  grade: ScoreGrade;
  completeness_component: number;
  engagement_component: number;
  credibility_component: number;
  badges: SellerBadge[];
  last_activity_at: string;
  consecutive_active_days: number;
  calculation_details: ScoreCalculationDetails | null;
  created_at: string;
  updated_at: string;
}

export interface ScoreCalculationDetails {
  completeness: {
    score: number;
    max: number;
    listing_count: number;
    avg_listing_score: number;
  };
  engagement: {
    score: number;
    max: number;
    total_views: number;
    total_favorites: number;
    total_inquiries: number;
    completed_sales: number;
    completeness_cap_applied: boolean;
  };
  credibility: {
    score: number;
    max: number;
    avg_response_hours: number;
    account_age_days: number;
    completed_escrows: number;
  };
  calculated_at: string;
}

// Badge display metadata
export interface BadgeDefinition {
  id: SellerBadge;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  criteria: string; // User-facing criteria description
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "documentation_champion",
    label: "Documentation Champion",
    description: "Maintains thorough, complete listing documentation",
    icon: "FileCheck",
    criteria: "Average listing completeness of 750+ across all active listings",
  },
  {
    id: "fast_responder",
    label: "Fast Responder",
    description: "Responds to inquiries quickly",
    icon: "Zap",
    criteria: "Average response time under 4 hours",
  },
  {
    id: "elite_seller",
    label: "Elite Seller",
    description: "Top-tier seller with exceptional Mane Score",
    icon: "Crown",
    criteria: "Mane Score of 900 or higher",
  },
  {
    id: "trending",
    label: "Trending",
    description: "Listings generating significant interest",
    icon: "TrendingUp",
    criteria: "100+ listing views in the last 7 days",
  },
  {
    id: "highly_rated",
    label: "Highly Rated",
    description: "Consistently receives excellent reviews",
    icon: "Star",
    criteria: "Average rating of 4.5+ from buyer reviews",
  },
  {
    id: "escrow_verified",
    label: "Escrow Verified",
    description: "Proven track record with secure transactions",
    icon: "ShieldCheck",
    criteria: "3+ completed escrow transactions via ManeVault",
  },
  {
    id: "platinum",
    label: "Platinum Seller",
    description: "Premium tier verified seller",
    icon: "Gem",
    criteria: "Premium seller tier with verified identity and business documentation",
  },
  {
    id: "consistent",
    label: "Consistent",
    description: "Maintains an active, up-to-date presence",
    icon: "Activity",
    criteria: "30+ consecutive days of platform activity",
  },
  {
    id: "community_favorite",
    label: "Community Favorite",
    description: "Listings loved by the community",
    icon: "Heart",
    criteria: "50+ saves across all listings",
  },
];

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  seller_id: string;
  display_name: string | null;
  avatar_url: string | null;
  mane_score: number;
  grade: ScoreGrade;
  badge_count: number;
  // Category-specific highlighted value
  category_value: number;
}

// Score improvement suggestion for gamification prompts
export interface ScoreSuggestion {
  action: string;
  points: string;
  link: string;
  priority: "high" | "medium" | "low";
}

// Mane Score disclaimer text (use everywhere scores are displayed)
export const MANE_SCORE_DISCLAIMER =
  "Mane Score reflects listing completeness and documentation, not the quality, soundness, or value of any horse.";

// Grade display labels
export const GRADE_LABELS: Record<ScoreGrade, { label: string; color: string }> = {
  elite: { label: "Elite", color: "text-amber-600" },
  excellent: { label: "Excellent", color: "text-emerald-600" },
  strong: { label: "Strong", color: "text-blue-600" },
  building: { label: "Building", color: "text-orange-600" },
  new: { label: "New", color: "text-gray-500" },
};
