-- Lightweight passes table for Match Mode
-- Tracks which listings a user has swiped left on (passed)
create table listing_passes (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references horse_listings(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(listing_id, user_id)
);

-- Indexes
create index passes_user_idx on listing_passes(user_id);
create index passes_listing_idx on listing_passes(listing_id);

-- RLS
alter table listing_passes enable row level security;

create policy "Users can manage their own passes"
  on listing_passes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
