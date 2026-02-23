-- Migration 011: Phase 8 — Admin Panel & Audit Logging
-- Admin role, audit log, moderation capabilities.

-- ============================================================
-- 1. Add admin role to profiles
-- ============================================================
alter table profiles
  add column if not exists is_admin boolean not null default false;

-- ============================================================
-- 2. Admin action enum
-- ============================================================
create type admin_action as enum (
  'approve_listing',
  'reject_listing',
  'suspend_user',
  'unsuspend_user',
  'resolve_report',
  'override_escrow',
  'update_score_config',
  'manual_notification'
);

-- ============================================================
-- 3. Admin audit log
-- ============================================================
create table admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles(id),
  action admin_action not null,
  target_type text not null, -- 'user', 'listing', 'report', 'escrow', etc.
  target_id uuid not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index admin_audit_log_created_idx on admin_audit_log(created_at desc);
create index admin_audit_log_admin_idx on admin_audit_log(admin_id);
create index admin_audit_log_target_idx on admin_audit_log(target_type, target_id);

alter table admin_audit_log enable row level security;

-- Only admins can view audit log
create policy "Admins can view audit log"
  on admin_audit_log for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Insert is handled via service role in server actions (bypasses RLS)
-- No insert policy for regular users

-- ============================================================
-- 4. Add suspended_at to profiles for user suspension
-- ============================================================
alter table profiles
  add column if not exists suspended_at timestamptz,
  add column if not exists suspension_reason text;

-- ============================================================
-- 5. Add moderation fields to listings
-- ============================================================
-- Listings already have 'status' but add moderation_note for admin feedback
alter table horse_listings
  add column if not exists moderation_note text,
  add column if not exists moderated_by uuid references profiles(id),
  add column if not exists moderated_at timestamptz;
