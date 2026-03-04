-- Migration 021: Persist photography checklist + bonus media scoring
--
-- Adds media_checklist jsonb column to horse_listings.
-- Updates calculate_completeness_score_breakdown() to award bonus points
-- for completed checklist items. Bonus is additive and absorbed by the
-- existing 300-point media cap. No existing listing loses points.
-- Does NOT touch calculate_completeness_score() (legacy function).
-- Does NOT bulk-recompute scores — they update on next edit/save.

-- 1) Add column
ALTER TABLE horse_listings
  ADD COLUMN IF NOT EXISTS media_checklist jsonb DEFAULT '{}'::jsonb;

-- 2) Update ONLY the breakdown function (used by update_completeness_score trigger)
CREATE OR REPLACE FUNCTION calculate_completeness_score_breakdown(listing horse_listings)
RETURNS TABLE(total integer, basics integer, details integer, trust integer, media integer)
LANGUAGE plpgsql AS $$
DECLARE
  v_basics integer := 0;
  v_details integer := 0;
  v_trust integer := 0;
  v_media integer := 0;
  v_photo_count integer;
  v_video_count integer;
  v_has_primary boolean;
  v_alt_filled integer;
  v_alt_total integer;
  v_additional_health integer := 0;
  v_req_angles integer := 0;
  v_opt_count integer := 0;
BEGIN
  -- ── basics (max 200) ─────────────────────────────────────────────────────
  IF listing.name IS NOT NULL AND length(listing.name) >= 2 THEN v_basics := v_basics + 20; END IF;
  IF listing.breed IS NOT NULL THEN v_basics := v_basics + 20; END IF;
  IF listing.gender IS NOT NULL THEN v_basics := v_basics + 15; END IF;
  IF listing.date_of_birth IS NOT NULL THEN v_basics := v_basics + 20; END IF;
  IF listing.height_hands IS NOT NULL THEN v_basics := v_basics + 20; END IF;
  IF listing.color IS NOT NULL THEN v_basics := v_basics + 10; END IF;
  IF listing.price IS NOT NULL THEN v_basics := v_basics + 30; END IF;
  IF listing.registered_name IS NOT NULL THEN v_basics := v_basics + 15; END IF;
  IF listing.registration_number IS NOT NULL THEN v_basics := v_basics + 15; END IF;
  IF listing.sire IS NOT NULL THEN v_basics := v_basics + 10; END IF;
  IF listing.dam IS NOT NULL THEN v_basics := v_basics + 10; END IF;
  IF listing.registry IS NOT NULL THEN v_basics := v_basics + 15; END IF;
  v_basics := least(v_basics, 200);

  -- ── details (max 250) ────────────────────────────────────────────────────
  IF listing.discipline_ids IS NOT NULL AND array_length(listing.discipline_ids, 1) > 0
    THEN v_details := v_details + 30; END IF;
  IF listing.level IS NOT NULL THEN v_details := v_details + 25; END IF;
  IF listing.show_experience IS NOT NULL THEN v_details := v_details + 30; END IF;
  IF listing.show_record IS NOT NULL THEN v_details := v_details + 30; END IF;
  IF listing.temperament IS NOT NULL THEN v_details := v_details + 25; END IF;
  IF listing.suitable_for IS NOT NULL THEN v_details := v_details + 20; END IF;
  IF listing.reason_for_sale IS NOT NULL THEN v_details := v_details + 20; END IF;
  IF listing.years_with_current_owner IS NOT NULL THEN v_details := v_details + 15; END IF;
  IF listing.current_trainer IS NOT NULL THEN v_details := v_details + 15; END IF;
  IF listing.location_state IS NOT NULL THEN v_details := v_details + 20; END IF;
  IF listing.location_city IS NOT NULL THEN v_details := v_details + 10; END IF;
  IF coalesce(listing.turnout_schedule, listing.feeding_program, listing.shoeing_schedule) IS NOT NULL
    THEN v_details := v_details + 10; END IF;
  v_details := least(v_details, 250);

  -- ── trust (max 250) ──────────────────────────────────────────────────────
  IF listing.vet_name IS NOT NULL THEN v_trust := v_trust + 30; END IF;
  IF listing.vaccination_status IS NOT NULL THEN v_trust := v_trust + 30; END IF;
  IF listing.coggins_date IS NOT NULL THEN v_trust := v_trust + 35; END IF;
  IF listing.coggins_expiry IS NOT NULL THEN v_trust := v_trust + 25; END IF;
  IF listing.henneke_score IS NOT NULL THEN v_trust := v_trust + 35; END IF;
  IF listing.soundness_level IS NOT NULL AND listing.soundness_level::text != 'not_assessed'
    THEN v_trust := v_trust + 35; END IF;
  IF listing.dental_date IS NOT NULL THEN v_additional_health := v_additional_health + 15; END IF;
  IF listing.known_health_issues IS NOT NULL THEN v_additional_health := v_additional_health + 15; END IF;
  IF listing.lameness_history IS NOT NULL THEN v_additional_health := v_additional_health + 15; END IF;
  IF listing.recent_medical_treatments IS NOT NULL THEN v_additional_health := v_additional_health + 15; END IF;
  v_trust := v_trust + least(v_additional_health, 60);
  v_trust := least(v_trust, 250);

  -- ── media (max 300) ──────────────────────────────────────────────────────
  SELECT
    count(*) FILTER (WHERE type = 'photo'),
    count(*) FILTER (WHERE type = 'video'),
    coalesce(bool_or(is_primary), false),
    count(*) FILTER (WHERE type = 'photo' AND alt_text IS NOT NULL AND alt_text != ''),
    count(*) FILTER (WHERE type = 'photo')
  INTO v_photo_count, v_video_count, v_has_primary, v_alt_filled, v_alt_total
  FROM listing_media
  WHERE listing_id = listing.id;

  IF v_photo_count >= 4 THEN v_media := v_media + 80; END IF;
  IF v_photo_count >= 8 THEN v_media := v_media + 40; END IF;
  IF v_video_count >= 1 THEN v_media := v_media + 60; END IF;
  IF v_has_primary THEN v_media := v_media + 40; END IF;
  IF v_alt_total > 0 THEN
    v_media := v_media + round(80.0 * v_alt_filled / v_alt_total)::integer;
  END IF;

  -- Checklist bonus (additive, absorbed by existing 300 cap)
  -- Required angles: all-or-nothing for full 32, else partial at 4 per angle
  v_req_angles := (
    SELECT count(DISTINCT a) FROM jsonb_array_elements_text(
      coalesce(listing.media_checklist->'angles', '[]'::jsonb)
    ) AS a
    WHERE a IN ('left_profile','right_profile','front_view','rear_view')
  );
  IF v_req_angles = 4 THEN
    v_media := v_media + 32;
  ELSE
    v_media := v_media + (v_req_angles * 4);
  END IF;

  -- Optional items: +4 each, DISTINCT, max 7 (3 optional angles + 4 videos)
  v_opt_count := (
    SELECT count(DISTINCT a) FROM jsonb_array_elements_text(
      coalesce(listing.media_checklist->'angles', '[]'::jsonb)
    ) AS a
    WHERE a IN ('head_closeup','legs_detail','markings')
  ) + (
    SELECT count(DISTINCT v) FROM jsonb_array_elements_text(
      coalesce(listing.media_checklist->'videos', '[]'::jsonb)
    ) AS v
    WHERE v IN ('walk_trot','canter','under_saddle','turnout')
  );
  v_opt_count := least(v_opt_count, 7);
  v_media := v_media + (v_opt_count * 4);

  v_media := least(v_media, 300);

  -- Return all buckets
  total := least(v_basics + v_details + v_trust + v_media, 1000);
  basics := v_basics;
  details := v_details;
  trust := v_trust;
  media := v_media;
  RETURN NEXT;
END;
$$;
