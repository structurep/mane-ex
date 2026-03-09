export type ServiceCategory =
  | "ppe_supervision"
  | "trial_ride"
  | "training_assessment"
  | "lesson"
  | "training_board"
  | "show_coaching"
  | "horse_shopping"
  | "consultation"
  | "other";

export type PriceType = "fixed" | "hourly" | "per_session" | "contact";

export interface TrainerProfile {
  id: string;
  headline: string | null;
  bio: string | null;
  disciplines: string[];
  certifications: string[];
  years_experience: number | null;
  service_radius_miles: number | null;
  location_city: string | null;
  location_state: string | null;
  website_url: string | null;
  phone: string | null;
  accepting_clients: boolean;
  verified: boolean;
  rating_avg: number | null;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface TrainerService {
  id: string;
  trainer_id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  price_cents: number | null;
  price_type: PriceType;
  duration_minutes: number | null;
  is_active: boolean;
  created_at: string;
}

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  ppe_supervision: "PPE Supervision",
  trial_ride: "Trial Ride",
  training_assessment: "Training Assessment",
  lesson: "Lesson",
  training_board: "Training & Board",
  show_coaching: "Show Coaching",
  horse_shopping: "Horse Shopping",
  consultation: "Consultation",
  other: "Other",
};
