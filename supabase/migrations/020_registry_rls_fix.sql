-- Migration 020: Tighten registry records SELECT policy
-- Public reads restricted to active listings only (not under_offer/sold).
-- Seller always sees own records regardless of listing status.

DROP POLICY IF EXISTS "Registry records readable for viewable listings"
  ON listing_registry_records;

CREATE POLICY "Registry records readable for viewable listings"
  ON listing_registry_records FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM horse_listings
      WHERE status = 'active'
         OR seller_id = auth.uid()
    )
  );
