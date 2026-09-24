# Launch readiness — M.D. Hygiene

Audit of security, performance, crawlability and SEO/GEO ahead of hosting on a
VPS with cPanel. Covers what was found, what was fixed and verified, and the
decisions still open.

Companion to [`SECURITY-AUDIT.md`](SECURITY-AUDIT.md), which holds the numbered
security findings (C1–M5) and their evidence. This document is the wider view.

Last run: 23 Sep 2026, against Supabase project `gtpvibbeqlndkaezqniz`.
Revised the same day as the remaining items were closed.

---

## Status at a glance

| Area | State |
|---|---|
| Database access control (RLS) | ✅ Verified sound — no gaps, by manual probe *and* Supabase's own advisors |
| Secrets | ✅ Never committed; no key of any kind in 54 commits of history |
| Security headers | ✅ Added (were entirely absent) |
| Public-form abuse | ✅ Rate-limited (was honeypot only) |
| Page caching | ✅ Fixed — the whole site was uncached |
| Canonical URLs | ✅ Fixed — five pages were claiming to be the homepage |
| Structured data | ✅ Extended to every public page |
| Resume uploads | ✅ Private bucket live and verified end to end |
| Next.js version | ✅ On 15.5.25 — critical advisories closed |
| Production domain | ✅ `https://mdhygiene.in`, verified in the prerendered HTML |
| Old PHP addresses | ✅ Cards redirect; catalogue PDFs served at their original URLs |
| RLS policy efficiency | ✅ Advisor findings 52 → 1 |
| Dead `orders` tables | ✅ Dropped |
| **Admin password** | 🔴 **The one item left — seeded default still authenticates** |

---

## The three findings that mattered most

### 1. Nothing on the site was cached

Every page was `force-dynamic` and every Supabase read carried `cache: "no-store"`,
so each visit rebuilt the page from scratch and made around fourteen round trips
to ap-south-1 — for copy that only changes when an admin edits it.

The cause was not the pages. It was the client: reading a cookie opts a route out
of static rendering permanently, and the cookie-backed Supabase client was used
for public content as well as admin content.

Public reads now go through `lib/supabase/public.ts`, which never touches cookies.
Pages revalidate every five minutes, and admin saves already called
`revalidatePath`, so an edit is still live immediately — what changed is every
visit in between.

| Route | Before | After |
|---|---|---|
| `/`, `/about`, `/careers`, `/certifications`, `/contact` | rebuilt per request | static, revalidating |
| `/products/[slug]`, `/brands/[slug]`, `/card/[slug]` | rebuilt per request | pre-rendered at build |
| `sitemap.xml`, `robots.txt`, `llms.txt` | rebuilt per request | static |
| `/products` | dynamic | dynamic (filter params — correct), data cached |

JavaScript was never the problem: 87 kB shared, ~105 kB first load. Healthy.

### 2. Five pages told Google they were the homepage

The root layout set `alternates: { canonical: "/" }`, and Next merges metadata
down the tree. Any page that did not override it inherited it — so `/about`,
`/careers`, `/certifications`, `/contact` and `/products` each emitted
`<link rel="canonical" href="https://…/">`.

A search engine drops pages that canonicalise to another page. Confirmed in the
rendered HTML before and after. Each page now names itself, and the three that
were falling back to the site-wide description have their own.

### 3. Dead tables anyone can write to

`orders` and `order_items` still carry `Public can submit orders` policies. The
cart was removed; no code references them (they survive only in the generated
types file) and both are empty. An unmonitored, anonymously-writable table is a
free target for junk nobody would notice.

---

## Everything else that was fixed

**Security**
- Security headers, entirely absent before: `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`,
  `Strict-Transport-Security`, and a CSP limited to `frame-ancestors 'self'`.
  `/admin/*` additionally gets `no-store`. (SECURITY-AUDIT M1)
- Rate limiting on both public forms (5/hour per IP) and the visitor beacon
  (60/hour), which previously had only a honeypot. (H2)
- JSON-LD escaped against `</script>`, which matters more now that the schemas
  carry product names and admin-written job descriptions. (M5)
- The media importer refuses private addresses and re-checks every redirect hop,
  so "import this link" cannot be aimed at the VPS's own network.
- `.gitignore` widened from three named env files to `.env*` with
  `!.env.example`, closing the `.env.production` / `.env.vps` gap before a server
  deployment could open it.

**Performance**
- Optimised images kept for a month instead of 60 seconds.
- The gallery no longer preloads a below-the-fold image in competition with the
  hero for largest-contentful-paint.

**Crawlability, SEO and GEO/AEO**
- Structured data reached the homepage, product pages and cards and stopped
  there. Added **JobPosting** per open role (what Google Jobs and assistants read
  for "are they hiring?"), **ItemList** for the catalogue and the certifications,
  **ContactPage** and **AboutPage**.
- `llms.txt` was already in place and is good: summary, key facts, locations,
  areas served, export markets, and every product linked.
- `robots.ts` already gates named AI crawlers behind an admin toggle.

**Bugs**
- `generateStaticParams` failed the whole build on a single null slug.
- The two above (canonicals, caching).

---

## Decisions still open

### Admin password — the one thing still outstanding

The seeded password for `admin@mdhygiene.in` still authenticates, and it was
published in the README and the migration history, so treat it as public.

Change it at **Admin → Account**, which takes the current password and a new
one and applies the change without signing you out.

That page was added because the dashboard had no working path: its "Reset
password" button sends a recovery email, and the link returns to a URL this app
has no route for.

Generate the new password rather than choosing one. Leaked-password protection
(M3 below) is **Pro-plan only** and this org is on Free, so nothing checks a
weak choice for you — a generated string covers the same ground.

### Staff contact details

One anonymous request returns all ten team members with `email`, `phone`,
`whatsapp` and `linkedin_url`. By design — it powers `/card/[slug]` — but it is a
scraper's gift. Decide whether to restrict the public columns to what the cards
actually render. (SECURITY-AUDIT M4)

### Resend API key

Not set, so enquiry and application notifications go nowhere. Submissions still
save and appear in Admin → Inquiries.

---

## After the site is live

None of this can be done before there is a public URL to point at, so it is
recorded here rather than raised as a blocker. The site is not hosted yet.

**Once the domain resolves**

- **Search Console and Bing Webmaster.** Paste the verification strings into
  Admin → SEO (`google_site_verification`, `bing_site_verification`) — the
  fields already render into the page head. Then submit `/sitemap.xml` in both.
- **Analytics.** `ga_measurement_id` or `gtm_id` in the same place. Both are
  empty, so there is currently no analytics beyond the built-in visitor
  counter at Admin → Visitors.
- **Re-crawl to confirm the live site.** The checks under "Re-running these
  checks" all work against a public URL — swap `localhost:3000` for the domain.
  Canonicals in particular must show the real domain, not localhost, which
  depends on `canonical_domain` having been set *before* the production build.

**Off-site, once there is something to link to**

For a B2B manufacturer, the links that move local and trade rankings are trade
citations rather than editorial backlinks:

- A Google Business Profile for each of the two Surat addresses. This also
  feeds the `LocalBusiness` schema the homepage already emits.
- IndiaMART and TradeIndia supplier listings.
- The SGCCI membership directory, and the supplier listings run by the
  certification bodies already named on `/certifications`.

Consistency matters more than volume: the business name, both addresses and the
phone numbers must match what `site_settings` serves, or the citations compete
with each other instead of reinforcing.

---

## Accepted, not fixed

- **No enforcing CSP** beyond `frame-ancestors`. The inline GTM bootstrap and
  Next's own inline scripts need nonces threaded through before `script-src` can
  be enforced; switching it on blind would break the site silently.
- **Admin Server Actions do their own no auth check**, relying on RLS, which was
  verified to hold. A `requireAdmin()` guard would be defence in depth.
- **Server Action errors return raw Postgres messages** to the browser.
- **The anon `INSERT` grant bypasses the rate limiter** — PostgREST can be posted
  to directly. Revoking it and routing inserts through the action would close it.
- **`is_admin()` is callable over RPC** by anon and authenticated. It returns
  `false` to anon, so it leaks nothing. (M2)
- **No automated tests.** Highest-value first target is the RLS policies, since
  that is the boundary everything else rests on.

---

## Hosting on a VPS with cPanel

Full steps are in the README. The four that bite:

1. **Build on the server**, and it needs outbound HTTPS. `next/font` downloads
   the typefaces at build time, and the catalogue pre-render reads Supabase. A
   firewall blocking `fonts.gstatic.com` fails the build.
2. **Run one process.** Cached pages and the rate-limit counters both live in the
   process. Under a cluster, an admin edit refreshes one worker and leaves the
   others stale.
3. **`npm i sharp`** on the server, or image optimisation falls back to a
   WebAssembly encoder several times slower per image.
4. **AutoSSL before going live.** The app sends HSTS, which tells browsers never
   to use plain HTTP for the domain again.

Put secrets in cPanel → Setup Node.js App → Environment Variables rather than
copying `.env.local` onto the server, so they are held by the process manager
instead of sitting in a readable file under the web root.

---

## Re-running these checks

```bash
# Dependency advisories
cd frontend && npm audit --omit=dev

# Which routes are cached: ○ static, ● pre-rendered, ƒ per-request
npm run build

# Canonicals — each must name its own path, not "/"
for u in / /about /contact /careers /certifications /products; do
  curl -s "http://localhost:3000$u" | grep -o '<link rel="canonical" href="[^"]*"'
done

# Structured data present per page
curl -s http://localhost:3000/ | grep -o '"@type":"[A-Za-z]*"' | sort -u
```

Supabase advisors (`get_advisors`, security and performance) should be re-run
after any DDL change — they catch missing RLS policies that a manual check can
miss.
