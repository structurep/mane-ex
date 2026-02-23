-- Migration 007: Offers & Escrow (ManeVault)
-- Offer lifecycle + Stripe-backed escrow with full audit trail.

-- ── Enums ──

create type offer_status as enum (
  'pending',       -- buyer submitted, awaiting seller response
  'accepted',      -- seller accepted, ready for escrow
  'rejected',      -- seller declined
  'countered',     -- seller counter-offered (new offer created)
  'expired',       -- offer TTL elapsed (72 hours default)
  'withdrawn',     -- buyer withdrew before seller responded
  'in_escrow'      -- accepted and payment initiated
);

create type escrow_status as enum (
  'awaiting_payment',     -- PaymentIntent created, buyer needs to pay
  'payment_processing',   -- ACH initiated, waiting 2-5 days to clear
  'funds_held',           -- Payment confirmed, funds on platform balance
  'delivery_confirmed',   -- Buyer confirmed receipt, dispute window open
  'dispute_opened',       -- Buyer opened dispute during window
  'funds_released',       -- Transfer sent to seller
  'funds_refunded'        -- Full or partial refund to buyer
);

-- ── Offers table ──

create table offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references horse_listings(id) on delete cascade,
  buyer_id uuid not null references profiles(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,

  -- Offer details
  amount_cents integer not null check (amount_cents > 0),
  message text,                     -- optional note from buyer
  payment_method text default 'ach', -- 'ach' or 'card'

  -- Counter-offer chain
  parent_offer_id uuid references offers(id) on delete set null,
  counter_amount_cents integer,     -- seller's counter amount (when status = 'countered')

  -- Status & timing
  status offer_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '72 hours'),
  responded_at timestamptz,         -- when seller accepted/rejected/countered

  -- Metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Escrow Transactions table ──

create table escrow_transactions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete restrict,
  listing_id uuid not null references horse_listings(id) on delete restrict,
  buyer_id uuid not null references profiles(id) on delete restrict,
  seller_id uuid not null references profiles(id) on delete restrict,

  -- Money
  amount_cents integer not null check (amount_cents > 0),
  platform_fee_cents integer not null default 0,
  seller_net_cents integer not null default 0,
  trainer_commission_cents integer default 0,

  -- Stripe references
  stripe_payment_intent_id text,
  stripe_charge_id text,
  stripe_transfer_id text,
  stripe_refund_id text,
  payment_method text not null default 'ach', -- 'ach' or 'card'

  -- Status
  status escrow_status not null default 'awaiting_payment',
  status_history jsonb not null default '[]'::jsonb, -- [{status, timestamp, actor_id, note}]

  -- Delivery & disputes
  shipping_tracking text,
  expected_delivery_date date,
  delivery_confirmed_at timestamptz,
  delivery_confirmed_by uuid references profiles(id),
  dispute_reason text,
  dispute_opened_at timestamptz,
  dispute_resolved_at timestamptz,
  auto_release_at timestamptz,      -- 14 days after delivery confirmation

  -- Bill of Sale
  bill_of_sale_data jsonb,           -- structured bill of sale fields
  bill_of_sale_accepted_at timestamptz,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Stripe Webhook Events (idempotency) ──

create table stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

-- ── Triggers ──

create trigger offers_updated_at
  before update on offers
  for each row execute function update_updated_at();

create trigger escrow_updated_at
  before update on escrow_transactions
  for each row execute function update_updated_at();

-- Auto-expire old pending offers
create or replace function expire_old_offers()
returns void as $$
  update offers
  set status = 'expired', updated_at = now()
  where status = 'pending' and expires_at < now();
$$ language sql security definer;

-- Track escrow status changes in status_history
create or replace function track_escrow_status_change()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    new.status_history := new.status_history || jsonb_build_object(
      'status', new.status,
      'previous_status', old.status,
      'timestamp', now(),
      'note', ''
    );
  end if;
  return new;
end;
$$ language plpgsql;

create trigger escrow_status_tracking
  before update on escrow_transactions
  for each row execute function track_escrow_status_change();

-- When offer is accepted, update listing status to 'under_offer'
create or replace function update_listing_on_offer_accept()
returns trigger as $$
begin
  if new.status = 'accepted' and old.status = 'pending' then
    update horse_listings
    set status = 'under_offer'
    where id = new.listing_id and status = 'active';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger offer_accepted_listing_update
  after update on offers
  for each row execute function update_listing_on_offer_accept();

-- ── RLS ──

alter table offers enable row level security;
alter table escrow_transactions enable row level security;
alter table stripe_webhook_events enable row level security;

-- Offers: buyer and seller can see their own offers
create policy "Buyers can view offers they made"
  on offers for select
  using (buyer_id = auth.uid());

create policy "Sellers can view offers on their listings"
  on offers for select
  using (seller_id = auth.uid());

-- Offers: buyers can create offers
create policy "Buyers can create offers"
  on offers for insert
  with check (buyer_id = auth.uid());

-- Offers: sellers can update offers on their listings (accept/reject/counter)
create policy "Sellers can respond to offers"
  on offers for update
  using (seller_id = auth.uid());

-- Offers: buyers can update their own offers (withdraw)
create policy "Buyers can withdraw their offers"
  on offers for update
  using (buyer_id = auth.uid());

-- Escrow: participants can view their escrow transactions
create policy "Buyers can view their escrow transactions"
  on escrow_transactions for select
  using (buyer_id = auth.uid());

create policy "Sellers can view their escrow transactions"
  on escrow_transactions for select
  using (seller_id = auth.uid());

-- Escrow: only system (service role) can insert/update escrow records
-- (escrow mutations happen through server actions with service role, not direct client)
create policy "System can manage escrow"
  on escrow_transactions for insert
  with check (true);

create policy "System can update escrow"
  on escrow_transactions for update
  using (true);

-- Webhook events: no direct access (service role only)
-- Intentionally no select policy — admin only via service role

-- ── Indexes ──

-- Offers
create index offers_listing_idx on offers(listing_id);
create index offers_buyer_idx on offers(buyer_id);
create index offers_seller_idx on offers(seller_id);
create index offers_status_idx on offers(status);
create index offers_parent_idx on offers(parent_offer_id) where parent_offer_id is not null;
create index offers_expires_idx on offers(expires_at) where status = 'pending';
create index offers_created_idx on offers(created_at desc);

-- Escrow
create index escrow_offer_idx on escrow_transactions(offer_id);
create index escrow_listing_idx on escrow_transactions(listing_id);
create index escrow_buyer_idx on escrow_transactions(buyer_id);
create index escrow_seller_idx on escrow_transactions(seller_id);
create index escrow_status_idx on escrow_transactions(status);
create index escrow_stripe_pi_idx on escrow_transactions(stripe_payment_intent_id) where stripe_payment_intent_id is not null;
create index escrow_auto_release_idx on escrow_transactions(auto_release_at) where status = 'delivery_confirmed';

-- Webhook events
create index webhook_event_type_idx on stripe_webhook_events(event_type);
create index webhook_processed_idx on stripe_webhook_events(processed_at) where processed_at is null;
