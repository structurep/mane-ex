export type TrialStatus =
  | "requested"
  | "confirmed"
  | "rescheduled"
  | "completed"
  | "cancelled"
  | "no_show";

export type TourStatus = "planning" | "confirmed" | "in_progress" | "completed" | "cancelled";

export interface TrialRequest {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  preferred_date: string;
  alternate_date: string | null;
  confirmed_date: string | null;
  status: TrialStatus;
  buyer_notes: string | null;
  seller_notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tour {
  id: string;
  user_id: string;
  name: string;
  tour_date: string;
  status: TourStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TourStop {
  id: string;
  tour_id: string;
  trial_request_id: string;
  stop_order: number;
  created_at: string;
}

// Trial with listing and participant info for dashboard
export interface TrialWithDetails extends TrialRequest {
  listing: {
    id: string;
    name: string;
    slug: string;
    breed: string | null;
    price: number | null;
    location_city: string | null;
    location_state: string | null;
    primary_image_url: string | null;
  };
  buyer: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  seller: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  };
}

// Tour with stops and trial details for itinerary view
export interface TourWithStops extends Tour {
  stops: (TourStop & {
    trial: TrialWithDetails;
  })[];
}

export const TRIAL_STATUS_LABELS: Record<TrialStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  rescheduled: "Rescheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

export const TOUR_STATUS_LABELS: Record<TourStatus, string> = {
  planning: "Planning",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};
