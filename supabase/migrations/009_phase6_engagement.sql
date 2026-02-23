-- Migration 009: Phase 6 — Collections (Dream Barn), Reviews, ISOs, Trials & Tours
-- Engagement layer: named collections, staged reviews, buyer requests, trial booking.

-- ══════════════════════════════════════
-- COLLECTIONS (Dream Barn)
-- Named boards wrapping listing_favorites (Pinterest-style)
-- ══════════════════════════════════════

create type collection_visibility as enum ('private', 'shared', 'public');

create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  cover_image_url text,
  visibility collection_visibility not null default 'private',
  item_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, slug)
);

create table collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections(id) on delete cascade,
  listing_id uuid not null references horse_listings(id) on delete cascade,
  price_at_added integer, -- cents, snapshot when saved
  notes text,
  added_at timestamptz not null default now(),
  unique(collection_id, listing_id)
);

-- ══════════════════════════════════════
-- REVIEWS
-- Staged: auto-requested at inquiry → trial → offer → completion
-- ══════════════════════════════════════

create type review_stage as enum (
  'inquiry',     -- after messaging
  'trial',       -- after trial visit
  'offer',       -- after offer made
  'completion'   -- after escrow release
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references profiles(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,
  listing_id uuid references horse_listings(id) on delete set null,
  offer_id uuid references offers(id) on delete set null,
  stage review_stage not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  body text not null check (char_length(body) >= 10 and char_length(body) <= 2000),
  seller_response text,
  seller_responded_at timestamptz,
  is_verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ══════════════════════════════════════
-- ISOs (In Search Of)
-- Buyer posts criteria → trainers/sellers match horses → buyer notified
-- ══════════════════════════════════════

create type iso_status as enum ('active', 'paused', 'fulfilled', 'expired', 'closed');

create table iso_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null check (char_length(title) >= 5 and char_length(title) <= 200),
  description text not null check (char_length(description) >= 20 and char_length(description) <= 5000),

  -- Search criteria
  discipline_ids uuid[] default '{}',
  min_price integer, -- cents
  max_price integer, -- cents
  min_height_hands numeric(4,1),
  max_height_hands numeric(4,1),
  min_age integer,
  max_age integer,
  gender text[], -- array of 'mare', 'gelding', 'stallion'
  breeds text[],
  preferred_states text[],
  level text,

  -- Status
  status iso_status not null default 'active',
  match_count integer not null default 0,
  expires_at timestamptz not null default (now() + interval '90 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type iso_match_status as enum ('pending', 'viewed', 'interested', 'dismissed');

create table iso_matches (
  id uuid primary key default gen_random_uuid(),
  iso_id uuid not null references iso_posts(id) on delete cascade,
  listing_id uuid not null references horse_listings(id) on delete cascade,
  matched_by uuid not null references profiles(id) on delete cascade, -- trainer/seller who matched
  message text check (char_length(message) <= 1000),
  status iso_match_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique(iso_id, listing_id)
);

-- ══════════════════════════════════════
-- TRIALS & TOURS
-- Trial booking with preferred/alternate dates
-- Multi-barn tour planner groups trials into itinerary
-- ══════════════════════════════════════

create type trial_status as enum (
  'requested',
  'confirmed',
  'rescheduled',
  'completed',
  'cancelled',
  'no_show'
);

create table trial_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references horse_listings(id) on delete cascade,
  buyer_id uuid not null references profiles(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,
  preferred_date timestamptz not null,
  alternate_date timestamptz,
  confirmed_date timestamptz, -- final agreed date
  status trial_status not null default 'requested',
  buyer_notes text check (char_length(buyer_notes) <= 2000),
  seller_notes text check (char_length(seller_notes) <= 2000),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type tour_status as enum ('planning', 'confirmed', 'in_progress', 'completed', 'cancelled');

create table tours (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null check (char_length(name) >= 1 and char_length(name) <= 200),
  tour_date date not null,
  status tour_status not null default 'planning',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tour_stops (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references tours(id) on delete cascade,
  trial_request_id uuid not null references trial_requests(id) on delete cascade,
  stop_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(tour_id, trial_request_id)
);

-- ══════════════════════════════════════
-- RLS POLICIES
-- ══════════════════════════════════════

alter table collections enable row level security;
alter table collection_items enable row level security;
alter table reviews enable row level security;
alter table iso_posts enable row level security;
alter table iso_matches enable row level security;
alter table trial_requests enable row level security;
alter table tours enable row level security;
alter table tour_stops enable row level security;

-- Collections: owner sees all, public/shared visible to everyone
create policy "Users can manage own collections"
  on collections for all
  using (user_id = auth.uid());

create policy "Public/shared collections are readable"
  on collections for select
  using (visibility in ('public', 'shared'));

-- Collection items: follow collection access
create policy "Users can manage items in own collections"
  on collection_items for all
  using (
    collection_id in (select id from collections where user_id = auth.uid())
  );

create policy "Items in public/shared collections are readable"
  on collection_items for select
  using (
    collection_id in (select id from collections where visibility in ('public', 'shared'))
  );

-- Reviews: publicly readable, only reviewer can write
create policy "Reviews are publicly readable"
  on reviews for select
  using (true);

create policy "Users can create reviews"
  on reviews for insert
  with check (reviewer_id = auth.uid());

create policy "Reviewers can update own reviews"
  on reviews for update
  using (reviewer_id = auth.uid());

-- Seller can respond to reviews (update seller_response field only via server action)
create policy "Sellers can respond to reviews about them"
  on reviews for update
  using (seller_id = auth.uid());

-- ISOs: active ISOs publicly readable, owner can manage
create policy "Active ISOs are publicly readable"
  on iso_posts for select
  using (status = 'active' or user_id = auth.uid());

create policy "Users can manage own ISOs"
  on iso_posts for all
  using (user_id = auth.uid());

-- ISO Matches: visible to ISO owner and the matcher
create policy "ISO matches visible to participants"
  on iso_matches for select
  using (
    matched_by = auth.uid()
    or iso_id in (select id from iso_posts where user_id = auth.uid())
  );

create policy "Authenticated users can create matches"
  on iso_matches for insert
  with check (matched_by = auth.uid());

create policy "Matchers can update own matches"
  on iso_matches for update
  using (matched_by = auth.uid());

-- ISO owner can update match status (interested/dismissed)
create policy "ISO owners can update match status"
  on iso_matches for update
  using (
    iso_id in (select id from iso_posts where user_id = auth.uid())
  );

-- Trials: visible to buyer and seller
create policy "Trial participants can view"
  on trial_requests for select
  using (buyer_id = auth.uid() or seller_id = auth.uid());

create policy "Buyers can request trials"
  on trial_requests for insert
  with check (buyer_id = auth.uid());

create policy "Participants can update trials"
  on trial_requests for update
  using (buyer_id = auth.uid() or seller_id = auth.uid());

-- Tours: owner only
create policy "Users can manage own tours"
  on tours for all
  using (user_id = auth.uid());

-- Tour stops: follow tour access
create policy "Users can manage own tour stops"
  on tour_stops for all
  using (
    tour_id in (select id from tours where user_id = auth.uid())
  );

-- ══════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════

-- Collections
create index collections_user_idx on collections(user_id);
create index collections_visibility_idx on collections(visibility) where visibility in ('public', 'shared');
create index collection_items_collection_idx on collection_items(collection_id);
create index collection_items_listing_idx on collection_items(listing_id);

-- Reviews
create index reviews_seller_idx on reviews(seller_id);
create index reviews_listing_idx on reviews(listing_id) where listing_id is not null;
create index reviews_reviewer_idx on reviews(reviewer_id);
create index reviews_stage_idx on reviews(stage);
create index reviews_rating_idx on reviews(rating);
create index reviews_created_idx on reviews(created_at desc);

-- ISOs
create index iso_posts_user_idx on iso_posts(user_id);
create index iso_posts_status_idx on iso_posts(status) where status = 'active';
create index iso_posts_created_idx on iso_posts(created_at desc);
create index iso_matches_iso_idx on iso_matches(iso_id);
create index iso_matches_listing_idx on iso_matches(listing_id);
create index iso_matches_matched_by_idx on iso_matches(matched_by);

-- Trials
create index trials_listing_idx on trial_requests(listing_id);
create index trials_buyer_idx on trial_requests(buyer_id);
create index trials_seller_idx on trial_requests(seller_id);
create index trials_status_idx on trial_requests(status);
create index trials_date_idx on trial_requests(preferred_date);

-- Tours
create index tours_user_idx on tours(user_id);
create index tours_date_idx on tours(tour_date);
create index tour_stops_tour_idx on tour_stops(tour_id);

-- ══════════════════════════════════════
-- TRIGGERS & FUNCTIONS
-- ══════════════════════════════════════

-- Auto-update collection item count
create or replace function update_collection_item_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update collections set item_count = item_count + 1, updated_at = now() where id = new.collection_id;
    return new;
  elsif tg_op = 'DELETE' then
    update collections set item_count = item_count - 1, updated_at = now() where id = old.collection_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger collection_item_count_update
  after insert or delete on collection_items
  for each row execute function update_collection_item_count();

-- Auto-update ISO match count
create or replace function update_iso_match_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update iso_posts set match_count = match_count + 1, updated_at = now() where id = new.iso_id;
    return new;
  elsif tg_op = 'DELETE' then
    update iso_posts set match_count = match_count - 1, updated_at = now() where id = old.iso_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger iso_match_count_update
  after insert or delete on iso_matches
  for each row execute function update_iso_match_count();

-- Auto-update updated_at on all Phase 6 tables
create trigger collections_updated_at
  before update on collections
  for each row execute function update_updated_at();

create trigger reviews_updated_at
  before update on reviews
  for each row execute function update_updated_at();

create trigger iso_posts_updated_at
  before update on iso_posts
  for each row execute function update_updated_at();

create trigger trial_requests_updated_at
  before update on trial_requests
  for each row execute function update_updated_at();

create trigger tours_updated_at
  before update on tours
  for each row execute function update_updated_at();

-- ══════════════════════════════════════
-- UPDATE BADGE EVALUATION FOR REVIEWS
-- Now that reviews exist, wire up the "highly_rated" badge
-- ══════════════════════════════════════

create or replace function evaluate_seller_badges(p_seller_id uuid)
returns seller_badge[] as $$
declare
  v_badges seller_badge[] := '{}';
  v_score record;
  v_avg_completeness numeric;
  v_avg_response_hours numeric;
  v_views_7d integer;
  v_total_favorites integer;
  v_completed_escrows integer;
  v_seller_tier seller_tier;
  v_consecutive_days integer;
  v_avg_rating numeric;
begin
  select * into v_score from seller_scores where seller_id = p_seller_id;

  -- 1. Documentation Champion: avg completeness >= 750
  select coalesce(avg(completeness_score), 0)
  into v_avg_completeness
  from horse_listings
  where seller_id = p_seller_id and status in ('active', 'under_offer', 'sold');

  if v_avg_completeness >= 750 then
    v_badges := array_append(v_badges, 'documentation_champion'::seller_badge);
  end if;

  -- 2. Fast Responder: avg response time < 4 hours
  select coalesce(
    extract(epoch from avg(first_response.responded_at - first_response.started_at)) / 3600.0,
    999
  )
  into v_avg_response_hours
  from (
    select c.created_at as started_at, min(m.created_at) as responded_at
    from conversations c
    join messages m on m.conversation_id = c.id
    where c.participant_ids @> array[p_seller_id]
      and m.sender_id = p_seller_id and m.is_system = false
    group by c.id, c.created_at
  ) as first_response;

  if v_avg_response_hours < 4 then
    v_badges := array_append(v_badges, 'fast_responder'::seller_badge);
  end if;

  -- 3. Elite Seller: Mane Score >= 900
  if v_score is not null and v_score.mane_score >= 900 then
    v_badges := array_append(v_badges, 'elite_seller'::seller_badge);
  end if;

  -- 4. Trending: 100+ views in last 7 days
  select coalesce(sum(view_count), 0)
  into v_views_7d
  from horse_listings
  where seller_id = p_seller_id
    and status = 'active'
    and updated_at > now() - interval '7 days';

  if v_views_7d >= 100 then
    v_badges := array_append(v_badges, 'trending'::seller_badge);
  end if;

  -- 5. Highly Rated: 4.5+ avg rating (NOW WIRED UP)
  select coalesce(avg(rating)::numeric, 0)
  into v_avg_rating
  from reviews
  where seller_id = p_seller_id;

  if v_avg_rating >= 4.5 and (select count(*) from reviews where seller_id = p_seller_id) >= 3 then
    v_badges := array_append(v_badges, 'highly_rated'::seller_badge);
  end if;

  -- 6. Escrow Verified: 3+ completed escrow transactions
  select count(*)
  into v_completed_escrows
  from escrow_transactions
  where seller_id = p_seller_id and status = 'funds_released';

  if v_completed_escrows >= 3 then
    v_badges := array_append(v_badges, 'escrow_verified'::seller_badge);
  end if;

  -- 7. Platinum: seller_tier = 'premium'
  select seller_tier into v_seller_tier from profiles where id = p_seller_id;

  if v_seller_tier = 'premium' then
    v_badges := array_append(v_badges, 'platinum'::seller_badge);
  end if;

  -- 8. Consistent: 30+ consecutive active days
  if v_score is not null and v_score.consecutive_active_days >= 30 then
    v_badges := array_append(v_badges, 'consistent'::seller_badge);
  end if;

  -- 9. Community Favorite: 50+ total favorites
  select coalesce(sum(favorite_count), 0)
  into v_total_favorites
  from horse_listings
  where seller_id = p_seller_id and status in ('active', 'under_offer', 'sold');

  if v_total_favorites >= 50 then
    v_badges := array_append(v_badges, 'community_favorite'::seller_badge);
  end if;

  -- Update the seller_scores record
  update seller_scores
  set badges = v_badges, updated_at = now()
  where seller_id = p_seller_id;

  return v_badges;
end;
$$ language plpgsql security definer;

-- ══════════════════════════════════════
-- HELPER: Get seller average rating
-- Used by seller profile pages and Mane Score
-- ══════════════════════════════════════

create or replace function get_seller_review_stats(p_seller_id uuid)
returns jsonb as $$
declare
  v_avg_rating numeric;
  v_review_count integer;
  v_stage_counts jsonb;
begin
  select avg(rating)::numeric(3,2), count(*)
  into v_avg_rating, v_review_count
  from reviews
  where seller_id = p_seller_id;

  select jsonb_object_agg(stage, cnt)
  into v_stage_counts
  from (
    select stage, count(*) as cnt
    from reviews
    where seller_id = p_seller_id
    group by stage
  ) as stage_data;

  return jsonb_build_object(
    'average_rating', coalesce(v_avg_rating, 0),
    'review_count', coalesce(v_review_count, 0),
    'by_stage', coalesce(v_stage_counts, '{}'::jsonb)
  );
end;
$$ language plpgsql security definer;
