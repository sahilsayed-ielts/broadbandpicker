-- PECR-compliant deal alerts: extra consent fields and lock down anon writes.
-- Run in the Supabase SQL editor if the live table still has the old columns.

alter table email_subscribers add column if not exists status text;
alter table email_subscribers add column if not exists consent_at timestamptz;
alter table email_subscribers add column if not exists consent_text text;
alter table email_subscribers add column if not exists consent_version text;
alter table email_subscribers add column if not exists source_url text;
alter table email_subscribers add column if not exists ip_hash text;
alter table email_subscribers add column if not exists confirmed_at timestamptz;
alter table email_subscribers add column if not exists unsubscribed_at timestamptz;

update email_subscribers
set status = case
  when confirmed is true then 'confirmed'
  else 'pending'
end
where status is null;

alter table email_subscribers drop constraint if exists email_subscribers_status_check;
alter table email_subscribers
  add constraint email_subscribers_status_check
  check (status in ('pending', 'confirmed', 'unsubscribed'));

drop policy if exists "email_subscribers_insert" on email_subscribers;
drop policy if exists "email_subscribers_no_direct_access" on email_subscribers;
create policy "email_subscribers_no_direct_access" on email_subscribers
  for all using (false) with check (false);
