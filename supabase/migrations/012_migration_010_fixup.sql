-- Migration 012: Fixup for 010 — applies the parts that failed due to primary_image_url column bug
-- Sections 6-7 of migration 010 that were not applied.

-- ============================================================
-- 6. Discovery feed helpers (fixed: subquery for primary image)
-- ============================================================

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
  (coalesce(hl.view_count, 0) + coalesce(hl.favorite_count, 0) * 3)
    * (1.0 / (1 + extract(epoch from now() - hl.created_at) / 86400)) as trending_score
from horse_listings hl
where hl.status = 'active'
order by trending_score desc
limit 100;

create unique index if not exists trending_horses_id_idx on trending_horses(id);

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

drop trigger if exists on_profile_created_notification_prefs on profiles;
create trigger on_profile_created_notification_prefs
  after insert on profiles
  for each row execute function create_default_notification_preferences();
