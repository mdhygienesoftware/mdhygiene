# M.D. Hygiene — B2B catalog & admin platform

A distributor-facing catalog for M.D. Hygiene Private Limited (Surat, Gujarat) with a
full admin dashboard. Built on the real product catalogue: 4 brands (7Soft, Extra Sure,
Extra Soft, 24Care), 21 product lines and 31 priced size variants carrying real MRP and
distributor net pricing, pack counts and case quantities.

## Stack

| Layer | Choice |
|---|---|
| Frontend + server | Next.js 14 (App Router), TypeScript, Tailwind |
| Database / Auth / Storage | Supabase (Postgres 17, GoTrue, Storage) |
| Mutations | Next.js Server Actions, authorized by Postgres RLS |
| Hosting | Vercel |

There is no separate backend service — Supabase *is* the backend, and the app talks to it
directly. Public reads use the anon key (RLS decides what's visible); every write runs
through a Server Action whose Supabase session must map to an `admin_profiles` row.

```
MD/
  frontend/   the whole app (public site + /admin dashboard)
  docs/       API.md (server actions + auth), ERD.md (schema + RLS),
              SECURITY-AUDIT.md (phased findings + re-test checklist)
```

> **Before going live**, work through Phase 0 of [`docs/SECURITY-AUDIT.md`](docs/SECURITY-AUDIT.md) —
> the seeded admin password below is still active, and the legacy PHP `data.php` page
> publicly exposes past enquiry data and live MySQL credentials.

## Local development

```bash
cd frontend
cp .env.example .env.local     # fill in the two Supabase values
npm install
npm run dev                    # http://localhost:3000
```

> **Don't run `npm run build` while `npm run dev` is running.** Both write to `.next`,
> and the production build wipes the dev server's chunks — every CSS/JS request then
> 404s and the site renders as unstyled HTML with no interactivity. To check types
> without disturbing dev, use `npm run typecheck`. If it does happen: stop dev,
> `rm -rf .next`, start dev again.

`.env.local` needs:

```
NEXT_PUBLIC_SUPABASE_URL=https://gtpvibbeqlndkaezqniz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase → Settings → API>
```

The anon key is safe to expose — it only grants what RLS permits.

## Admin dashboard

`/admin/login` — seeded credentials:

```
admin@mdhygiene.in / ChangeMe123!
```

**Rotate this password immediately.** It was seeded directly into `auth.users`, so it's
in the migration history and this README.

| Section | What it does |
|---|---|
| Dashboard | Live counts: active products, new inquiries, OEM products, brands |
| Products | One collapsible block per brand. Full CRUD + a nested editor for each size (pack, case qty, SKU). Pricing is not shown publicly, so it isn't edited here |
| Brands | Full CRUD, logo upload, accent colour |
| Hero & Media | Manage homepage carousel slides — upload **images or videos**, set headline/CTA/order/visibility |
| Site Content | Edit stats, contact details, addresses, about copy and certifications without a redeploy |
| OEM / Private Label | OEM ranges, kept separate from house brands |
| Members | Team roster grouped by department, with photo upload. Each member gets a digital visiting card at `/card/<code>` (the React port of the old PHP cards), toggled by *digital card enabled*. There is no public team listing — `show on public website` is currently inert |
| Inquiries | Distributor enquiries with a new → contacted → closed pipeline |
| SEO & GEO | Search, local/geographic and AI-engine settings (see below) |

### SEO & GEO

Managed under **SEO & GEO** in the admin panel, with everything served from live data
(no redeploy needed when you add products).

| Surface | What it does |
|---|---|
| `/sitemap.xml` | Generated from active products + brands, so new products are discoverable automatically |
| `/robots.txt` | Crawl rules, including per-crawler control for AI engines |
| `/llms.txt` | A factual, structured summary for AI assistants (ChatGPT, Perplexity, Claude) |
| JSON-LD | `Organization`, `LocalBusiness`, `Product`, `FAQPage`, `BreadcrumbList` |

**Admin sections**

- **General** — titles, descriptions, share image, canonical domain, keywords
- **Local / GEO** — factory + corporate addresses, coordinates, opening hours, service
  areas and export markets. These feed `LocalBusiness` schema, which drives
  "manufacturer near me" and map results
- **AI / Generative engines** — business summary, key facts and FAQs used by `/llms.txt`
  and FAQ schema, plus a toggle for AI crawler access
- **Analytics & verification** — Google Analytics / GTM IDs and Search Console verification
- **Indexing** — robots rules and a master indexing switch

Per-product SEO overrides (meta title, description, share image) live on each product's
edit page and fall back to the product's own name/description when blank.

**Before launch:** set **Canonical domain** to the live URL. Until then, canonical URLs
and sitemap entries point at whatever host is serving the site.

**Note on coordinates:** latitude/longitude are intentionally blank. Guessed coordinates
hurt local ranking, so fill them from Google Maps (right-click the location) when ready.

### Enquiry email notifications

When someone submits the contact form the enquiry is written to
`distributor_inquiries` (visible under **Inquiries** in the admin panel) and an email
notification is sent to `INQUIRY_NOTIFICATION_TO`.

Email is **best-effort by design**: the record is saved first, and a mail failure is
logged rather than shown to the visitor — an outage at the mail provider must never
lose an enquiry. If `RESEND_API_KEY` is unset, notifications are simply skipped and
everything else still works.

To switch notifications on:

1. Create a free account at [resend.com](https://resend.com) and generate an API key.
2. Set `RESEND_API_KEY` in `.env.local` (and in the Vercel project's env vars).
3. Leave `INQUIRY_NOTIFICATION_FROM` as `onboarding@resend.dev` to start. To send from
   your own domain, verify `mdhygiene.in` in Resend (add the DNS records it gives you)
   and change it to e.g. `M.D. Hygiene <enquiries@mdhygiene.in>` — this also improves
   deliverability, since mail from a verified domain is far less likely to land in spam.

The notification's reply-to is set to the enquirer's address, so replying from the
inbox goes straight back to them.

### How enquiries work

This is a wholesale/tender business, not retail, so the public site has **no cart and no
checkout**. Distributors browse sizes and pack configurations, then send an enquiry through the
contact form, which lands in Inquiries for the team to quote. Pricing is quoted per
enquiry rather than published — the seeded MRP/net figures remain in the database,
just not surfaced.

There is no order-request screen: enquiries are the whole inbound funnel. The `orders`
and `order_items` tables still exist in the database but are unused by the app — they're
left in place (empty, RLS-protected) so an ordering flow can be reintroduced without a
migration. Drop them if you're sure you won't want one.

## Adding another admin

Don't hand-insert into `auth.users` — seeding one that way needed several GoTrue-specific
fixes (a matching `auth.identities` row, and empty strings rather than NULLs in
`email_change` etc., or sign-in fails with "Database error querying schema"). Instead:

1. Supabase Dashboard → Authentication → Add user (auto-confirm).
2. `insert into admin_profiles (id, full_name) values ('<that user id>', 'Name');`

Without step 2 the user can sign in but the dashboard signs them straight back out.

## Deployment (Vercel)

Root directory is `frontend`. Set these environment variables in the Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Then deploy — `npm run build` must pass, which also type-checks the whole app.

## Database changes

Schema lives in Supabase migrations. After changing it, regenerate types and replace
`frontend/lib/database.types.ts`:

```bash
npx supabase gen types typescript --project-id gtpvibbeqlndkaezqniz > frontend/lib/database.types.ts
```

Stale types are the usual cause of Supabase queries inferring as `never`.

## Media

Catalogue imagery (brand marks, packshots, hero photos) lives in the public Supabase
Storage bucket `media` under `seed/`; admin uploads go to `uploads/`. Records store the
full public URL, so `next/image` serves them via `remotePatterns` in `next.config.mjs`.
The only bundled static image is the company logo in the header.

## Known issues / follow-ups

- **Next.js advisory GHSA-955p-x3mx-jcvp** (medium): Server Action IDs can be enumerated
  by unauthenticated users. Only patched in Next 15.5.21+, which is a breaking upgrade
  (`params`/`searchParams` become Promises). Impact here is limited because every action
  re-authorizes through RLS rather than relying on unguessable action IDs — but plan the
  Next 15/16 upgrade.
- Supabase Auth "leaked password protection" is off; enable it in
  Authentication → Policies once real admin accounts exist.
- No automated tests yet. The highest-value first targets are `submitOrderAction`
  (snapshot correctness) and the RLS policies (an anon client must not read
  `orders`/`distributor_inquiries`).
