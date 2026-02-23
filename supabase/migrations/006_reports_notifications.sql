-- Migration 006: Reports & Notifications
-- User reporting/flagging system (INFORM Act compliance) and in-app notifications.

-- Enum types
create type report_reason as enum (
  'fraud',
  'misrepresentation',
  'stolen_photos',
  'animal_welfare',
  'harassment',
  'spam',
  'other'
);

create type report_status as enum (
  'open',
  'investigating',
  'resolved',
  'dismissed'
);

create type report_target_type as enum (
  'listing',
  'user',
  'message'
);

create type notification_type as enum (
  'message',
  'offer',
  'listing_update',
  'price_drop',
  'favorite_sold',
  'report_update',
  'system'
);

-- Reports table
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  target_type report_target_type not null,
  target_id uuid not null,
  reason report_reason not null,
  details text not null,
  status report_status not null default 'open',
  admin_notes text,
  resolved_by uuid references profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notifications table
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  metadata jsonb default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS
alter table reports enable row level security;
alter table notifications enable row level security;

-- Reports policies
create policy "Users can create reports"
  on reports for insert
  with check (reporter_id = auth.uid());

create policy "Users can view their own reports"
  on reports for select
  using (reporter_id = auth.uid());

create policy "Reported users can see reports about them"
  on reports for select
  using (target_type = 'user' and target_id = auth.uid());

-- Notifications policies
create policy "Users can view their own notifications"
  on notifications for select
  using (user_id = auth.uid());

create policy "Users can update their own notifications"
  on notifications for update
  using (user_id = auth.uid());

create policy "System can insert notifications"
  on notifications for insert
  with check (true);

-- Triggers
create trigger reports_updated_at
  before update on reports
  for each row execute function update_updated_at();

-- Indexes: reports
create index reports_reporter_idx on reports(reporter_id);
create index reports_target_idx on reports(target_type, target_id);
create index reports_status_idx on reports(status);
create index reports_created_idx on reports(created_at desc);

-- Indexes: notifications
create index notifications_user_idx on notifications(user_id);
create index notifications_unread_idx on notifications(user_id) where read_at is null;
create index notifications_type_idx on notifications(type);
create index notifications_created_idx on notifications(created_at desc);

-- Helper function: count unread notifications
create or replace function unread_notification_count(p_user_id uuid)
returns integer as $$
  select count(*)::integer from notifications
  where user_id = p_user_id and read_at is null;
$$ language sql security definer stable;
