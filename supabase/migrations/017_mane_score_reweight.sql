-- Migration 017: Rewrite completeness scoring with weighted buckets + media checklist
--
-- Replaces thin linear scoring with 4 named buckets:
--   basics (0-200), details (0-250), trust (0-250), media (0-300) = 1000 max
--
-- Media scoring reads listing_media (photo count, video, primary, alt_text).
-- A trigger on listing_media auto-refreshes the parent listing score.

-- 1) Replace the scoring function (was IMMUTABLE, now VOLATILE since it queries listing_media)
CREATE OR REPLACE FUNCTION calculate_completeness_score(listing horse_listings)
RETURNS integer
LANGUAGE plpgsql AS $$
DECLARE
  basics integer := 0;
  details integer := 0;
  trust integer := 0;
  media integer := 0;
  v_photo_count integer;
  v_video_count integer;
  v_has_primary boolean;
  v_alt_filled integer;
  v_alt_total integer;
  v_additional_health integer := 0;
BEGIN
  -- ── basics_score (max 200) ─────────────────────────────────────────────
  -- Core identity fields every listing should have.
  IF listing.name IS NOT NULL AND length(listing.name) >= 2 THEN basics := basics + 20; END IF;
  IF listing.breed IS NOT NULL THEN basics := basics + 20; END IF;
  IF listing.gender IS NOT NULL THEN basics := basics + 15; END IF;
  IF listing.date_of_birth IS NOT NULL THEN basics := basics + 20; END IF;
  IF listing.height_hands IS NOT NULL THEN basics := basics + 20; END IF;
  IF listing.color IS NOT NULL THEN basics := basics + 10; END IF;
  IF listing.price IS NOT NULL THEN basics := basics + 30; END IF;
  IF listing.registered_name IS NOT NULL THEN basics := basics + 15; END IF;
  IF listing.registration_number IS NOT NULL THEN basics := basics + 15; END IF;
  IF listing.sire IS NOT NULL THEN basics := basics + 10; END IF;
  IF listing.dam IS NOT NULL THEN basics := basics + 10; END IF;
  IF listing.registry IS NOT NULL THEN basics := basics + 15; END IF;
  basics := least(basics, 200);

  -- ── details_score (max 250) ────────────────────────────────────────────
  -- Competition, provenance, and farm life — separates serious listings.
  IF listing.discipline_ids IS NOT NULL AND array_length(listing.discipline_ids, 1) > 0
    THEN details := details + 30; END IF;
  IF listing.level IS NOT NULL THEN details := details + 25; END IF;
  IF listing.show_experience IS NOT NULL THEN details := details + 30; END IF;
  IF listing.show_record IS NOT NULL THEN details := details + 30; END IF;
  IF listing.temperament IS NOT NULL THEN details := details + 25; END IF;
  IF listing.suitable_for IS NOT NULL THEN details := details + 20; END IF;
  IF listing.reason_for_sale IS NOT NULL THEN details := details + 20; END IF;
  IF listing.years_with_current_owner IS NOT NULL THEN details := details + 15; END IF;
  IF listing.current_trainer IS NOT NULL THEN details := details + 15; END IF;
  IF listing.location_state IS NOT NULL THEN details := details + 20; END IF;
  IF listing.location_city IS NOT NULL THEN details := details + 10; END IF;
  IF coalesce(listing.turnout_schedule, listing.feeding_program, listing.shoeing_schedule) IS NOT NULL
    THEN details := details + 10; END IF;
  details := least(details, 250);

  -- ── trust_score (max 250) ──────────────────────────────────────────────
  -- Vet, health, and transparency — the premium differentiator.
  IF listing.vet_name IS NOT NULL THEN trust := trust + 30; END IF;
  IF listing.vaccination_status IS NOT NULL THEN trust := trust + 30; END IF;
  IF listing.coggins_date IS NOT NULL THEN trust := trust + 35; END IF;
  IF listing.coggins_expiry IS NOT NULL THEN trust := trust + 25; END IF;
  IF listing.henneke_score IS NOT NULL THEN trust := trust + 35; END IF;
  IF listing.soundness_level IS NOT NULL AND listing.soundness_level::text != 'not_assessed'
    THEN trust := trust + 35; END IF;
  -- Additional health details (15 each, capped at 60)
  IF listing.dental_date IS NOT NULL THEN v_additional_health := v_additional_health + 15; END IF;
  IF listing.known_health_issues IS NOT NULL THEN v_additional_health := v_additional_health + 15; END IF;
  IF listing.lameness_history IS NOT NULL THEN v_additional_health := v_additional_health + 15; END IF;
  IF listing.recent_medical_treatments IS NOT NULL THEN v_additional_health := v_additional_health + 15; END IF;
  trust := trust + least(v_additional_health, 60);
  trust := least(trust, 250);

  -- ── media_score (max 300) ──────────────────────────────────────────────
  -- Photography checklist: photos, video, primary flag, alt text coverage.
  SELECT
    count(*) FILTER (WHERE type = 'photo'),
    count(*) FILTER (WHERE type = 'video'),
    coalesce(bool_or(is_primary), false),
    count(*) FILTER (WHERE type = 'photo' AND alt_text IS NOT NULL AND alt_text != ''),
    count(*) FILTER (WHERE type = 'photo')
  INTO v_photo_count, v_video_count, v_has_primary, v_alt_filled, v_alt_total
  FROM listing_media
  WHERE listing_id = listing.id;

  IF v_photo_count >= 4 THEN media := media + 80; END IF;
  IF v_photo_count >= 8 THEN media := media + 40; END IF;
  IF v_video_count >= 1 THEN media := media + 60; END IF;
  IF v_has_primary THEN media := media + 40; END IF;
  IF v_alt_total > 0 THEN
    media := media + round(80.0 * v_alt_filled / v_alt_total)::integer;
  END IF;
  media := least(media, 300);

  RETURN least(basics + details + trust + media, 1000);
END;
$$;

-- 2) Trigger on listing_media to refresh parent listing score on media changes
CREATE OR REPLACE FUNCTION refresh_listing_score_on_media_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE horse_listings SET updated_at = now()
  WHERE id = coalesce(NEW.listing_id, OLD.listing_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS media_score_refresh ON listing_media;
CREATE TRIGGER media_score_refresh
  AFTER INSERT OR UPDATE OR DELETE ON listing_media
  FOR EACH ROW
  EXECUTE FUNCTION refresh_listing_score_on_media_change();

-- 3) Force recalculation of all existing listings
UPDATE horse_listings SET updated_at = now();
