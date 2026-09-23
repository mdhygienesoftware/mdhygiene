# Deploying to the VPS (cPanel)

Step by step, in order, with what each step is for and what goes wrong if it is
skipped. Written to be followed at the server.

The site is a Node application, not PHP. cPanel cannot serve it by dropping
files in `public_html` — it runs as a long-lived Node process that Apache
passes requests to.

**Before you start, have ready:** cPanel login, Supabase dashboard login, and
the values from `frontend/.env.example`.

---

## 1. Rotate the admin password

**Do this first, and do it even if you do nothing else on this page.**

The seeded password `ChangeMe123!` still works, and it is written in this
repository, which is on GitHub. The moment the admin panel is reachable on a
public domain, that is an open door to every product, price, enquiry and job
application in the system.

1. Supabase dashboard → **Authentication → Policies** → turn on **Leaked
   password protection**. Do this *before* changing the password, not after:
   it checks the new password against HaveIBeenPwned, so a password that has
   already appeared in a breach is refused rather than accepted.
2. **Authentication → Users** → `admin@mdhygiene.in` → **Reset password**.
3. Sign in at `/admin/login` with the new password to confirm it works.

Use a password manager. This account can edit everything on the public site.

---

## 2. Create the Node application in cPanel

cPanel → **Setup Node.js App** → **Create Application**.

| Field | Value |
|---|---|
| Node.js version | **18.17 or newer** (20 LTS if offered) |
| Application mode | Production |
| Application root | the `frontend` directory of the repo, e.g. `repos/mdhygiene/frontend` |
| Application URL | `mdhygiene.in` |
| Application startup file | `server.js` |

Two of those are easy to get wrong:

- **Application root is `frontend`, not the repository root.** The repository
  has `frontend/`, `supabase/` and `docs/` side by side; the app is only the
  first of those. Point it at the repo root and nothing will start.
- **The startup file is `server.js`, not `npm start`.** cPanel runs Node apps
  under Passenger, and Passenger starts an app by *loading a file*, not by
  running a script. `server.js` exists in the repo for exactly this. It does
  what `next start` does, in the shape Passenger needs.

Creating the app writes an `.htaccess` in your web root that passes requests
through to the Node process, and shows you a command to enter the app's
virtual environment — copy that command, you need it in step 4.

---

## 3. Environment variables

In the same **Setup Node.js App** screen, add each variable from
`frontend/.env.example`.

**Enter them here, not as a `.env.local` file on the server.** A file sits in
the application directory where a misconfigured Apache rule can serve it;
variables entered here are held by the process manager and are not part of the
filesystem the web server exposes.

| Variable | Value | If it is missing |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gtpvibbeqlndkaezqniz.supabase.co` | Nothing loads at all |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase → Settings → API | Nothing loads at all |
| `NEXT_PUBLIC_SITE_URL` | `https://mdhygiene.in` | Canonicals and sitemap say `localhost` |
| `ANALYTICS_SALT` | any long random string, kept stable | Visitor counts inflate after every restart |
| `RESEND_API_KEY` | from resend.com, optional | Enquiries still save; no email is sent |
| `INQUIRY_NOTIFICATION_TO` | where enquiries are emailed | As above |
| `INQUIRY_NOTIFICATION_FROM` | verified sender in Resend | As above |

`NEXT_PUBLIC_SITE_URL` is the one that cannot be fixed afterwards without a
rebuild — see step 4.

---

## 4. Install and build **on the server**

Enter the application's virtual environment (the command cPanel gave you in
step 2), then:

```bash
cd ~/repos/mdhygiene/frontend    # your application root
npm ci
npm run build
```

Three things about this step:

**It must run on the server, not locally.** `npm ci` compiles native pieces for
the machine they will run on. Uploading a `node_modules` built on Windows to a
Linux box does not work.

**It needs outbound HTTPS.** The build downloads the two typefaces from
`fonts.gstatic.com`, and it reads Supabase to pre-render the product and brand
pages. A firewall blocking either fails the build. If it hangs on fonts, that
is what is happening.

**The domain is baked in here.** Pages are pre-rendered, so `NEXT_PUBLIC_SITE_URL`
and `canonical_domain` are written into every canonical tag, the sitemap and
the structured data *at build time*. Both are already set to
`https://mdhygiene.in`. If you ever change the domain, you must build again —
editing the setting alone will not update pages that were already rendered.

Then restart the app from the cPanel screen.

---

## 5. HTTPS

cPanel → **SSL/TLS Status** → select the domain → **Run AutoSSL**. Wait for the
certificate to be issued before going further.

The application sends `Strict-Transport-Security`, which tells every browser
that visits never to use plain HTTP for this domain again — for two years. If
that header goes out before the certificate exists, visitors are told to use
HTTPS for a site that cannot yet serve it, and you cannot take it back.

Once the certificate is live, a certificate alone does not stop anyone
*reaching* the site over plain HTTP — Apache answers those requests before the
Node app ever sees them. Add this to `public_html/.htaccess`, **above** the
block cPanel wrote for the Node app:

```apache
RewriteEngine On
# Behind cPanel's proxy the original scheme arrives in a header. Testing HTTPS
# alone would loop forever on a request Apache has already terminated.
RewriteCond %{HTTPS} !=on
RewriteCond %{HTTP:X-Forwarded-Proto} !https
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

Then pick one hostname and send the other to it. `mdhygiene.in` and
`www.mdhygiene.in` serving the same pages splits your ranking between two
addresses. Whichever you choose must match `canonical_domain` in Admin → SEO —
which is currently `https://mdhygiene.in`, without `www`.

---

## 6. Install sharp

```bash
npm i sharp
```

`next/image` resizes and re-encodes every photograph on the way out. With
`sharp` it uses a native library; without it, it falls back to a WebAssembly
encoder several times slower per image. On a shared VPS core that is the
difference between a product photo appearing immediately and appearing after a
visible beat.

---

## 7. Start it, and keep it to one process

Restart the application from cPanel. It runs `server.js`, which serves the
build from step 4.

**Do not scale this to multiple workers or instances** without changing how it
caches. Two things live in the process rather than in a shared store:

- **The rendered pages.** An admin save refreshes them in place. With several
  workers, a save refreshes the one worker that handled it and leaves the
  others serving the old page — so a change appears or does not depending on
  which worker answers.
- **The rate-limit counters** on the enquiry form, the careers form and the
  visitor beacon. Each worker would keep its own, so the real limit becomes
  what is configured, multiplied by the number of workers.

One process is right for this traffic. If it ever needs more, that is the point
to move both to Redis — not before.

---

## After it is live

Content changes do **not** need a rebuild: admin saves refresh the affected
pages in place. Only code changes need `npm ci && npm run build` and a restart.

Then, in order:

1. **Check the old links.** `mdhygiene.in/card/95863.php` should land on
   Rutika's new card, and `mdhygiene.in/card/pdf/1.pdf` should open the
   catalogue itself. Those addresses are printed on visiting cards and encoded
   in QR codes that cannot be edited, so this is the one to check first.
2. **Search Console and Bing Webmaster.** Paste the verification strings into
   Admin → SEO, then submit `https://mdhygiene.in/sitemap.xml` to both.
3. **Analytics.** `ga_measurement_id` or `gtm_id` in the same place.
4. **Re-crawl.** The checks in
   [`LAUNCH-READINESS.md`](LAUNCH-READINESS.md#re-running-these-checks) work
   against the live domain — swap `localhost:3000` for `https://mdhygiene.in`.

---

## If something goes wrong

| Symptom | Cause |
|---|---|
| 503 from Passenger | The app did not start. Read the error log named on the cPanel app screen — `server.js` logs the reason it failed. |
| Site loads, no content, no styling | Application root points at the repo root instead of `frontend`. |
| "supabaseUrl is required" | `NEXT_PUBLIC_SUPABASE_URL` or the anon key is missing from the environment. These are read at build time as well as run time, so rebuild after adding them. |
| Build hangs, then fails | Outbound HTTPS is blocked — `fonts.gstatic.com` during the font download, or Supabase during the page pre-render. |
| Pages say `localhost:3000` in view-source | Built before `NEXT_PUBLIC_SITE_URL` was set. Set it and build again. |
| Admin edit does not show on the public site | More than one worker is running. See step 7. |
