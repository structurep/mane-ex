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
