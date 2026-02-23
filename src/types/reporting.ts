export type ReportReason =
  | "fraud"
  | "misrepresentation"
  | "stolen_photos"
  | "animal_welfare"
  | "harassment"
  | "spam"
  | "other";

export type ReportStatus = "open" | "investigating" | "resolved" | "dismissed";

export type ReportTargetType = "listing" | "user" | "message";

export type NotificationType =
  | "message"
  | "offer"
  | "listing_update"
  | "price_drop"
  | "favorite_sold"
  | "report_update"
  | "system";

export interface Report {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  admin_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

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
