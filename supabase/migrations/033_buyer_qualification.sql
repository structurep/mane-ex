-- Buyer pre-qualification fields on profiles
-- Enables seller-side buyer quality signals

create type riding_level as enum ('beginner', 'amateur', 'junior', 'professional');
create type facility_type as enum ('private_barn', 'training_barn', 'boarding_barn', 'unknown');
create type buyer_qualification as enum ('unverified', 'basic', 'qualified');

alter table profiles
  add column riding_level riding_level,
  add column trainer_reference text,
  add column facility_type facility_type,
  add column buyer_qualification buyer_qualification not null default 'unverified';

-- Index for seller-side filtering
create index idx_profiles_buyer_qual on profiles (buyer_qualification) where role = 'buyer';
