-- Add description, trial availability, and trial location to horse_listings
alter table horse_listings
  add column if not exists description text,
  add column if not exists trial_available boolean not null default false,
  add column if not exists trial_location text;
