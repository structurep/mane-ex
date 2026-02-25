-- Migration 014: Phase 9 — Social Profiles & Barn Community
-- Profile photos, barn invites, barn community posts + comments.

-- ============================================================
-- 1. PROFILE ENHANCEMENTS
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;

-- Backfill existing complete profiles
UPDATE profiles SET onboarding_complete = true WHERE profile_complete = true;

-- ============================================================
-- 2. PROFILE PHOTO GALLERY
-- ============================================================
CREATE TABLE profile_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  storage_path text NOT NULL,
  caption text CHECK (char_length(caption) <= 300),
  sort_order integer NOT NULL DEFAULT 0,
  is_avatar boolean NOT NULL DEFAULT false,
  is_cover boolean NOT NULL DEFAULT false,
  width integer,
  height integer,
  file_size integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile photos are publicly readable"
  ON profile_photos FOR SELECT USING (true);

CREATE POLICY "Users can insert own photos"
  ON profile_photos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON profile_photos FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON profile_photos FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX profile_photos_user_idx ON profile_photos(user_id);

-- ============================================================
-- 3. BARN INVITES
-- ============================================================
CREATE TYPE barn_invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

CREATE TABLE barn_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES profiles(id),
  invited_email text,
  invited_user_id uuid REFERENCES profiles(id),
  role farm_role NOT NULL DEFAULT 'staff',
  title text,
  can_list_horses boolean DEFAULT false,
  can_manage_messages boolean DEFAULT false,
  status barn_invite_status NOT NULL DEFAULT 'pending',
  token text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  message text CHECK (char_length(message) <= 500),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CONSTRAINT invite_target CHECK (invited_email IS NOT NULL OR invited_user_id IS NOT NULL)
);

ALTER TABLE barn_invites ENABLE ROW LEVEL SECURITY;

-- Farm owners/managers can create invites
CREATE POLICY "Farm owners and managers can create invites"
  ON barn_invites FOR INSERT
  WITH CHECK (
    farm_id IN (
      SELECT id FROM farms WHERE owner_id = auth.uid()
      UNION
      SELECT farm_id FROM farm_staff WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Farm owners, managers, and invite recipients can view invites
CREATE POLICY "Invite stakeholders can view invites"
  ON barn_invites FOR SELECT
  USING (
    invited_user_id = auth.uid()
    OR invited_by = auth.uid()
    OR farm_id IN (
      SELECT id FROM farms WHERE owner_id = auth.uid()
      UNION
      SELECT farm_id FROM farm_staff WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Recipients can update their invite (accept/decline)
CREATE POLICY "Invite recipients can respond"
  ON barn_invites FOR UPDATE
  USING (
    invited_user_id = auth.uid()
    OR farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid())
  );

CREATE INDEX barn_invites_farm_idx ON barn_invites(farm_id);
CREATE INDEX barn_invites_token_idx ON barn_invites(token);
CREATE INDEX barn_invites_invited_user_idx ON barn_invites(invited_user_id);

-- ============================================================
-- 4. BARN COMMUNITY POSTS
-- ============================================================
CREATE TYPE barn_post_type AS ENUM ('text', 'photo', 'announcement', 'listing_share', 'event');

CREATE TABLE barn_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id),
  type barn_post_type NOT NULL DEFAULT 'text',
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  is_pinned boolean NOT NULL DEFAULT false,
  listing_id uuid REFERENCES horse_listings(id) ON DELETE SET NULL,
  comment_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE barn_posts ENABLE ROW LEVEL SECURITY;

-- Barn members only (owner + farm_staff)
CREATE POLICY "Barn members can view posts"
  ON barn_posts FOR SELECT
  USING (
    farm_id IN (
      SELECT id FROM farms WHERE owner_id = auth.uid()
      UNION
      SELECT farm_id FROM farm_staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Barn members can create posts"
  ON barn_posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND farm_id IN (
      SELECT id FROM farms WHERE owner_id = auth.uid()
      UNION
      SELECT farm_id FROM farm_staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Post authors can update own posts"
  ON barn_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Post authors and farm owners can delete posts"
  ON barn_posts FOR DELETE
  USING (
    auth.uid() = author_id
    OR farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid())
  );

CREATE INDEX barn_posts_farm_idx ON barn_posts(farm_id, created_at DESC);

-- ============================================================
-- 5. BARN POST MEDIA
-- ============================================================
CREATE TABLE barn_post_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES barn_posts(id) ON DELETE CASCADE,
  url text NOT NULL,
  storage_path text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  width integer,
  height integer,
  file_size integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE barn_post_media ENABLE ROW LEVEL SECURITY;

-- Media inherits post visibility
CREATE POLICY "Barn post media inherits post visibility"
  ON barn_post_media FOR SELECT
  USING (
    post_id IN (SELECT id FROM barn_posts)
  );

CREATE POLICY "Post authors can manage media"
  ON barn_post_media FOR ALL
  USING (
    post_id IN (SELECT id FROM barn_posts WHERE author_id = auth.uid())
  );

CREATE INDEX barn_post_media_post_idx ON barn_post_media(post_id);

-- ============================================================
-- 6. BARN POST COMMENTS (threaded)
-- ============================================================
CREATE TABLE barn_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES barn_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id),
  parent_id uuid REFERENCES barn_post_comments(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE barn_post_comments ENABLE ROW LEVEL SECURITY;

-- Comments inherit barn membership requirement
CREATE POLICY "Barn members can view comments"
  ON barn_post_comments FOR SELECT
  USING (
    post_id IN (SELECT id FROM barn_posts)
  );

CREATE POLICY "Barn members can create comments"
  ON barn_post_comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND post_id IN (SELECT id FROM barn_posts)
  );

CREATE POLICY "Comment authors can update own comments"
  ON barn_post_comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Comment authors and farm owners can delete comments"
  ON barn_post_comments FOR DELETE
  USING (
    auth.uid() = author_id
    OR post_id IN (
      SELECT bp.id FROM barn_posts bp
      JOIN farms f ON f.id = bp.farm_id
      WHERE f.owner_id = auth.uid()
    )
  );

CREATE INDEX barn_post_comments_post_idx ON barn_post_comments(post_id, created_at);
CREATE INDEX barn_post_comments_parent_idx ON barn_post_comments(parent_id);

-- Auto-increment/decrement comment_count
CREATE OR REPLACE FUNCTION update_barn_post_comment_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE barn_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE barn_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER barn_comment_count_trigger
  AFTER INSERT OR DELETE ON barn_post_comments
  FOR EACH ROW EXECUTE FUNCTION update_barn_post_comment_count();

-- ============================================================
-- 7. NEW NOTIFICATION TYPES
-- ============================================================
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'barn_invite';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'barn_post';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'barn_comment';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'barn_join';

-- ============================================================
-- 8. MAKE FARM STAFF PUBLICLY READABLE (for public farm pages)
-- ============================================================
-- Drop the old restrictive policy and replace with public read
DROP POLICY IF EXISTS "Farm staff is readable by farm members" ON farm_staff;
CREATE POLICY "Farm staff is publicly readable"
  ON farm_staff FOR SELECT USING (true);

-- ============================================================
-- 9. ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE barn_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE barn_post_comments;
