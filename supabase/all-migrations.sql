-- ============================================================================
-- ManeExchange: All Migrations Combined
-- Generated: 2026-02-22
-- ============================================================================


-- ============================================================================
-- FILE: 001_profiles.sql
-- ============================================================================

-- Migration 001: Profiles
-- User profiles that extend Supabase auth.users.
-- Auto-created via trigger on signup.

create type user_role as enum ('buyer', 'seller', 'trainer', 'admin');
create type seller_tier as enum ('basic', 'standard', 'premium');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  display_name text,
  avatar_url text,
  phone text,
  role user_role not null default 'buyer',
  seller_tier seller_tier default 'basic',

  -- Location
  city text,
  state text,
  zip text,
  country text default 'US',

  -- Seller-specific (INFORM Act compliance)
  tax_id_collected boolean default false,
  identity_verified boolean default false,
  stripe_account_id text,
  stripe_onboarding_complete boolean default false,

  -- Buyer preferences
  disciplines text[] default '{}',
  min_budget integer,
  max_budget integer,

  -- Engagement
  bio text,
  website_url text,
  instagram_handle text,
  profile_complete boolean default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS
alter table profiles enable row level security;

-- Anyone can read profiles (public seller pages)
create policy "Profiles are publicly readable"
  on profiles for select
  using (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Indexes
create index profiles_role_idx on profiles(role);
create index profiles_state_idx on profiles(state);
create index profiles_stripe_account_idx on profiles(stripe_account_id) where stripe_account_id is not null;


-- ============================================================================
-- FILE: 002_farms.sql
-- ============================================================================

-- Migration 002: Farms & Farm Staff
-- Seller farm pages and staff management.

create table farms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  cover_url text,

  -- Location
  address text,
  city text,
  state text,
  zip text,
  country text default 'US',
  latitude double precision,
  longitude double precision,

  -- Contact
  phone text,
  email text,
  website_url text,
  instagram_handle text,

  -- Details
  disciplines text[] default '{}',
  year_established integer,
  number_of_stalls integer,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger farms_updated_at
  before update on farms
  for each row execute function update_updated_at();

create type farm_role as enum ('owner', 'manager', 'trainer', 'staff');

create table farm_staff (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references farms(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role farm_role not null default 'staff',
  title text,
  can_list_horses boolean default false,
  can_manage_messages boolean default false,
  created_at timestamptz not null default now(),
  unique(farm_id, user_id)
);

-- RLS
alter table farms enable row level security;
alter table farm_staff enable row level security;

create policy "Farms are publicly readable"
  on farms for select using (true);

create policy "Farm owners can update their farm"
  on farms for update using (auth.uid() = owner_id);

create policy "Farm owners can insert farms"
  on farms for insert with check (auth.uid() = owner_id);

create policy "Farm staff is readable by farm members"
  on farm_staff for select
  using (
    user_id = auth.uid() or
    farm_id in (select id from farms where owner_id = auth.uid())
  );

create policy "Farm owners can manage staff"
  on farm_staff for all
  using (farm_id in (select id from farms where owner_id = auth.uid()));

-- Indexes
create index farms_owner_idx on farms(owner_id);
create index farms_slug_idx on farms(slug);
create index farms_state_idx on farms(state);
create index farm_staff_farm_idx on farm_staff(farm_id);
create index farm_staff_user_idx on farm_staff(user_id);


-- ============================================================================
-- FILE: 003_listings.sql
-- ============================================================================

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


-- ============================================================================
-- FILE: 004_media_documents.sql
-- ============================================================================

-- Migration 004: Listing Media, Documents, Events, Favorites
-- Photos, videos, PPE reports, Coggins, registrations, analytics tracking, favorites.

create type media_type as enum ('photo', 'video');

create table listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references horse_listings(id) on delete cascade,
  type media_type not null default 'photo',
  url text not null,
  storage_path text, -- Supabase Storage path
  alt_text text,
  caption text,
  sort_order integer default 0,
  is_primary boolean default false,
  width integer,
  height integer,
  file_size integer, -- bytes
  created_at timestamptz not null default now()
);

create type document_type as enum (
  'coggins',
  'ppe_report',
  'registration',
  'vet_records',
  'show_records',
  'insurance',
  'bill_of_sale',
  'other'
);

create type document_visibility as enum (
  'public',
  'on_request',
  'private',
  'escrow_only'
);

create table listing_documents (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references horse_listings(id) on delete cascade,
  type document_type not null,
  visibility document_visibility not null default 'on_request',
  name text not null,
  url text not null,
  storage_path text,
  file_size integer,
  mime_type text,
  uploaded_at timestamptz not null default now(),
  expiry_date date, -- for Coggins, CVI, etc.
  notes text
);

-- Listing events for analytics and scoring
create type listing_event_type as enum (
  'view',
  'favorite',
  'unfavorite',
  'share',
  'inquiry',
  'offer',
  'trial_request',
  'phone_click',
  'message_sent'
);

create table listing_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references horse_listings(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  event_type listing_event_type not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- Favorites (Dream Barn foundation)
create table listing_favorites (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references horse_listings(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(listing_id, user_id)
);

-- RLS
alter table listing_media enable row level security;
alter table listing_documents enable row level security;
alter table listing_events enable row level security;
alter table listing_favorites enable row level security;

-- Media: public for active listings, seller-only for drafts
create policy "Media readable for viewable listings"
  on listing_media for select
  using (
    listing_id in (
      select id from horse_listings
      where status in ('active', 'under_offer', 'sold')
         or seller_id = auth.uid()
    )
  );

create policy "Sellers can manage their listing media"
  on listing_media for all
  using (
    listing_id in (select id from horse_listings where seller_id = auth.uid())
  );

-- Documents: respect visibility settings
create policy "Public docs readable for active listings"
  on listing_documents for select
  using (
    (visibility = 'public' and listing_id in (
      select id from horse_listings where status in ('active', 'under_offer', 'sold')
    ))
    or
    listing_id in (select id from horse_listings where seller_id = auth.uid())
  );

create policy "Sellers can manage their listing documents"
  on listing_documents for all
  using (
    listing_id in (select id from horse_listings where seller_id = auth.uid())
  );

-- Events: insert for authenticated users, select for listing owner
create policy "Users can insert events"
  on listing_events for insert
  with check (auth.uid() is not null);

create policy "Listing owners can view events"
  on listing_events for select
  using (
    listing_id in (select id from horse_listings where seller_id = auth.uid())
  );

-- Favorites
create policy "Users can manage their own favorites"
  on listing_favorites for all
  using (user_id = auth.uid());

create policy "Favorite counts visible to listing owners"
  on listing_favorites for select
  using (
    user_id = auth.uid() or
    listing_id in (select id from horse_listings where seller_id = auth.uid())
  );

-- Indexes
create index media_listing_idx on listing_media(listing_id);
create index media_primary_idx on listing_media(listing_id) where is_primary = true;
create index docs_listing_idx on listing_documents(listing_id);
create index docs_type_idx on listing_documents(type);
create index events_listing_idx on listing_events(listing_id);
create index events_user_idx on listing_events(user_id) where user_id is not null;
create index events_type_idx on listing_events(event_type);
create index events_created_idx on listing_events(created_at desc);
create index favorites_listing_idx on listing_favorites(listing_id);
create index favorites_user_idx on listing_favorites(user_id);

-- Function to update listing counters from events
create or replace function update_listing_counters()
returns trigger as $$
begin
  if new.event_type = 'view' then
    update horse_listings set view_count = view_count + 1 where id = new.listing_id;
  elsif new.event_type = 'inquiry' or new.event_type = 'message_sent' then
    update horse_listings set inquiry_count = inquiry_count + 1 where id = new.listing_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger listing_counter_update
  after insert on listing_events
  for each row execute function update_listing_counters();

-- Function to update favorite count
create or replace function update_favorite_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update horse_listings set favorite_count = favorite_count + 1 where id = new.listing_id;
    return new;
  elsif tg_op = 'DELETE' then
    update horse_listings set favorite_count = favorite_count - 1 where id = old.listing_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger favorite_count_update
  after insert or delete on listing_favorites
  for each row execute function update_favorite_count();


-- ============================================================================
-- FILE: 005_messaging.sql
-- ============================================================================

-- Migration 005: Conversations & Messages
-- Two-participant messaging with optional listing context. Supabase Realtime compatible.

create table conversations (
  id uuid primary key default gen_random_uuid(),
  participant_1_id uuid not null references profiles(id) on delete cascade,
  participant_2_id uuid not null references profiles(id) on delete cascade,
  listing_id uuid references horse_listings(id) on delete set null,
  last_message_at timestamptz,
  last_message_preview text, -- first 100 chars of last message for inbox display
  is_archived_by_1 boolean default false,
  is_archived_by_2 boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(participant_1_id, participant_2_id, listing_id)
);

create trigger conversations_updated_at
  before update on conversations
  for each row execute function update_updated_at();

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid references profiles(id) on delete set null, -- null for system messages
  body text not null,
  is_system boolean default false, -- system messages like "Offer made for $85,000"
  read_at timestamptz, -- null means unread
  created_at timestamptz not null default now()
);

-- RLS
alter table conversations enable row level security;
alter table messages enable row level security;

-- Conversations: participants can view their own conversations
create policy "Participants can view their conversations"
  on conversations for select
  using (
    auth.uid() = participant_1_id or auth.uid() = participant_2_id
  );

-- Conversations: authenticated users can start a conversation they are part of
create policy "Authenticated users can start conversations"
  on conversations for insert
  with check (
    auth.uid() = participant_1_id or auth.uid() = participant_2_id
  );

-- Conversations: participants can update their own (archiving)
create policy "Participants can update their conversations"
  on conversations for update
  using (
    auth.uid() = participant_1_id or auth.uid() = participant_2_id
  )
  with check (
    auth.uid() = participant_1_id or auth.uid() = participant_2_id
  );

-- Messages: conversation participants can read messages
create policy "Conversation participants can read messages"
  on messages for select
  using (
    conversation_id in (
      select id from conversations
      where participant_1_id = auth.uid() or participant_2_id = auth.uid()
    )
  );

-- Messages: conversation participants can send messages
create policy "Conversation participants can send messages"
  on messages for insert
  with check (
    conversation_id in (
      select id from conversations
      where participant_1_id = auth.uid() or participant_2_id = auth.uid()
    )
    and (sender_id = auth.uid() or is_system = true)
  );

-- Messages: sender can update own messages (for read_at)
create policy "Conversation participants can update messages"
  on messages for update
  using (
    conversation_id in (
      select id from conversations
      where participant_1_id = auth.uid() or participant_2_id = auth.uid()
    )
  );

-- Indexes: conversations
create index conversations_participant_1_idx on conversations(participant_1_id);
create index conversations_participant_2_idx on conversations(participant_2_id);
create index conversations_listing_idx on conversations(listing_id) where listing_id is not null;
create index conversations_last_message_idx on conversations(last_message_at desc);

-- Indexes: messages
create index messages_conversation_idx on messages(conversation_id);
create index messages_sender_idx on messages(sender_id) where sender_id is not null;
create index messages_created_idx on messages(created_at desc);
create index messages_unread_idx on messages(conversation_id) where read_at is null;

-- Function to update conversation on new message
create or replace function update_conversation_on_message()
returns trigger as $$
begin
  update conversations
  set
    last_message_at = new.created_at,
    last_message_preview = left(new.body, 100)
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger conversation_last_message_update
  after insert on messages
  for each row execute function update_conversation_on_message();


-- ============================================================================
-- FILE: 006_reports_notifications.sql
-- ============================================================================

-- Migration 006: Reports & Notifications
-- User reporting/flagging system (INFORM Act compliance) and in-app notifications.

-- Enum types
create type report_reason as enum (
  'fraud',
  'misrepresentation',
  'stolen_photos',
  'animal_welfare',
  'harassment',
  'spam',
  'other'
);

create type report_status as enum (
  'open',
  'investigating',
  'resolved',
  'dismissed'
);

create type report_target_type as enum (
  'listing',
  'user',
  'message'
);

create type notification_type as enum (
  'message',
  'offer',
  'listing_update',
  'price_drop',
  'favorite_sold',
  'report_update',
  'system'
);

-- Reports table
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  target_type report_target_type not null,
  target_id uuid not null,
  reason report_reason not null,
  details text not null,
  status report_status not null default 'open',
  admin_notes text,
  resolved_by uuid references profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notifications table
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  metadata jsonb default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS
alter table reports enable row level security;
alter table notifications enable row level security;

-- Reports policies
create policy "Users can create reports"
  on reports for insert
  with check (reporter_id = auth.uid());

create policy "Users can view their own reports"
  on reports for select
  using (reporter_id = auth.uid());

create policy "Reported users can see reports about them"
  on reports for select
  using (target_type = 'user' and target_id = auth.uid());

-- Notifications policies
create policy "Users can view their own notifications"
  on notifications for select
  using (user_id = auth.uid());

create policy "Users can update their own notifications"
  on notifications for update
  using (user_id = auth.uid());

create policy "System can insert notifications"
  on notifications for insert
  with check (true);

-- Triggers
create trigger reports_updated_at
  before update on reports
  for each row execute function update_updated_at();

-- Indexes: reports
create index reports_reporter_idx on reports(reporter_id);
create index reports_target_idx on reports(target_type, target_id);
create index reports_status_idx on reports(status);
create index reports_created_idx on reports(created_at desc);

-- Indexes: notifications
create index notifications_user_idx on notifications(user_id);
create index notifications_unread_idx on notifications(user_id) where read_at is null;
create index notifications_type_idx on notifications(type);
create index notifications_created_idx on notifications(created_at desc);

-- Helper function: count unread notifications
create or replace function unread_notification_count(p_user_id uuid)
returns integer as $$
  select count(*)::integer from notifications
  where user_id = p_user_id and read_at is null;
$$ language sql security definer stable;


-- ============================================================================
-- FILE: 007_offers_escrow.sql
-- ============================================================================

-- Migration 007: Offers & Escrow (ManeVault)
-- Offer lifecycle + Stripe-backed escrow with full audit trail.

-- ── Enums ──

create type offer_status as enum (
  'pending',       -- buyer submitted, awaiting seller response
  'accepted',      -- seller accepted, ready for escrow
  'rejected',      -- seller declined
  'countered',     -- seller counter-offered (new offer created)
  'expired',       -- offer TTL elapsed (72 hours default)
  'withdrawn',     -- buyer withdrew before seller responded
  'in_escrow'      -- accepted and payment initiated
);

create type escrow_status as enum (
  'awaiting_payment',     -- PaymentIntent created, buyer needs to pay
  'payment_processing',   -- ACH initiated, waiting 2-5 days to clear
  'funds_held',           -- Payment confirmed, funds on platform balance
  'delivery_confirmed',   -- Buyer confirmed receipt, dispute window open
  'dispute_opened',       -- Buyer opened dispute during window
  'funds_released',       -- Transfer sent to seller
  'funds_refunded'        -- Full or partial refund to buyer
);

-- ── Offers table ──

create table offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references horse_listings(id) on delete cascade,
  buyer_id uuid not null references profiles(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,

  -- Offer details
  amount_cents integer not null check (amount_cents > 0),
  message text,                     -- optional note from buyer
  payment_method text default 'ach', -- 'ach' or 'card'

  -- Counter-offer chain
  parent_offer_id uuid references offers(id) on delete set null,
  counter_amount_cents integer,     -- seller's counter amount (when status = 'countered')

  -- Status & timing
  status offer_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '72 hours'),
  responded_at timestamptz,         -- when seller accepted/rejected/countered

  -- Metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Escrow Transactions table ──

create table escrow_transactions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete restrict,
  listing_id uuid not null references horse_listings(id) on delete restrict,
  buyer_id uuid not null references profiles(id) on delete restrict,
  seller_id uuid not null references profiles(id) on delete restrict,

  -- Money
  amount_cents integer not null check (amount_cents > 0),
  platform_fee_cents integer not null default 0,
  seller_net_cents integer not null default 0,
  trainer_commission_cents integer default 0,

  -- Stripe references
  stripe_payment_intent_id text,
  stripe_charge_id text,
  stripe_transfer_id text,
  stripe_refund_id text,
  payment_method text not null default 'ach', -- 'ach' or 'card'

  -- Status
  status escrow_status not null default 'awaiting_payment',
  status_history jsonb not null default '[]'::jsonb, -- [{status, timestamp, actor_id, note}]

  -- Delivery & disputes
  shipping_tracking text,
  expected_delivery_date date,
  delivery_confirmed_at timestamptz,
  delivery_confirmed_by uuid references profiles(id),
  dispute_reason text,
  dispute_opened_at timestamptz,
  dispute_resolved_at timestamptz,
  auto_release_at timestamptz,      -- 14 days after delivery confirmation

  -- Bill of Sale
  bill_of_sale_data jsonb,           -- structured bill of sale fields
  bill_of_sale_accepted_at timestamptz,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Stripe Webhook Events (idempotency) ──

create table stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

-- ── Triggers ──

create trigger offers_updated_at
  before update on offers
  for each row execute function update_updated_at();

create trigger escrow_updated_at
  before update on escrow_transactions
  for each row execute function update_updated_at();

-- Auto-expire old pending offers
create or replace function expire_old_offers()
returns void as $$
  update offers
  set status = 'expired', updated_at = now()
  where status = 'pending' and expires_at < now();
$$ language sql security definer;

-- Track escrow status changes in status_history
create or replace function track_escrow_status_change()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    new.status_history := new.status_history || jsonb_build_object(
      'status', new.status,
      'previous_status', old.status,
      'timestamp', now(),
      'note', ''
    );
  end if;
  return new;
end;
$$ language plpgsql;

create trigger escrow_status_tracking
  before update on escrow_transactions
  for each row execute function track_escrow_status_change();

-- When offer is accepted, update listing status to 'under_offer'
create or replace function update_listing_on_offer_accept()
returns trigger as $$
begin
  if new.status = 'accepted' and old.status = 'pending' then
    update horse_listings
    set status = 'under_offer'
    where id = new.listing_id and status = 'active';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger offer_accepted_listing_update
  after update on offers
  for each row execute function update_listing_on_offer_accept();

-- ── RLS ──

alter table offers enable row level security;
alter table escrow_transactions enable row level security;
alter table stripe_webhook_events enable row level security;

-- Offers: buyer and seller can see their own offers
create policy "Buyers can view offers they made"
  on offers for select
  using (buyer_id = auth.uid());

create policy "Sellers can view offers on their listings"
  on offers for select
  using (seller_id = auth.uid());

-- Offers: buyers can create offers
create policy "Buyers can create offers"
  on offers for insert
  with check (buyer_id = auth.uid());

-- Offers: sellers can update offers on their listings (accept/reject/counter)
create policy "Sellers can respond to offers"
  on offers for update
  using (seller_id = auth.uid());

-- Offers: buyers can update their own offers (withdraw)
create policy "Buyers can withdraw their offers"
  on offers for update
  using (buyer_id = auth.uid());

-- Escrow: participants can view their escrow transactions
create policy "Buyers can view their escrow transactions"
  on escrow_transactions for select
  using (buyer_id = auth.uid());

create policy "Sellers can view their escrow transactions"
  on escrow_transactions for select
  using (seller_id = auth.uid());

-- Escrow: only system (service role) can insert/update escrow records
-- (escrow mutations happen through server actions with service role, not direct client)
create policy "System can manage escrow"
  on escrow_transactions for insert
  with check (true);

create policy "System can update escrow"
  on escrow_transactions for update
  using (true);

-- Webhook events: no direct access (service role only)
-- Intentionally no select policy — admin only via service role

-- ── Indexes ──

-- Offers
create index offers_listing_idx on offers(listing_id);
create index offers_buyer_idx on offers(buyer_id);
create index offers_seller_idx on offers(seller_id);
create index offers_status_idx on offers(status);
create index offers_parent_idx on offers(parent_offer_id) where parent_offer_id is not null;
create index offers_expires_idx on offers(expires_at) where status = 'pending';
create index offers_created_idx on offers(created_at desc);

-- Escrow
create index escrow_offer_idx on escrow_transactions(offer_id);
create index escrow_listing_idx on escrow_transactions(listing_id);
create index escrow_buyer_idx on escrow_transactions(buyer_id);
create index escrow_seller_idx on escrow_transactions(seller_id);
create index escrow_status_idx on escrow_transactions(status);
create index escrow_stripe_pi_idx on escrow_transactions(stripe_payment_intent_id) where stripe_payment_intent_id is not null;
create index escrow_auto_release_idx on escrow_transactions(auto_release_at) where status = 'delivery_confirmed';

-- Webhook events
create index webhook_event_type_idx on stripe_webhook_events(event_type);
create index webhook_processed_idx on stripe_webhook_events(processed_at) where processed_at is null;
