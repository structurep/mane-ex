-- Saved searches with alert preferences
create table if not exists saved_searches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  filters     jsonb not null default '{}',
  alerts      boolean not null default true,
  match_count int not null default 0,
  last_checked_at timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for user lookups
create index if not exists idx_saved_searches_user on saved_searches(user_id);

-- RLS
alter table saved_searches enable row level security;

create policy "Users can view own saved searches"
  on saved_searches for select using (auth.uid() = user_id);

create policy "Users can insert own saved searches"
  on saved_searches for insert with check (auth.uid() = user_id);

create policy "Users can update own saved searches"
  on saved_searches for update using (auth.uid() = user_id);

create policy "Users can delete own saved searches"
  on saved_searches for delete using (auth.uid() = user_id);
