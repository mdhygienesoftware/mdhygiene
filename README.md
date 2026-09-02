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
  docs/       API.md (server actions + auth), ERD.md (schema + RLS)
```

## Local development

```bash
cd frontend
cp .env.example .env.local     # fill in the two Supabase values
npm install
npm run dev                    # http://localhost:3000
```

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
| Dashboard | Live counts: active products, new inquiries, pending orders, brands |
| Products | Full CRUD + a nested editor for each size (pack, case qty, MRP, net price, SKU, stock status) |
| Brands | Full CRUD, logo upload, accent colour |
| Hero & Media | Manage homepage carousel slides — upload **images or videos**, set headline/CTA/order/visibility |
| Site Content | Edit stats, contact details, addresses, about copy and certifications without a redeploy |
| Inquiries | Distributor enquiries with a new → contacted → closed pipeline |
| Orders | Order requests with line items and a pending → … → delivered pipeline |

### How ordering works

This is a wholesale/tender business, not retail, so there's no payment gateway.
Distributors browse net pricing, add sizes to a request list (stored in `localStorage`),
and submit it as one order request. It lands in `orders` + `order_items` with price
snapshots, and the team works it through the status pipeline. Adding checkout later means
adding `customers`/`payments` tables — see the note at the end of `docs/ERD.md`.

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
