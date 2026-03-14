-- listing_interactions: unified event store for Match Mode signals
create type interaction_type as enum ('view', 'pass', 'favorite', 'open');
create type interaction_method as enum ('swipe', 'button', 'keyboard', 'tap');

create table listing_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  listing_id uuid not null references horse_listings(id) on delete cascade,
  interaction_type interaction_type not null,
  method interaction_method not null,
  price numeric,
  discipline text,
  location text,
  created_at timestamptz not null default now()
);

create index interactions_user_idx on listing_interactions(user_id);
create index interactions_listing_idx on listing_interactions(listing_id);
create index interactions_type_idx on listing_interactions(interaction_type);
create index interactions_created_idx on listing_interactions(created_at desc);

alter table listing_interactions enable row level security;

-- Users can insert their own interactions
create policy "Users can insert own interactions"
  on listing_interactions for insert
  with check (auth.uid() = user_id);

-- Users can read their own interactions
create policy "Users can read own interactions"
  on listing_interactions for select
  using (auth.uid() = user_id);
