-- Visitor tracking for the admin dashboard.
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Until it exists, /admin/visitors shows setup instructions instead of stats.
--
-- No IP address or user agent is stored. Each row carries a visitor_hash: a
-- salted digest of IP + user agent that is re-salted every day, which is enough
-- to count "how many different people" without holding anything that identifies
-- one of them, and expires by itself.

create table if not exists public.page_views (
  id           bigint generated always as identity primary key,
  path         text        not null,
  referrer     text,
  visitor_hash text        not null,
  device       text,
  created_at   timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx       on public.page_views (path);

alter table public.page_views enable row level security;

-- The site records a view for every visitor, signed in or not. Insert only:
-- nobody but an admin can read the table back or change what is in it.
drop policy if exists "record a page view" on public.page_views;
create policy "record a page view"
  on public.page_views for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admins read page views" on public.page_views;
create policy "admins read page views"
  on public.page_views for select
  to authenticated
  using (exists (select 1 from public.admin_profiles where id = auth.uid()));

-- Housekeeping: 90 days of history is plenty for this dashboard.
-- Supabase Free has no pg_cron, so this is called from the app after a write.
create or replace function public.prune_page_views()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.page_views where created_at < now() - interval '90 days';
$$;
