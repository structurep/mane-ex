-- Migration 036: Transport Requests
-- Captures buyer interest in transport help for a listing.
-- Lightweight lead capture — no external integration yet.

create table if not exists transport_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references horse_listings(id) on delete cascade,
  origin_state text not null,
  destination_state text not null,
  estimated_low integer not null,
  estimated_high integer not null,
  distance_miles integer not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_transport_requests_user on transport_requests (user_id, created_at desc);
create index idx_transport_requests_listing on transport_requests (listing_id, created_at desc);

-- RLS
alter table transport_requests enable row level security;

create policy "Users can insert own transport requests"
  on transport_requests for insert
  with check (auth.uid() = user_id);

create policy "Users can read own transport requests"
  on transport_requests for select
  using (auth.uid() = user_id);

-- Sellers can see requests for their listings
create policy "Sellers can read transport requests for their listings"
  on transport_requests for select
  using (
    listing_id in (
      select id from horse_listings where seller_id = auth.uid()
    )
  );
