-- Migration 038: Transport Provider Network
-- Provider registry + lead tracking for transport request routing.

-- Provider directory
create table if not exists transport_providers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email text not null,
  phone text,
  service_regions text[] not null default '{}',
  long_haul boolean not null default false,
  short_haul boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Lead tracking (prevents duplicate provider alerts per request)
create table if not exists transport_provider_leads (
  id uuid primary key default gen_random_uuid(),
  transport_request_id uuid not null references transport_requests(id) on delete cascade,
  provider_id uuid not null references transport_providers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(transport_request_id, provider_id)
);

-- Indexes
create index idx_transport_providers_active on transport_providers (active) where active = true;
create index idx_transport_provider_leads_request on transport_provider_leads (transport_request_id);
create index idx_transport_provider_leads_provider on transport_provider_leads (provider_id, created_at desc);

-- RLS
alter table transport_providers enable row level security;
alter table transport_provider_leads enable row level security;

-- Providers: read-only for authenticated users (admin manages via direct access)
create policy "Authenticated users can read active providers"
  on transport_providers for select
  using (active = true);

-- Leads: sellers can see leads for their listings' transport requests
create policy "Sellers can read provider leads for their listings"
  on transport_provider_leads for select
  using (
    transport_request_id in (
      select tr.id from transport_requests tr
      join horse_listings hl on hl.id = tr.listing_id
      where hl.seller_id = auth.uid()
    )
  );

-- System can insert leads
create policy "System can insert provider leads"
  on transport_provider_leads for insert
  with check (true);

-- Seed placeholder providers
insert into transport_providers (company_name, contact_name, email, phone, service_regions, long_haul, short_haul) values
  ('Brook Ledger Equine Transport', 'Brook Ledger', 'leads@brookledger.example.com', '555-0101', '{"KY","TN","OH","IN","WV","VA"}', false, true),
  ('Continental Horse Hauling', 'Maria Santos', 'dispatch@continentalhorse.example.com', '555-0102', '{"TX","OK","AR","LA","NM"}', true, true),
  ('Pacific Coast Equine Movers', 'James Chen', 'bookings@pacificcoast.example.com', '555-0103', '{"CA","OR","WA","NV","AZ"}', true, false),
  ('Eastern Seaboard Transport', 'Sarah Mitchell', 'ops@easternseaboard.example.com', '555-0104', '{"NY","NJ","PA","CT","MA","MD","DE"}', true, true),
  ('Heartland Horse Lines', 'Tom Bradley', 'leads@heartlandhorse.example.com', '555-0105', '{"IA","MO","KS","NE","MN","WI","IL"}', true, true)
on conflict do nothing;
