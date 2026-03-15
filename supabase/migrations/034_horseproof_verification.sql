-- HorseProof Verified Listing Tiers
-- Trust infrastructure: tiered verification badges for listings

create type verification_tier as enum ('none', 'bronze', 'silver', 'gold');

alter table horse_listings
  add column verification_tier verification_tier not null default 'none',
  add column seller_identity_verified boolean not null default false,
  add column trainer_endorsed boolean not null default false,
  add column standardized_video_complete boolean not null default false,
  add column ppe_on_file boolean not null default false,
  add column show_record_linked boolean not null default false,
  add column hp_trainer_name text,
  add column hp_trainer_endorsement_note text,
  add column ppe_document_url text,
  add column show_record_url text,
  add column video_checklist jsonb,
  add column verified_at timestamptz;

-- Index for browse filter/sort on verification tier
create index idx_listings_verification_tier on horse_listings (verification_tier) where status = 'active';
