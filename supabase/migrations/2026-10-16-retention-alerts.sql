-- Retention alerts: price-drop watches on saved deals, contract-end reminders,
-- and a daily run log so the alert cron cannot double-send.
-- Run once in the Supabase SQL editor (safe to re-run).

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
