-- Migration 016: Add henneke_score + soundness_level to horse_listings
-- Persists body condition scoring (Henneke 1-9) and soundness assessment.

-- 1) Create enum for soundness levels (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'soundness_level_enum') THEN
    CREATE TYPE soundness_level_enum AS ENUM (
      'vet_confirmed_sound',
      'minor_findings',
      'managed_condition',
      'not_assessed'
    );
  END IF;
END $$;

-- 2) Add henneke_score column (integer 1-9, nullable)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'horse_listings' AND column_name = 'henneke_score'
  ) THEN
    ALTER TABLE horse_listings
      ADD COLUMN henneke_score integer
      CHECK (henneke_score >= 1 AND henneke_score <= 9);
  END IF;
END $$;

-- 3) Add soundness_level column (enum, nullable, default not_assessed)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'horse_listings' AND column_name = 'soundness_level'
  ) THEN
    ALTER TABLE horse_listings
      ADD COLUMN soundness_level soundness_level_enum DEFAULT 'not_assessed';
  END IF;
END $$;
