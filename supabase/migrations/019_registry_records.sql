-- Migration 019: Registry verification records
-- Persists the multi-registry data from RegistryLookup component

CREATE TABLE IF NOT EXISTS listing_registry_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES horse_listings(id) ON DELETE CASCADE,
  registry text NOT NULL,            -- e.g. 'aqha', 'usef', 'usdf', 'ushja', 'jockey_club', 'other'
  registry_number text NOT NULL,     -- user-entered registration number (required)
  registered_name text,
  status text NOT NULL DEFAULT 'unverified',  -- 'unverified' | 'pending' | 'verified' | 'not_found'
  verified_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicate registry+number per listing
ALTER TABLE listing_registry_records
  ADD CONSTRAINT listing_registry_unique
  UNIQUE (listing_id, registry, registry_number);

-- Index for FK lookups
CREATE INDEX registry_records_listing_idx ON listing_registry_records(listing_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE listing_registry_records ENABLE ROW LEVEL SECURITY;

-- SELECT: same visibility as horse_listings (active/under_offer/sold = public, seller sees own)
CREATE POLICY "Registry records readable for viewable listings"
  ON listing_registry_records FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM horse_listings
      WHERE status IN ('active', 'under_offer', 'sold')
         OR seller_id = auth.uid()
    )
  );

-- INSERT: only listing owner
CREATE POLICY "Sellers can insert registry records"
  ON listing_registry_records FOR INSERT
  WITH CHECK (
    listing_id IN (
      SELECT id FROM horse_listings WHERE seller_id = auth.uid()
    )
  );

-- UPDATE: only listing owner
CREATE POLICY "Sellers can update registry records"
  ON listing_registry_records FOR UPDATE
  USING (
    listing_id IN (
      SELECT id FROM horse_listings WHERE seller_id = auth.uid()
    )
  );

-- DELETE: only listing owner
CREATE POLICY "Sellers can delete registry records"
  ON listing_registry_records FOR DELETE
  USING (
    listing_id IN (
      SELECT id FROM horse_listings WHERE seller_id = auth.uid()
    )
  );
