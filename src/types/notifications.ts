export type NotificationType =
  | "message"
  | "offer"
  | "listing_update"
  | "price_drop"
  | "favorite_sold"
  | "report_update"
  | "system"
  | "new_match"
  | "review_request"
  | "subscription"
  | "weekly_digest"
  | "trial_update"
  | "iso_match"
  | "viewing_reminder"
  | "ppe_report_ready"
  | "transport_quote_ready"
  | "verification_complete"
  | "market_alert"
  | "barn_invite"
  | "barn_post"
  | "barn_comment"
  | "barn_join";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;

  // Email
  email_offers: boolean;
  email_messages: boolean;
  email_price_drops: boolean;
  email_new_matches: boolean;
  email_just_sold: boolean;
  email_weekly_digest: boolean;
  email_marketing: boolean;

  // Push
  push_offers: boolean;
  push_messages: boolean;
  push_price_drops: boolean;
  push_new_matches: boolean;
  push_just_sold: boolean;

  push_subscription: PushSubscriptionJSON | null;

  created_at: string;
  updated_at: string;
}

// Push subscription shape from browser API
export interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
