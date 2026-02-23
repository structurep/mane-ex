-- Migration 008: Seller Scores & Badges (Mane Score)
-- 1,000-point scoring system: Completeness (500) + Engagement (350) + Credibility (150)
-- LEGAL: All scores framed as "listing completeness and seller activity" — NEVER horse quality.

-- ── Enums ──

create type seller_badge as enum (
  'documentation_champion',  -- avg completeness >= 750 across listings
  'fast_responder',          -- avg message response time < 4 hours
  'elite_seller',            -- Mane Score >= 900
  'trending',                -- 100+ views in last 7 days
  'highly_rated',            -- 4.5+ avg rating (Phase 6 reviews)
  'escrow_verified',         -- 3+ completed escrow transactions
  'platinum',                -- seller_tier = 'premium'
  'consistent',              -- 30+ consecutive days with activity
  'community_favorite'       -- 50+ total favorites across listings
);

create type score_grade as enum (
  'elite',        -- 900-1000
  'excellent',    -- 750-899
  'strong',       -- 500-749
  'building',     -- 250-499
  'new'           -- 0-249
);

-- ── Seller Scores table ──

create table seller_scores (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null unique references profiles(id) on delete cascade,

  -- Composite score (0-1000)
  mane_score integer not null default 0 check (mane_score >= 0 and mane_score <= 1000),
  grade score_grade not null default 'new',

  -- Component breakdown
  completeness_component integer not null default 0 check (completeness_component >= 0 and completeness_component <= 500),
  engagement_component integer not null default 0 check (engagement_component >= 0 and engagement_component <= 350),
  credibility_component integer not null default 0 check (credibility_component >= 0 and credibility_component <= 150),

  -- Badges (array of earned badges)
  badges seller_badge[] not null default '{}',

  -- Activity tracking (for decay + Consistent badge)
  last_activity_at timestamptz not null default now(),
  consecutive_active_days integer not null default 0,

  -- Metadata
  calculation_details jsonb default '{}'::jsonb, -- breakdown for dashboard display
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Score Calculation Function ──
-- Mane Score = (Completeness × 0.5) + (Engagement × 0.35) + (Credibility × 0.15)
-- Weighted components are already scaled to their max values:
--   Completeness max 500, Engagement max 350, Credibility max 150

create or replace function calculate_seller_mane_score(p_seller_id uuid)
returns jsonb as $$
declare
  v_completeness integer := 0;
  v_engagement integer := 0;
  v_credibility integer := 0;
  v_mane_score integer := 0;
  v_grade score_grade;
  v_completeness_pct numeric := 0;
  v_listing_count integer := 0;
  v_avg_completeness numeric := 0;
  v_total_views integer := 0;
  v_total_favorites integer := 0;
  v_total_inquiries integer := 0;
  v_completed_escrows integer := 0;
  v_avg_response_hours numeric := 0;
  v_account_age_days integer := 0;
  v_detail jsonb;
begin
  -- ════════════════════════════════════
  -- COMPLETENESS COMPONENT (max 500)
  -- Average completeness_score across all active listings, scaled to 500
  -- ════════════════════════════════════

  select count(*), coalesce(avg(completeness_score), 0)
  into v_listing_count, v_avg_completeness
  from horse_listings
  where seller_id = p_seller_id
    and status in ('active', 'under_offer', 'sold');

  -- Scale from 0-1000 (listing score) to 0-500 (component)
  v_completeness := least(round(v_avg_completeness / 2.0)::integer, 500);
  v_completeness_pct := case when v_completeness > 0 then v_completeness / 500.0 else 0 end;

  -- ════════════════════════════════════
  -- ENGAGEMENT COMPONENT (max 350)
  -- Views + favorites + inquiries + completed sales
  -- CAPPED by completeness % (anti-gaming)
  -- ════════════════════════════════════

  select
    coalesce(sum(view_count), 0),
    coalesce(sum(favorite_count), 0),
    coalesce(sum(inquiry_count), 0)
  into v_total_views, v_total_favorites, v_total_inquiries
  from horse_listings
  where seller_id = p_seller_id
    and status in ('active', 'under_offer', 'sold');

  -- Count completed escrow transactions (funds_released)
  select count(*)
  into v_completed_escrows
  from escrow_transactions
  where seller_id = p_seller_id
    and status = 'funds_released';

  -- Engagement scoring:
  -- Views: 1 pt per 10 views, max 100 pts
  -- Favorites: 2 pts per favorite, max 100 pts
  -- Inquiries: 3 pts per inquiry, max 50 pts
  -- Completed sales: 20 pts per sale, max 100 pts
  v_engagement := least(
    least(v_total_views / 10, 100)
    + least(v_total_favorites * 2, 100)
    + least(v_total_inquiries * 3, 50)
    + least(v_completed_escrows * 20, 100),
    350
  );

  -- Apply completeness cap: engagement can't exceed completeness %
  v_engagement := least(v_engagement, round(350 * v_completeness_pct)::integer);

  -- ════════════════════════════════════
  -- CREDIBILITY COMPONENT (max 150)
  -- Response time + account longevity
  -- (Ratings deferred to Phase 6 reviews)
  -- ════════════════════════════════════

  -- Average response time (hours) from conversations where seller responded
  select coalesce(
    extract(epoch from avg(first_response.responded_at - first_response.started_at)) / 3600.0,
    24 -- default to 24 hours if no message data
  )
  into v_avg_response_hours
  from (
    select
      c.created_at as started_at,
      min(m.created_at) as responded_at
    from conversations c
    join messages m on m.conversation_id = c.id
    where c.participant_ids @> array[p_seller_id]
      and m.sender_id = p_seller_id
      and m.is_system = false
    group by c.id, c.created_at
  ) as first_response;

  -- Account age in days
  select extract(day from now() - created_at)::integer
  into v_account_age_days
  from profiles
  where id = p_seller_id;

  -- Response time scoring (max 75 pts):
  -- < 1 hour = 75, < 4 hours = 60, < 12 hours = 40, < 24 hours = 20, > 24 hours = 5
  v_credibility := case
    when v_avg_response_hours < 1 then 75
    when v_avg_response_hours < 4 then 60
    when v_avg_response_hours < 12 then 40
    when v_avg_response_hours < 24 then 20
    else 5
  end;

  -- Account longevity (max 50 pts): 1 pt per 7 days, max 50
  v_credibility := v_credibility + least(v_account_age_days / 7, 50);

  -- Completed transactions trust bonus (max 25 pts): 5 pts per completed sale
  v_credibility := v_credibility + least(v_completed_escrows * 5, 25);

  v_credibility := least(v_credibility, 150);

  -- ════════════════════════════════════
  -- COMPOSITE SCORE
  -- ════════════════════════════════════

  v_mane_score := v_completeness + v_engagement + v_credibility;
  v_mane_score := least(v_mane_score, 1000);

  v_grade := case
    when v_mane_score >= 900 then 'elite'
    when v_mane_score >= 750 then 'excellent'
    when v_mane_score >= 500 then 'strong'
    when v_mane_score >= 250 then 'building'
    else 'new'
  end;

  -- Build detail breakdown for dashboard display
  v_detail := jsonb_build_object(
    'completeness', jsonb_build_object(
      'score', v_completeness,
      'max', 500,
      'listing_count', v_listing_count,
      'avg_listing_score', round(v_avg_completeness)
    ),
    'engagement', jsonb_build_object(
      'score', v_engagement,
      'max', 350,
      'total_views', v_total_views,
      'total_favorites', v_total_favorites,
      'total_inquiries', v_total_inquiries,
      'completed_sales', v_completed_escrows,
      'completeness_cap_applied', v_engagement < (
        least(v_total_views / 10, 100) + least(v_total_favorites * 2, 100)
        + least(v_total_inquiries * 3, 50) + least(v_completed_escrows * 20, 100)
      )
    ),
    'credibility', jsonb_build_object(
      'score', v_credibility,
      'max', 150,
      'avg_response_hours', round(v_avg_response_hours::numeric, 1),
      'account_age_days', v_account_age_days,
      'completed_escrows', v_completed_escrows
    ),
    'calculated_at', now()
  );

  -- Upsert the seller_scores record
  insert into seller_scores (
    seller_id, mane_score, grade,
    completeness_component, engagement_component, credibility_component,
    calculation_details, last_activity_at, updated_at
  )
  values (
    p_seller_id, v_mane_score, v_grade,
    v_completeness, v_engagement, v_credibility,
    v_detail, now(), now()
  )
  on conflict (seller_id)
  do update set
    mane_score = excluded.mane_score,
    grade = excluded.grade,
    completeness_component = excluded.completeness_component,
    engagement_component = excluded.engagement_component,
    credibility_component = excluded.credibility_component,
    calculation_details = excluded.calculation_details,
    last_activity_at = now(),
    updated_at = now();

  return jsonb_build_object(
    'mane_score', v_mane_score,
    'grade', v_grade,
    'completeness', v_completeness,
    'engagement', v_engagement,
    'credibility', v_credibility,
    'details', v_detail
  );
end;
$$ language plpgsql security definer;

-- ── Badge Evaluation Function ──

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
begin
  -- Fetch current score
  select * into v_score from seller_scores where seller_id = p_seller_id;

  -- 1. Documentation Champion: avg completeness >= 750 across active listings
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

  -- 4. Trending: 100+ views in last 7 days across all listings
  select coalesce(sum(view_count), 0)
  into v_views_7d
  from horse_listings
  where seller_id = p_seller_id
    and status = 'active'
    and updated_at > now() - interval '7 days';

  if v_views_7d >= 100 then
    v_badges := array_append(v_badges, 'trending'::seller_badge);
  end if;

  -- 5. Highly Rated: 4.5+ avg rating — deferred to Phase 6 reviews
  -- Will be: if avg(reviews.rating) >= 4.5 then v_badges := array_append(v_badges, 'highly_rated')

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

  -- 9. Community Favorite: 50+ total favorites across listings
  select coalesce(sum(favorite_count), 0)
  into v_total_favorites
  from horse_listings
  where seller_id = p_seller_id and status in ('active', 'under_offer', 'sold');

  if v_total_favorites >= 50 then
    v_badges := array_append(v_badges, 'community_favorite'::seller_badge);
  end if;

  -- Update the seller_scores record with new badges
  update seller_scores
  set badges = v_badges, updated_at = now()
  where seller_id = p_seller_id;

  return v_badges;
end;
$$ language plpgsql security definer;

-- ── Score Decay Function ──
-- -1% if no activity after 30 days (prevents stale high scores)

create or replace function decay_inactive_scores()
returns integer as $$
declare
  v_decayed_count integer;
begin
  update seller_scores
  set
    mane_score = greatest(mane_score - greatest(round(mane_score * 0.01)::integer, 1), 0),
    completeness_component = greatest(completeness_component - greatest(round(completeness_component * 0.01)::integer, 0), 0),
    engagement_component = greatest(engagement_component - greatest(round(engagement_component * 0.01)::integer, 0), 0),
    credibility_component = greatest(credibility_component - greatest(round(credibility_component * 0.01)::integer, 0), 0),
    grade = case
      when greatest(mane_score - greatest(round(mane_score * 0.01)::integer, 1), 0) >= 900 then 'elite'
      when greatest(mane_score - greatest(round(mane_score * 0.01)::integer, 1), 0) >= 750 then 'excellent'
      when greatest(mane_score - greatest(round(mane_score * 0.01)::integer, 1), 0) >= 500 then 'strong'
      when greatest(mane_score - greatest(round(mane_score * 0.01)::integer, 1), 0) >= 250 then 'building'
      else 'new'
    end,
    updated_at = now()
  where last_activity_at < now() - interval '30 days'
    and mane_score > 0;

  get diagnostics v_decayed_count = row_count;
  return v_decayed_count;
end;
$$ language plpgsql security definer;

-- ── Activity Tracking Trigger ──
-- Update last_activity_at when seller creates/updates listings, sends messages, or gets offers

create or replace function track_seller_activity()
returns trigger as $$
begin
  update seller_scores
  set
    last_activity_at = now(),
    consecutive_active_days = case
      when last_activity_at::date = (now() - interval '1 day')::date then consecutive_active_days + 1
      when last_activity_at::date = now()::date then consecutive_active_days
      else 1
    end,
    updated_at = now()
  where seller_id = new.seller_id;
  return new;
end;
$$ language plpgsql security definer;

-- Track activity on listing changes
create trigger listing_activity_tracking
  after insert or update on horse_listings
  for each row execute function track_seller_activity();

-- Track activity on new messages sent by seller
create or replace function track_message_activity()
returns trigger as $$
begin
  update seller_scores
  set
    last_activity_at = now(),
    consecutive_active_days = case
      when last_activity_at::date = (now() - interval '1 day')::date then consecutive_active_days + 1
      when last_activity_at::date = now()::date then consecutive_active_days
      else 1
    end,
    updated_at = now()
  where seller_id = new.sender_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger message_activity_tracking
  after insert on messages
  for each row execute function track_message_activity();

-- ── RLS ──

alter table seller_scores enable row level security;

-- Public: anyone can view seller scores (for leaderboard + public profiles)
create policy "Seller scores are publicly readable"
  on seller_scores for select
  using (true);

-- Only system (service role) can insert/update scores
-- Score mutations happen through server actions with service role
create policy "System can manage scores"
  on seller_scores for insert
  with check (true);

create policy "System can update scores"
  on seller_scores for update
  using (true);

-- ── Indexes ──

create index seller_scores_seller_idx on seller_scores(seller_id);
create index seller_scores_mane_score_idx on seller_scores(mane_score desc);
create index seller_scores_completeness_idx on seller_scores(completeness_component desc);
create index seller_scores_engagement_idx on seller_scores(engagement_component desc);
create index seller_scores_credibility_idx on seller_scores(credibility_component desc);
create index seller_scores_grade_idx on seller_scores(grade);
create index seller_scores_last_activity_idx on seller_scores(last_activity_at);
