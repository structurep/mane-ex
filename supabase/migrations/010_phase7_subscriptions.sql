-- Migration 010: Phase 7 — Subscriptions, Notifications, Quiz, Discovery
-- Stripe subscription billing, notification preferences, homepage quiz, discovery feed.

-- ============================================================
-- 1. Add Stripe customer fields to profiles
-- ============================================================
alter table profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text default 'none',
  add column if not exists subscription_current_period_end timestamptz;

create index if not exists profiles_stripe_customer_idx
  on profiles(stripe_customer_id)
  where stripe_customer_id is not null;

-- ============================================================
-- 2. Notification preferences
-- ============================================================
create table notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,

  -- Email preferences
  email_offers boolean not null default true,
  email_messages boolean not null default true,
  email_price_drops boolean not null default true,
  email_new_matches boolean not null default true,
  email_just_sold boolean not null default false,
  email_weekly_digest boolean not null default true,
  email_marketing boolean not null default false,

  -- Push preferences
  push_offers boolean not null default true,
  push_messages boolean not null default true,
  push_price_drops boolean not null default true,
  push_new_matches boolean not null default true,
  push_just_sold boolean not null default true,

  -- Push registration
  push_subscription jsonb, -- Web Push subscription object

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint notification_preferences_user_unique unique (user_id)
);

alter table notification_preferences enable row level security;

create policy "Users can view own notification preferences"
  on notification_preferences for select
  using (user_id = auth.uid());

create policy "Users can insert own notification preferences"
  on notification_preferences for insert
  with check (user_id = auth.uid());

create policy "Users can update own notification preferences"
  on notification_preferences for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create trigger notification_preferences_updated_at
  before update on notification_preferences
  for each row execute function update_updated_at();

-- ============================================================
-- 3. Add new notification types
-- ============================================================
alter type notification_type add value if not exists 'new_match';
alter type notification_type add value if not exists 'review_request';
alter type notification_type add value if not exists 'subscription';
alter type notification_type add value if not exists 'weekly_digest';
alter type notification_type add value if not exists 'trial_update';
alter type notification_type add value if not exists 'iso_match';

-- ============================================================
-- 4. Quiz results
-- ============================================================
create type quiz_archetype as enum (
  'casual_rider',
  'weekend_warrior',
  'pro_seller',
  'barn_manager',
  'elite_seller'
);

create table quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  session_id text, -- anonymous tracking
  answers jsonb not null default '{}',
  archetype quiz_archetype not null,
  recommended_tier seller_tier not null,
  created_at timestamptz not null default now()
);

alter table quiz_results enable row level security;

create policy "Users can view own quiz results"
  on quiz_results for select
  using (user_id = auth.uid() or session_id is not null);

create policy "Anyone can insert quiz results"
  on quiz_results for insert
  with check (true);

create index quiz_results_user_idx on quiz_results(user_id) where user_id is not null;

-- ============================================================
-- 5. Subscription event log (idempotent webhook processing)
-- ============================================================
create table subscription_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  customer_id text,
  subscription_id text,
  payload jsonb default '{}',
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

-- No RLS needed — only accessed by service role in webhooks

-- ============================================================
-- 6. Discovery feed helpers
-- ============================================================

-- Materialized view for trending horses (refreshed periodically)
create materialized view if not exists trending_horses as
select
  hl.id,
  hl.name,
  hl.slug,
  hl.breed,
  hl.price,
  hl.height_hands,
  hl.location_state,
  (select lm.url from listing_media lm where lm.listing_id = hl.id and lm.is_primary = true limit 1) as primary_image_url,
  hl.seller_id,
  hl.created_at,
  coalesce(hl.view_count, 0) as view_count,
  coalesce(hl.favorite_count, 0) as favorite_count,
  -- Trending score: views + 3x favorites, weighted by recency
  (coalesce(hl.view_count, 0) + coalesce(hl.favorite_count, 0) * 3)
    * (1.0 / (1 + extract(epoch from now() - hl.created_at) / 86400)) as trending_score
from horse_listings hl
where hl.status = 'active'
order by trending_score desc
limit 100;

create unique index if not exists trending_horses_id_idx on trending_horses(id);

-- Function to refresh trending horses (called by Vercel Cron)
create or replace function refresh_trending_horses()
returns void as $$
begin
  refresh materialized view concurrently trending_horses;
end;
$$ language plpgsql security definer;

-- ============================================================
-- 7. Auto-create notification preferences on profile creation
-- ============================================================
create or replace function create_default_notification_preferences()
returns trigger as $$
begin
  insert into notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_notification_prefs
  after insert on profiles
  for each row execute function create_default_notification_preferences();
