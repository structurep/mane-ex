-- Add listing_type, seller_role, and contact_preference to horse_listings
alter table horse_listings
  add column if not exists listing_type text not null default 'fixed_price'
    check (listing_type in ('fixed_price', 'price_on_inquiry', 'for_lease', 'auction')),
  add column if not exists seller_role text
    check (seller_role in ('owner', 'trainer', 'agent', 'dealer')),
  add column if not exists contact_preference text not null default 'email_and_phone'
    check (contact_preference in ('email_only', 'phone_only', 'email_and_phone'));
