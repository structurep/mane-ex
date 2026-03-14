-- Swipe telemetry for Match Mode analytics
-- Fire-and-forget writes; never blocks gesture flow

create type swipe_direction as enum ('pass', 'favorite');
create type swipe_commit_reason as enum ('distance', 'velocity');

create table swipe_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  listing_id uuid not null references horse_listings(id) on delete cascade,
  direction swipe_direction not null,
  commit_reason swipe_commit_reason not null,
  drag_distance_px int not null,
  velocity_x real not null,
  swipe_duration_ms int not null,
  created_at timestamptz not null default now()
);

-- Index for per-listing analytics (most passed, most liked)
create index idx_swipe_events_listing on swipe_events (listing_id, direction);
-- Index for per-user session analysis
create index idx_swipe_events_user on swipe_events (user_id, created_at desc) where user_id is not null;

-- RLS: users can insert their own events; service role reads all
alter table swipe_events enable row level security;

create policy "Users insert own swipe events"
  on swipe_events for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users read own swipe events"
  on swipe_events for select
  using (auth.uid() = user_id);
