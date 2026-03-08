-- Add verification badge columns to horse_listings
alter table horse_listings
  add column if not exists has_current_coggins boolean not null default false,
  add column if not exists has_vet_check_available boolean not null default false;
