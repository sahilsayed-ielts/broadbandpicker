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
