-- Allow public SELECT on swipe_events for trending aggregation.
-- Only listing_id and direction are needed; user_id is nullable anyway.
-- The trending endpoint reads aggregate counts, not individual user data.

create policy "Public read swipe events for trending"
  on swipe_events for select
  using (true);
