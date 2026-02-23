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
