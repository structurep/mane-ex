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
