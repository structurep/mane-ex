export type FarmRole = "owner" | "manager" | "trainer" | "staff";
export type BarnInviteStatus = "pending" | "accepted" | "declined" | "expired";
export type BarnPostType = "text" | "photo" | "announcement" | "listing_share" | "event";

export interface BarnMember {
  id: string;
  farm_id: string;
  user_id: string;
  role: FarmRole;
  title: string | null;
  can_list_horses: boolean;
  can_manage_messages: boolean;
  created_at: string;
  // Joined from profiles
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
    email: string;
  };
}

export interface BarnInvite {
  id: string;
  farm_id: string;
  invited_by: string;
  invited_email: string | null;
  invited_user_id: string | null;
  role: FarmRole;
  title: string | null;
  can_list_horses: boolean;
  can_manage_messages: boolean;
  status: BarnInviteStatus;
  token: string;
  message: string | null;
  expires_at: string;
  created_at: string;
  responded_at: string | null;
  // Joined
  farm?: { name: string; slug: string };
  inviter?: { display_name: string | null };
}

export interface BarnPost {
  id: string;
  farm_id: string;
  author_id: string;
  type: BarnPostType;
  body: string;
  is_pinned: boolean;
  listing_id: string | null;
  comment_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  author?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  media?: BarnPostMedia[];
}

export interface BarnPostMedia {
  id: string;
  post_id: string;
  url: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  width: number | null;
  height: number | null;
  file_size: number | null;
  created_at: string;
}

export interface BarnComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  // Joined
  author?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  replies?: BarnComment[];
}
