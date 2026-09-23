-- Tidying the row-level security policies, against the advisors' findings.
--
-- Three separate things, none of which changes who can do what.
--
-- 1. Every table carried one "Admin write X" policy scoped FOR ALL. Postgres
--    evaluates permissive policies for the command being run, so FOR ALL meant
--    the admin check ran on every public SELECT as well, alongside the public
--    read policy — 50 findings, and a second policy evaluated on every
--    catalogue query the site makes. Split into insert/update/delete, which is
--    all those policies were ever for.
--
--    Admins keep their read access, by the route they already used: the public
--    read policies on products, hero_slides and team_members carry
--    `OR is_admin()` so an admin sees inactive rows, and the rest are readable
--    by everyone anyway.
--
-- 2. `auth.uid()` and `is_admin()` were re-evaluated per row. Wrapping them in
--    a sub-select makes Postgres run them once per query instead. Identical
--    result; the planner just stops repeating itself.
--
-- 3. `orders` and `order_items` are dropped. They are left over from the cart
--    that was removed, no code references them, both are empty — and both
--    still carried a `Public can submit` policy, so anyone on the internet
--    could write to a table nobody reads.

-- ---------------------------------------------------------------- catalogue

drop policy if exists "Admin write brands" on public.brands;
create policy "Admin insert brands" on public.brands for insert with check ((select is_admin()));
create policy "Admin update brands" on public.brands for update using ((select is_admin())) with check ((select is_admin()));
create policy "Admin delete brands" on public.brands for delete using ((select is_admin()));

drop policy if exists "Admin write products" on public.products;
create policy "Admin insert products" on public.products for insert with check ((select is_admin()));
create policy "Admin update products" on public.products for update using ((select is_admin())) with check ((select is_admin()));
create policy "Admin delete products" on public.products for delete using ((select is_admin()));

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products" on public.products for select
  using ((is_active = true) or (select is_admin()));

drop policy if exists "Admin write variants" on public.product_variants;
create policy "Admin insert variants" on public.product_variants for insert with check ((select is_admin()));
create policy "Admin update variants" on public.product_variants for update using ((select is_admin())) with check ((select is_admin()));
create policy "Admin delete variants" on public.product_variants for delete using ((select is_admin()));

-- ------------------------------------------------------------------ content

drop policy if exists "Admin write hero slides" on public.hero_slides;
create policy "Admin insert hero slides" on public.hero_slides for insert with check ((select is_admin()));
create policy "Admin update hero slides" on public.hero_slides for update using ((select is_admin())) with check ((select is_admin()));
create policy "Admin delete hero slides" on public.hero_slides for delete using ((select is_admin()));

drop policy if exists "Public read active hero slides" on public.hero_slides;
create policy "Public read active hero slides" on public.hero_slides for select
  using ((is_active = true) or (select is_admin()));

drop policy if exists "Admin write site settings" on public.site_settings;
create policy "Admin insert site settings" on public.site_settings for insert with check ((select is_admin()));
create policy "Admin update site settings" on public.site_settings for update using ((select is_admin())) with check ((select is_admin()));
create policy "Admin delete site settings" on public.site_settings for delete using ((select is_admin()));

drop policy if exists "Admin write seo settings" on public.seo_settings;
create policy "Admin insert seo settings" on public.seo_settings for insert with check ((select is_admin()));
create policy "Admin update seo settings" on public.seo_settings for update using ((select is_admin())) with check ((select is_admin()));
create policy "Admin delete seo settings" on public.seo_settings for delete using ((select is_admin()));

drop policy if exists "Admin write members" on public.team_members;
create policy "Admin insert members" on public.team_members for insert with check ((select is_admin()));
create policy "Admin update members" on public.team_members for update using ((select is_admin())) with check ((select is_admin()));
create policy "Admin delete members" on public.team_members for delete using ((select is_admin()));

drop policy if exists "Public read published members" on public.team_members;
create policy "Public read published members" on public.team_members for select
  using ((is_active and show_on_website) or (select is_admin()));

-- ------------------------------------------------------- enquiries and admin

drop policy if exists "Admin read inquiries" on public.distributor_inquiries;
create policy "Admin read inquiries" on public.distributor_inquiries for select using ((select is_admin()));

drop policy if exists "Admin update inquiries" on public.distributor_inquiries;
create policy "Admin update inquiries" on public.distributor_inquiries for update using ((select is_admin()));

drop policy if exists "Admins read admin_profiles" on public.admin_profiles;
create policy "Admins read admin_profiles" on public.admin_profiles for select using ((select is_admin()));

drop policy if exists "Admin claims own session" on public.admin_profiles;
create policy "Admin claims own session" on public.admin_profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "admins read page views" on public.page_views;
create policy "admins read page views" on public.page_views for select to authenticated
  using (exists (select 1 from public.admin_profiles where id = (select auth.uid())));

-- --------------------------------------------------------------- dead tables

-- order_items first: it carries the foreign key.
drop table if exists public.order_items;
drop table if exists public.orders;
