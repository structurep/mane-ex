-- Migration 003: Disciplines & Horse Listings
-- Core listing system with 50+ fields covering details, vet, show, history, transparency.

-- Seed disciplines
create table disciplines (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  category text, -- 'english', 'western', 'other'
  sort_order integer default 0
);

insert into disciplines (name, slug, category, sort_order) values
  ('Hunter', 'hunter', 'english', 1),
  ('Jumper', 'jumper', 'english', 2),
  ('Equitation', 'equitation', 'english', 3),
  ('Hunter/Jumper', 'hunter-jumper', 'english', 4),
  ('Dressage', 'dressage', 'english', 5),
  ('Eventing', 'eventing', 'english', 6),
  ('Show Jumping', 'show-jumping', 'english', 7),
  ('Polo', 'polo', 'english', 8),
  ('Combined Driving', 'combined-driving', 'english', 9),
  ('Western Pleasure', 'western-pleasure', 'western', 10),
  ('Reining', 'reining', 'western', 11),
  ('Cutting', 'cutting', 'western', 12),
  ('Barrel Racing', 'barrel-racing', 'western', 13),
  ('Western Dressage', 'western-dressage', 'western', 14),
  ('Trail', 'trail', 'other', 15),
  ('Endurance', 'endurance', 'other', 16),
  ('Pleasure', 'pleasure', 'other', 17),
  ('Breeding', 'breeding', 'other', 18),
  ('Other', 'other', 'other', 99);

-- Listing status
create type listing_status as enum (
  'draft',
  'pending_review',
  'active',
  'under_offer',
  'sold',
  'expired',
  'removed'
);

-- Warranty types per UCC Article 2
create type warranty_type as enum (
  'as_is',
  'sound_at_sale',
  'sound_for_use'
);

create type horse_gender as enum ('mare', 'gelding', 'stallion');

create table horse_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  farm_id uuid references farms(id) on delete set null,
  status listing_status not null default 'draft',
  slug text not null unique,

  -- ── Basic Info (Step 1) ──
  name text not null,
  breed text,
  registered_name text,
  registration_number text,
  registry text, -- 'AQHA', 'USEF', 'USDF', etc.
  gender horse_gender,
  color text,
  date_of_birth date,
  age_years integer,
  height_hands numeric(4,1), -- e.g. 16.2
  sire text,
  dam text,

  -- ── Farm Life (Step 2) ──
  location_city text,
  location_state text,
  location_zip text,
  location_country text default 'US',
  barn_name text,
  current_rider text,
  current_trainer text,
  turnout_schedule text,
  feeding_program text,
  shoeing_schedule text,
  supplements text,

  -- ── Show Info (Step 3) ──
  discipline_ids uuid[] default '{}',
  level text, -- 'Beginner', 'Intermediate', 'Advanced', 'Grand Prix', etc.
  show_experience text,
  show_record text, -- freeform description of show results
  competition_divisions text,
  usef_number text,
  usdf_number text,
  fei_id text,

  -- ── Vet Info (Step 4) ──
  vet_name text,
  vet_phone text,
  last_vet_check date,
  vaccination_status text,
  dental_date date,
  coggins_date date,
  coggins_expiry date,
  known_health_issues text,
  medications text,
  -- FL Rule 5H: medical treatments within 7 days of sale
  recent_medical_treatments text,
  lameness_history text,
  surgical_history text,
  allergies text,

  -- ── History (Step 6) ──
  years_with_current_owner integer,
  number_of_previous_owners integer,
  reason_for_sale text,
  training_history text,
  temperament text,
  vices text,
  suitable_for text, -- 'amateur', 'junior', 'professional', etc.
  good_with text, -- 'kids', 'other horses', 'dogs', etc.

  -- ── Pricing (Step 7) ──
  price integer, -- in cents
  price_display text, -- 'exact', 'range', 'contact'
  price_negotiable boolean default true,
  warranty warranty_type default 'as_is',
  lease_available boolean default false,
  lease_terms text,

  -- ── Transparency & Compliance ──
  -- State-specific disclosures
  seller_state text, -- determines which state disclosure rules apply
  fl_medical_disclosure text, -- FL Rule 5H
  dual_agency_disclosed boolean default false,
  commission_disclosed boolean default false,
  commission_amount text,
  trainer_commission_consent boolean default false,

  -- Listing Completeness Score (calculated by function)
  completeness_score integer default 0,
  completeness_grade text default 'incomplete', -- 'excellent', 'good', 'fair', 'incomplete'

  -- ── Full-text search ──
  search_vector tsvector,

  -- ── Metadata ──
  view_count integer default 0,
  favorite_count integer default 0,
  inquiry_count integer default 0,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update timestamps
create trigger listings_updated_at
  before update on horse_listings
  for each row execute function update_updated_at();

-- Auto-generate search vector
create or replace function listings_search_vector_update()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.breed, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.registered_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.color, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.show_experience, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.temperament, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.reason_for_sale, '')), 'D') ||
    setweight(to_tsvector('english', coalesce(new.training_history, '')), 'D');
  return new;
end;
$$ language plpgsql;

create trigger listings_search_vector
  before insert or update on horse_listings
  for each row execute function listings_search_vector_update();

-- Slug generation helper
create or replace function generate_listing_slug()
returns trigger as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := lower(regexp_replace(new.name, '[^a-zA-Z0-9]', '-', 'g'))
                || '-' || substr(gen_random_uuid()::text, 1, 8);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger listings_slug_gen
  before insert on horse_listings
  for each row execute function generate_listing_slug();

-- ── Listing Completeness Score ──
-- Framed as "listing completeness" NOT "horse quality" (legal requirement)
create or replace function calculate_completeness_score(listing horse_listings)
returns integer as $$
declare
  score integer := 0;
begin
  -- Basic info (max 200)
  if listing.name is not null then score := score + 20; end if;
  if listing.breed is not null then score := score + 15; end if;
  if listing.gender is not null then score := score + 10; end if;
  if listing.date_of_birth is not null then score := score + 15; end if;
  if listing.height_hands is not null then score := score + 15; end if;
  if listing.color is not null then score := score + 10; end if;
  if listing.registered_name is not null then score := score + 15; end if;
  if listing.registration_number is not null then score := score + 15; end if;
  if listing.sire is not null then score := score + 10; end if;
  if listing.dam is not null then score := score + 10; end if;
  -- Price (important for buyers)
  if listing.price is not null then score := score + 25; end if;
  if listing.warranty is not null then score := score + 15; end if;
  -- Cap basic at 175
  score := least(score, 175);

  -- Show & Training (max 150)
  if array_length(listing.discipline_ids, 1) > 0 then score := score + 20; end if;
  if listing.level is not null then score := score + 15; end if;
  if listing.show_experience is not null then score := score + 30; end if;
  if listing.show_record is not null then score := score + 25; end if;
  if listing.training_history is not null then score := score + 20; end if;
  if listing.temperament is not null then score := score + 20; end if;
  if listing.suitable_for is not null then score := score + 20; end if;

  -- Vet & Health (max 200)
  if listing.vet_name is not null then score := score + 15; end if;
  if listing.last_vet_check is not null then score := score + 20; end if;
  if listing.vaccination_status is not null then score := score + 15; end if;
  if listing.coggins_date is not null then score := score + 25; end if;
  if listing.dental_date is not null then score := score + 15; end if;
  if listing.known_health_issues is not null then score := score + 20; end if;
  if listing.lameness_history is not null then score := score + 20; end if;
  if listing.surgical_history is not null then score := score + 15; end if;
  -- FL Rule 5H compliance bonus
  if listing.recent_medical_treatments is not null then score := score + 25; end if;

  -- History & Provenance (max 100)
  if listing.years_with_current_owner is not null then score := score + 15; end if;
  if listing.number_of_previous_owners is not null then score := score + 15; end if;
  if listing.reason_for_sale is not null then score := score + 20; end if;

  -- Farm Life (max 75)
  if listing.current_trainer is not null then score := score + 15; end if;
  if listing.turnout_schedule is not null then score := score + 10; end if;
  if listing.feeding_program is not null then score := score + 10; end if;
  if listing.shoeing_schedule is not null then score := score + 10; end if;

  -- Media bonus is calculated separately (based on listing_media count)
  -- Max total from fields alone: ~700. Media/docs can push to 1000.

  return least(score, 1000);
end;
$$ language plpgsql immutable;

-- Trigger to recalculate completeness score on update
create or replace function update_completeness_score()
returns trigger as $$
begin
  new.completeness_score := calculate_completeness_score(new);
  new.completeness_grade := case
    when new.completeness_score >= 750 then 'excellent'
    when new.completeness_score >= 500 then 'good'
    when new.completeness_score >= 250 then 'fair'
    else 'incomplete'
  end;
  return new;
end;
$$ language plpgsql;

create trigger listings_completeness
  before insert or update on horse_listings
  for each row execute function update_completeness_score();

-- RLS
alter table disciplines enable row level security;
alter table horse_listings enable row level security;

create policy "Disciplines are publicly readable"
  on disciplines for select using (true);

-- Active listings are public; drafts only visible to seller
create policy "Active listings are publicly readable"
  on horse_listings for select
  using (
    status = 'active' or
    status = 'under_offer' or
    status = 'sold' or
    seller_id = auth.uid()
  );

create policy "Sellers can insert their own listings"
  on horse_listings for insert
  with check (seller_id = auth.uid());

create policy "Sellers can update their own listings"
  on horse_listings for update
  using (seller_id = auth.uid());

create policy "Sellers can delete their own draft listings"
  on horse_listings for delete
  using (seller_id = auth.uid() and status = 'draft');

-- Indexes
create index listings_seller_idx on horse_listings(seller_id);
create index listings_farm_idx on horse_listings(farm_id) where farm_id is not null;
create index listings_status_idx on horse_listings(status);
create index listings_state_idx on horse_listings(location_state);
create index listings_price_idx on horse_listings(price) where status = 'active';
create index listings_breed_idx on horse_listings(breed) where status = 'active';
create index listings_gender_idx on horse_listings(gender) where status = 'active';
create index listings_height_idx on horse_listings(height_hands) where status = 'active';
create index listings_slug_idx on horse_listings(slug);
create index listings_search_idx on horse_listings using gin(search_vector);
create index listings_published_idx on horse_listings(published_at desc) where status = 'active';
create index listings_completeness_idx on horse_listings(completeness_score desc) where status = 'active';

-- Compute age_years from date_of_birth on insert/update
create or replace function compute_age_years()
returns trigger as $$
begin
  if new.date_of_birth is not null then
    new.age_years := extract(year from age(new.date_of_birth))::integer;
  else
    new.age_years := null;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_compute_age_years
  before insert or update of date_of_birth on horse_listings
  for each row
  execute function compute_age_years();
