-- Migration 013: Fix notification preferences trigger
-- The trigger was causing user creation to fail (GoTrue 500 error).
-- Re-create with exception handling so it never blocks registration.

drop trigger if exists on_profile_created_notification_prefs on profiles;

create or replace function create_default_notification_preferences()
returns trigger as $$
begin
  begin
    insert into notification_preferences (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  exception when others then
    -- Never block user registration
    null;
  end;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_notification_prefs
  after insert on profiles
  for each row execute function create_default_notification_preferences();
