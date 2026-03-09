-- Trainer profiles and services
-- Extends the profiles table with trainer-specific fields and creates
-- a services table for bookable offerings.

-- Trainer profile extension (1:1 with profiles for users with role='trainer')
create table if not exists trainer_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  headline text check (char_length(headline) <= 200),
  bio text check (char_length(bio) <= 3000),
  disciplines text[] default '{}',
  certifications text[] default '{}',
  years_experience int check (years_experience >= 0 and years_experience <= 80),
  service_radius_miles int check (service_radius_miles >= 0 and service_radius_miles <= 500),
  location_city text,
  location_state text,
  website_url text,
  phone text,
  accepting_clients boolean not null default true,
  verified boolean not null default false,
  rating_avg numeric(3,2) default null,
  review_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trainer services (many per trainer)
create table if not exists trainer_services (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainer_profiles(id) on delete cascade,
  name text not null check (char_length(name) <= 200),
  description text check (char_length(description) <= 1000),
  category text not null check (category in (
    'ppe_supervision', 'trial_ride', 'training_assessment',
    'lesson', 'training_board', 'show_coaching',
    'horse_shopping', 'consultation', 'other'
  )),
  price_cents int check (price_cents >= 0),
  price_type text not null default 'fixed' check (price_type in ('fixed', 'hourly', 'per_session', 'contact')),
  duration_minutes int check (duration_minutes > 0 and duration_minutes <= 480),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_trainer_profiles_state on trainer_profiles(location_state);
create index if not exists idx_trainer_profiles_accepting on trainer_profiles(accepting_clients) where accepting_clients = true;
create index if not exists idx_trainer_services_trainer on trainer_services(trainer_id);
create index if not exists idx_trainer_services_category on trainer_services(category);

-- RLS policies
alter table trainer_profiles enable row level security;
alter table trainer_services enable row level security;

-- Public read access (active trainers only)
create policy "Public can view trainer profiles"
  on trainer_profiles for select
  using (true);

create policy "Public can view active services"
  on trainer_services for select
  using (is_active = true);

-- Trainers can manage their own profile
create policy "Trainers can insert own profile"
  on trainer_profiles for insert
  with check (id = auth.uid());

create policy "Trainers can update own profile"
  on trainer_profiles for update
  using (id = auth.uid());

-- Trainers can manage their own services
create policy "Trainers can insert own services"
  on trainer_services for insert
  with check (trainer_id = auth.uid());

create policy "Trainers can update own services"
  on trainer_services for update
  using (trainer_id = auth.uid());

create policy "Trainers can delete own services"
  on trainer_services for delete
  using (trainer_id = auth.uid());

-- Updated_at trigger
create or replace function update_trainer_profile_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trainer_profile_updated_at
  before update on trainer_profiles
  for each row execute function update_trainer_profile_updated_at();
