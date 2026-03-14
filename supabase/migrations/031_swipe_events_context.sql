-- Add marketplace context to swipe events for analytics
alter table swipe_events
  add column discipline text,
  add column price int,
  add column location text,
  add column seller_id uuid;

-- Index for discipline/price analytics
create index idx_swipe_events_discipline on swipe_events (discipline, direction) where discipline is not null;
