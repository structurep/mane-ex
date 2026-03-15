-- Match Alerts: dedicated table for AI match notifications
-- Separate from general notifications for query efficiency and unique constraints

CREATE TABLE IF NOT EXISTS match_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES horse_listings(id) ON DELETE CASCADE,
  match_percent INT NOT NULL CHECK (match_percent BETWEEN 0 AND 100),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Prevent duplicate alerts for same user+listing
  UNIQUE (user_id, listing_id)
);

-- Index for fetching user's alerts (most recent first)
CREATE INDEX idx_match_alerts_user_created ON match_alerts (user_id, created_at DESC);

-- Index for unread count queries
CREATE INDEX idx_match_alerts_user_unread ON match_alerts (user_id) WHERE read_at IS NULL;

-- RLS
ALTER TABLE match_alerts ENABLE ROW LEVEL SECURITY;

-- Users can read their own alerts
CREATE POLICY "Users can read own match alerts"
  ON match_alerts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark read) their own alerts
CREATE POLICY "Users can update own match alerts"
  ON match_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- Server (service role) inserts alerts; no user-facing insert policy needed
-- Insert via server actions with service role or via RLS bypass
CREATE POLICY "Service can insert match alerts"
  ON match_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
