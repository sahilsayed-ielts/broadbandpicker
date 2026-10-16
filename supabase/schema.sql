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

-- ---------------------------------------------------------------
-- 2026-10-16 retention alerts (also in supabase/migrations/)

create table if not exists deal_watches (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  deal_id text not null,
  provider_slug text not null,
  package_name text not null,
  price_at_save numeric(8,2) not null,
  last_price numeric(8,2) not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'ended', 'cancelled')),
  token text not null,
  consent_at timestamptz not null default now(),
  consent_text text not null,
  consent_version text not null,
  source_url text,
  ip_hash text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  last_notified_at timestamptz,
  ended_at timestamptz,
  unique (email, deal_id)
);
create index if not exists deal_watches_token_idx on deal_watches(token);
create index if not exists deal_watches_status_idx on deal_watches(status);

create table if not exists contract_reminders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  provider_slug text,
  provider_name text not null,
  contract_end date not null,
  remind_on date not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'sent', 'cancelled')),
  token text not null,
  consent_at timestamptz not null default now(),
  consent_text text not null,
  consent_version text not null,
  source_url text,
  ip_hash text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  sent_at timestamptz
);
create index if not exists contract_reminders_token_idx on contract_reminders(token);
create index if not exists contract_reminders_due_idx on contract_reminders(status, remind_on);

create table if not exists alert_runs (
  run_date date primary key,
  started_at timestamptz default now(),
  finished_at timestamptz,
  price_drop_sent int default 0,
  reminders_sent int default 0,
  failed int default 0
);

alter table deal_watches enable row level security;
alter table contract_reminders enable row level security;
alter table alert_runs enable row level security;

-- Browser never touches these tables; the App Router uses the service role.
drop policy if exists "deal_watches_no_direct_access" on deal_watches;
create policy "deal_watches_no_direct_access" on deal_watches for all using (false) with check (false);
drop policy if exists "contract_reminders_no_direct_access" on contract_reminders;
create policy "contract_reminders_no_direct_access" on contract_reminders for all using (false) with check (false);
drop policy if exists "alert_runs_no_direct_access" on alert_runs;
create policy "alert_runs_no_direct_access" on alert_runs for all using (false) with check (false);
