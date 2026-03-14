-- Match Mode Insights — admin queries for listing_interactions
-- Run against Supabase SQL Editor

-- Top liked horses (last 30 days)
select
  li.listing_id,
  hl.name,
  hl.slug,
  count(*) as favorites
from listing_interactions li
join horse_listings hl on hl.id = li.listing_id
where li.interaction_type = 'favorite'
  and li.created_at > now() - interval '30 days'
group by li.listing_id, hl.name, hl.slug
order by favorites desc
limit 20;

-- Most passed horses (last 30 days)
select
  li.listing_id,
  hl.name,
  hl.slug,
  count(*) as passes
from listing_interactions li
join horse_listings hl on hl.id = li.listing_id
where li.interaction_type = 'pass'
  and li.created_at > now() - interval '30 days'
group by li.listing_id, hl.name, hl.slug
order by passes desc
limit 20;

-- Favorite rate per listing (min 5 interactions)
select
  li.listing_id,
  hl.name,
  count(*) filter (where li.interaction_type = 'favorite') as favorites,
  count(*) filter (where li.interaction_type = 'pass') as passes,
  round(
    count(*) filter (where li.interaction_type = 'favorite')::numeric /
    nullif(count(*) filter (where li.interaction_type in ('favorite', 'pass')), 0),
    3
  ) as favorite_rate
from listing_interactions li
join horse_listings hl on hl.id = li.listing_id
where li.interaction_type in ('favorite', 'pass')
  and li.created_at > now() - interval '30 days'
group by li.listing_id, hl.name
having count(*) >= 5
order by favorite_rate desc;

-- Daily interaction volume
select
  date_trunc('day', created_at) as day,
  interaction_type,
  count(*)
from listing_interactions
where created_at > now() - interval '30 days'
group by day, interaction_type
order by day desc;

-- Unique active users per day
select
  date_trunc('day', created_at) as day,
  count(distinct user_id) as unique_users
from listing_interactions
where created_at > now() - interval '30 days'
group by day
order by day desc;
