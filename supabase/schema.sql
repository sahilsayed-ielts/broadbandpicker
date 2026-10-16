-- BroadbandPicker Supabase Schema
-- Run this in the Supabase SQL editor to set up the database

-- Postcode lookup cache
create table if not exists postcode_areas (
  id uuid primary key default gen_random_uuid(),
  postcode_prefix text not null unique,
  town_name text not null,
  city text not null,
  region text not null,
  available_providers text[] not null,
  population_tier text check (population_tier in ('high', 'medium', 'low')),
  created_at timestamptz default now()
);

-- Deal clicks / lead tracking
create table if not exists affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  provider_slug text not null,
  source_page text not null,
  postcode_area text,
  clicked_at timestamptz default now(),
  user_agent text,
  ip_hash text
);

-- Email list (newsletter / deal alerts). Writes go through the server
-- (service role). Confirmed is the PECR mailing flag; status is the
-- full lifecycle including pending and unsubscribed.
create table if not exists email_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  postcode_area text,
  subscribed_at timestamptz default now(),
  confirmed boolean default false,
  source text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),
  consent_at timestamptz,
  consent_text text,
  consent_version text,
  source_url text,
  ip_hash text,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);

-- Indexes for common query patterns
create index if not exists affiliate_clicks_provider_idx on affiliate_clicks(provider_slug);
create index if not exists affiliate_clicks_clicked_at_idx on affiliate_clicks(clicked_at desc);
create index if not exists affiliate_clicks_source_idx on affiliate_clicks(source_page);

-- One row per ISO week so the Tuesday cron cannot double-send.
create table if not exists newsletter_sends (
  week_key text primary key,
  sent_at timestamptz default now(),
  sent_count int default 0,
  failed_count int default 0
);
alter table newsletter_sends enable row level security;
drop policy if exists "newsletter_sends_no_direct_access" on newsletter_sends;
create policy "newsletter_sends_no_direct_access" on newsletter_sends
  for all using (false) with check (false);

-- Row-level security (enable for production)
alter table postcode_areas enable row level security;
alter table affiliate_clicks enable row level security;
alter table email_subscribers enable row level security;

-- Public can read postcode areas
create policy "postcode_areas_public_read" on postcode_areas
  for select using (true);

-- Affiliate clicks: server-side insert only (service role bypasses RLS)
create policy "affiliate_clicks_server_insert" on affiliate_clicks
  for insert with check (false);

-- Email subscribers: no direct browser access. The App Router uses the
-- service role, which bypasses RLS.
drop policy if exists "email_subscribers_insert" on email_subscribers;
create policy "email_subscribers_no_direct_access" on email_subscribers
  for all using (false) with check (false);

