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

-- Email list (newsletter / deal alerts)
create table if not exists email_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  postcode_area text,
  subscribed_at timestamptz default now(),
  confirmed boolean default false,
  source text
);

-- Indexes for common query patterns
create index if not exists affiliate_clicks_provider_idx on affiliate_clicks(provider_slug);
create index if not exists affiliate_clicks_clicked_at_idx on affiliate_clicks(clicked_at desc);
create index if not exists affiliate_clicks_source_idx on affiliate_clicks(source_page);

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

-- Email subscribers: insert allowed from anon, read restricted
create policy "email_subscribers_insert" on email_subscribers
  for insert with check (true);
