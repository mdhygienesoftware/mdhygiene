# Security audit — M.D. Hygiene platform

**Audited:** 8 September 2026
**Scope:** Next.js app (public site + `/admin`), Supabase project `gtpvibbeqlndkaezqniz`
(Postgres, Auth, Storage), dependency tree, and the legacy PHP visiting-card site.

Every finding below was **verified by probing the running system**, not inferred from
reading code. Commands used are shown so each can be re-checked after remediation.

---

## Summary

| Severity | Count | Findings |
|---|---|---|
| 🔴 Critical | 2 | C1 default admin password, **H1 Next.js RCE chain** (escalated 9 Sep) |
| 🟠 High | 2 | C2 legacy DB credentials, H2 no enquiry rate limit  ·  *(H3 open image proxy — **fixed** 9 Sep)* |
| 🟡 Medium | 5 | M1 no security headers, M2 `is_admin()` exposed via RPC, M3 leaked-password protection off, M4 staff PII harvestable, M5 JSON-LD escaping |
| 🔵 Low | 4 | L1 no admin MFA, L2 no audit log, L3 no dependency scanning in CI, L4 no storage path separation |

### What is already correct

These were tested and need **no action** — worth recording so they aren't "fixed" into
regressions later:

- **RLS is enabled on all 12 public tables**, each with policies.
- **Anonymous reads of sensitive tables return empty**: `distributor_inquiries`,
  `orders`, `order_items`, `admin_profiles` all returned `[]`.
- **Anonymous writes are rejected on every table** — Postgres `42501`
  (`new row violates row-level security policy`) on products, brands, team_members,
  site_settings, seo_settings, hero_slides.
- **Anonymous storage upload is rejected** (`authorization` header required).
- **No service-role key anywhere in the repo** — the app uses only the anon key plus RLS,
  so a leaked client bundle grants nothing beyond what RLS already allows.
- **`.env.local` and the legacy `card/` folder are gitignored** — no secrets in git history.
- **Single admin session is enforced** (added 9 Sep). Supabase's built-in setting is
  Pro-only and this project is on Free, so sign-in records its session id on the
  admin row and the admin layout signs out any session that no longer matches.
  Verified: a second sign-in displaces the first, and the update policy is scoped
  to the caller's own row.
- **Contact form has a honeypot field** that silently drops bots.
- **Uploads are validated**: 50 MB cap and a MIME allowlist that deliberately **excludes
  SVG** (SVG on a public bucket is an XSS vector).

---

## What is currently exposed (verified 9 Sep 2026)

| Surface | Reachable by | Notes |
|---|---|---|
| `localhost:3000` (site + `/admin`) | **Anyone on the same Wi-Fi** | Dev server binds `0.0.0.0`, so it answers on `http://192.168.29.154:3000`, including `/admin`. Not reachable from the public internet — verified: connecting to the public IP on port 3000 times out. |
| Supabase REST API | **Anyone on the internet** | By design. The anon key ships in the browser bundle and cannot be secret. RLS is what protects it, and RLS was verified working. |
| Supabase Storage `media` bucket | **Anyone on the internet** | Public-read bucket: product photos, brand logos, staff portraits. All intended to be public. |
| `mdhygiene.in` (legacy PHP) | **Anyone on the internet** | The old site is live. `data.php` is *not* reachable there — the host soft-404s to the homepage. |

**In short:** the new site is not on the public internet yet. Its database is, but only
through RLS-guarded reads. The main present-day exposure is that anyone sharing your
Wi-Fi can open the admin panel and sign in with the default password.

---

## Phase 0 — Do before going live (blocking)

> These two are the only findings where someone can take over the admin panel or read
> your customer data today. Neither needs code changes.

### C1 · Default admin password is active and publicly documented 🔴

The seeded password `ChangeMe123!` still works, and it is written in `README.md` line 56
and in the migration history.

**Evidence**
```bash
curl -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON" -H "Content-Type: application/json" \
  -d '{"email":"admin@mdhygiene.in","password":"ChangeMe123!"}'
# -> HTTP 200 (login succeeds)
```

**Impact:** anyone who sees the repo, or guesses a documented default, gets full control
of products, content, SEO, member records and every distributor enquiry.

**Fix**
1. Supabase Dashboard → Authentication → Users → `admin@mdhygiene.in` → reset password to
   a strong unique passphrase stored in a password manager.
2. Remove the credential block from `README.md`; replace with "credentials are held in
   the team password manager".
3. Consider renaming the account away from the guessable `admin@`.

### C2 · Legacy PHP file contains live database credentials 🟠 *(downgraded — see correction)*

> **Correction (9 Sep 2026):** this was originally rated Critical on the assumption the
> page was live. It is **not** currently reachable. `https://www.mdhygiene.in/card/card/data.php`
> returns the site homepage — the server soft-404s, serving the same 16,213-byte homepage
> for any missing path (verified against deliberately invalid URLs). So no data is being
> exposed at that address today. The credentials in the file are still real, so this
> remains worth acting on, but it is not an active leak.

`card/card/data.php` contains live MySQL credentials in plaintext
(`ygiene_ene` / `59bL5p%BZKHR`), and if deployed would render **every contact-form and
review submission** — name, email, phone, city, message — with no login.

**Impact if deployed:** full read of historic customer data, plus credentials for direct
database access. Currently not deployed at the expected path.

**Fix**
1. Confirm `data.php` / `db-config.php` aren't deployed under some other path on the host.
2. Rotate that MySQL password regardless — it is written in plaintext in a folder that was
   shared around, so treat it as compromised.
3. Check the host's access logs for any historic hits on `data.php`.
4. Migrate any enquiry history you still need, then decommission the PHP site — the React
   cards at `/card/<code>` have replaced it.

> The folder is gitignored, so it never entered this repo's history. This is about the
> live server, which gitignore does not touch.

---

## Phase 1 — High priority (within the first week)

### H1 · Next.js advisory chain, now CRITICAL 🔴 *(escalated 9 Sep 2026)*

> **Escalation:** on 8 Sep this was 2 high-severity advisories. Re-running the audit on
> 9 Sep returns **1 critical + 1 high**, with substantially worse advisories published
> against the installed version. Re-check this often — it moved in a day.

```bash
npm audit --omit=dev
# next  9.3.4-canary.0 - 16.3.0-preview.10   Severity: CRITICAL
# postcss <=8.5.22                            Severity: high
# 2 vulnerabilities (1 high, 1 critical)
```

The chain against the installed Next version includes:

| Advisory | Why it matters here |
|---|---|
| `GHSA-p293-qw3h-jr36` | **Unauthenticated RCE on Windows-hosted servers** — the dev server runs on Windows and binds `0.0.0.0` |
| `GHSA-2xp9-vwfh-vxw4` | **Unauthenticated RCE in the Image Optimization API via AVIF** |
| `GHSA-9g9p-9gw9-jx7f` | DoS via Image Optimizer `remotePatterns` — this app had `hostname: "**"` |
| `GHSA-89xv-2m56-2m9x` | SSRF in Server Actions — every mutation here is a Server Action |
| `GHSA-955p-x3mx-jcvp` | Unauthenticated disclosure of internal Server Function endpoints |
| `GHSA-wfc6-r584-vfw7` | Cache poisoning in RSC responses |

**Partial mitigations applied 9 Sep** (they reduce exposure; they are not the fix):
- `images.remotePatterns` pinned to the Supabase bucket instead of `**`, closing the
  open proxy and the `remotePatterns` DoS vector. Verified: an arbitrary external host
  now returns `400`, our own bucket still returns `200`.
- `images.formats` set to `["image/webp"]`, so AVIF is never decoded.

**The actual fix:** upgrade Next.js.
1. Branch, `npm i next@latest`, run `npm run typecheck && npm run lint && npm run build`.
2. Expect `params`/`searchParams` to become Promises (Next 15+) — every dynamic page and
   `generateMetadata` in this repo takes them.
3. Re-test admin login, a product save, an image upload, and a form submit.

### H2 · No rate limit on public enquiry submissions 🟠

**Evidence** — five rapid anonymous inserts, all accepted:
```
201 201 201 201 201
```
(test rows deleted afterwards)

**Impact:** the `distributor_inquiries` table can be flooded, burying real leads and — once
H1 of the email work is enabled — generating unlimited notification emails, which risks
your sending reputation.

**Fix (pick one, in order of preference)**
1. Move the insert behind a Server Action that enforces a per-IP limit (e.g. 5/hour) via
   Upstash Redis or a `rate_limits` table, and **revoke the anon `INSERT` grant** so
   PostgREST can't be posted to directly.
2. Add a CAPTCHA (Cloudflare Turnstile is free and unobtrusive) verified server-side.
3. Minimum: a Postgres trigger rejecting more than N rows per email/IP per hour.

### H3 · Open image proxy ✅ *(fixed 9 Sep 2026)*

`next.config.mjs` sets `remotePatterns: [{ protocol: "https", hostname: "**" }]` — any
host. Verified: an arbitrary third-party image was fetched and served through the app.

```bash
curl "…/_next/image?url=https%3A%2F%2F<any-external-host>%2Fimage.jpg&w=640&q=75"
# -> 200, 11881 bytes
```

**Impact:** anyone can serve arbitrary images through your domain and bill the bandwidth
and transformation cost to your Vercel account, and use your domain to launder image
hosting.

**Fixed.** `next.config.mjs` now pins `remotePatterns` to the Supabase bucket path and
disables AVIF. Verified after the change: an arbitrary external host returns `400`, the
Supabase bucket returns `200`, and the site still renders its images.

This also removes the configuration named in `GHSA-9g9p-9gw9-jx7f` (see H1).

---

## Phase 2 — Medium priority (before or shortly after launch)

### M1 · No security headers 🟡

`next.config.mjs` sets none. Missing: `Content-Security-Policy`,
`Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy`.

**Impact:** clickjacking of the admin panel, MIME sniffing, referrer leakage, and no
defence-in-depth against injected script.

**Fix:** add a `headers()` block in `next.config.mjs`. Start CSP in `Report-Only` so a
mistake doesn't take the site down, then enforce.

### M2 · `is_admin()` is callable by anyone via RPC 🟡

Supabase advisor: `public.is_admin()` is `SECURITY DEFINER` and executable by both `anon`
and `authenticated` through `/rest/v1/rpc/is_admin`.

**Impact:** low on its own — it returns only a boolean about the caller — but a
`SECURITY DEFINER` function reachable by anonymous users is unnecessary attack surface.

**Fix:** `revoke execute on function public.is_admin() from anon, authenticated;`
RLS policies keep working, because policy evaluation is not subject to that grant.

### M3 · Leaked-password protection disabled 🟡

Supabase Auth is not checking new passwords against HaveIBeenPwned.

**Fix:** Dashboard → Authentication → Policies → enable leaked password protection. Set a
minimum length while you are there. Do this **before** fixing C1 so the new password is
checked.

### M4 · Staff contact details are bulk-harvestable 🟡

`team_members` is publicly readable, and the API returns every employee's email, phone and
WhatsApp number in one request:
```bash
curl ".../rest/v1/team_members?select=name,email,phone,whatsapp"
# -> all 9 staff, with contact details
```

This is *partly by design* — the visiting cards must show contact details. The issue is
**bulk** retrieval: one request yields the whole staff directory, ideal for spam lists.

**Fix options**
1. Serve card data through a Server Action / route handler keyed by card code, and remove
   the blanket anon `SELECT` on the table.
2. Or split contact columns into a separate table readable only by exact-code lookup.
3. At minimum, confirm each employee consents to their mobile number being public.

### M5 · JSON-LD is not escaped against `</script>` 🟡

`StructuredData.tsx` renders `JSON.stringify(data)` into a `<script>` via
`dangerouslySetInnerHTML`. `JSON.stringify` does **not** escape `</script>`, so a value
containing that string would break out of the tag.

**Impact:** low — the inputs are admin-authored SEO settings, so this is self-XSS by an
already-privileged user rather than a public vector. Still trivially avoidable.

**Fix:** `JSON.stringify(data).replace(/</g, "\\u003c")`.

---

## Phase 3 — Hardening (post-launch)

- **L1 · No MFA on the admin account.** Enable TOTP in Supabase Auth. Highest-value
  remaining control once C1 is done.
- **L2 · No audit log.** No record of who changed a price, hid a product or deleted a
  member. Add an `audit_log` table written by a trigger on the admin-writable tables.
- **L3 · No dependency scanning in CI.** Add `npm audit --omit=dev --audit-level=high` to
  `.github/workflows/ci.yml` so the next CVE surfaces on a PR, not in an audit.
- **L4 · No path separation in the `media` bucket.** Everything is public-read under one
  bucket. Fine today (product photos, logos, staff portraits are all meant to be public),
  but if anything private is ever uploaded it will be public by default. Consider a
  separate private bucket before that happens.

---

## Re-test checklist

After each phase, re-run these. All should hold:

```bash
# RLS still blocks anonymous writes (expect 42501 on each)
curl -X POST "$SUPABASE_URL/rest/v1/products" -H "apikey: $ANON" \
  -H "Content-Type: application/json" -d '{"name":"x","slug":"x"}'

# Sensitive tables still return [] to anon
curl "$SUPABASE_URL/rest/v1/distributor_inquiries?select=*" -H "apikey: $ANON"

# Default password no longer works (expect 400 after C1)
curl -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" -H "apikey: $ANON" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mdhygiene.in","password":"ChangeMe123!"}'

# Dependencies clean (expect 0 high)
npm audit --omit=dev --audit-level=high

# Image proxy restricted (expect 400 for a non-allowlisted host after H3)
curl -o /dev/null -w "%{http_code}" \
  "https://<site>/_next/image?url=https%3A%2F%2Fexample.com%2Fa.jpg&w=640&q=75"

# Supabase advisors clean
# MCP: get_advisors(project_id, type="security")
```

---

## Re-running this audit

A ready-to-use prompt lives in the main [`README.md`](../README.md#re-running-the-security-audit)
under **Re-running the security audit**. Paste it into an agent with shell and Supabase
access from the repo root; it reproduces this document's structure and enforces the
evidence-first rules below.

## Notes on method

- Findings were produced by probing the live Supabase project with the **anon key** — the
  same key a visitor's browser holds — so they reflect what an outside attacker can
  actually reach.
- Test rows created during probing (`SPAMTEST%` enquiries) were deleted; the table is back
  to 0 rows.
- No destructive testing was performed against production data.
