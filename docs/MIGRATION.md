# Migrating mdhygiene.in from the old PHP site

The old site is live and serving customers. This is a cutover onto the same
cPanel account and the same domain, so there is a moment where one stops and the
other starts — and the risk is doing that with no way back.

The plan below tests the new site fully **before** anything about the live site
changes, and keeps the old site recoverable afterwards.

For what each deployment step *means*, see [`DEPLOY.md`](DEPLOY.md). This
document is only about the switch.

**The DNS does not change.** Same server, same domain, same records — so there
is no propagation delay to wait out, and no window where the domain resolves
nowhere. The switch is a single change to how Apache handles requests, and it is
reversible in under a minute.

**Email is not affected.** Mailboxes on `mdhygiene.in` are separate from the
website. Migrating the site does not touch them.

---

## Before you start

- **Setup Node.js App** must exist in cPanel. Without it this host cannot run
  the site at all, and no amount of the rest will help. Use cPanel's search box
  rather than hunting through sections — the grouping differs by theme.
- **SSH Access** and **Git Version Control**, for the deploy key and the clone.
- Node 18.17+ offered in *Setup Node.js App*.
- The Supabase anon key to hand.

This account has **no Terminal** in cPanel, so [step 3d](#3d-install-and-build)
gives two ways to run the build without one.

---

## Phase 1 — Back up the old site

Do not skip this. It is the difference between a bad afternoon and a lost site.

1. cPanel → **File Manager** → select `public_html` → **Compress** → zip it.
2. **Download the zip to your own computer.** A backup that only exists on the
   server is not a backup.
3. cPanel → **Backup Wizard** → **Download a Full Account Backup** as well, if
   the account is small enough for your host to allow it.
4. **Back up the databases separately.** A home-directory backup does *not*
   include MySQL — it only covers files. cPanel → **Backup** → *Download a MySQL
   Database Backup* → download each database listed. The old PHP site reads one
   (see `card/db-config.php`), and without it the rollback restores a site with
   no data behind it.

Note what is in `public_html` while you are there. This project knows about the
visiting cards and the catalogue PDFs; if the old site has anything else —
landing pages, uploaded images, an enquiry inbox written to disk — list it now,
because after the cutover those addresses answer from the new app.

---

## Phase 2 — Put the code on the server, outside the web root

The application must **not** live in `public_html`. Apache serves that folder
directly, and the repository contains things no visitor should fetch.

**The repository is private**, so the server has to prove who it is before
GitHub will hand the code over. That is a key exchange, and it is the fiddliest
part of the whole migration — done once, then never again.

### 2a. Make a key on the server

cPanel → **SSH Access** → **Manage SSH Keys** → **Generate a New Key**.

- Key name: `github`
- Password: **leave the passphrase empty.** A key with a passphrase cannot be
  used unattended, and this one is used by cPanel rather than by you.
- Type RSA, 2048 or 4096.

Then **Manage** → **Authorize** the key.

### 2b. Give the public half to GitHub

Back on Manage SSH Keys, next to the public key, click **View/Download** and
copy the whole block (it starts `ssh-rsa`).

GitHub → the `mdhygiene` repository → **Settings** → **Deploy keys** →
**Add deploy key**:

- Title: `cPanel mdhygiene.in`
- Key: paste it
- **Allow write access: leave unticked.** The server only ever needs to read.
  A key that cannot write cannot damage the repository if the server is ever
  compromised.

### 2c. Clone

cPanel → **Git™ Version Control** → **Create**:

| Field | Value |
|---|---|
| Clone URL | `git@github.com:mdhygienesoftware/mdhygiene.git` |
| Repository Path | `mdhygiene` |

**The SSH URL, not the HTTPS one.** `https://github.com/...` will ask for a
password it has no way to supply and fail; the deploy key only works over SSH.

`~/mdhygiene` sits beside `public_html`, not inside it. That matters.

> **Simpler alternative, if the key exchange fights you:** zip the project on
> your own machine — everything except `node_modules` and `.next` — and upload
> it through File Manager to `~/mdhygiene`. It works, but every future update
> means repeating it by hand, where the git clone becomes `git pull`.

---

## Phase 3 — Stand the new site up on a subdomain

This is the part that makes the cutover safe: the new site runs and is tested
while the old one carries on serving.

1. cPanel → **Domains** → **Create A Domain** → `new.mdhygiene.in`. Let it
   create its own document root; nothing goes in it.
2. cPanel → **Setup Node.js App** → **Create Application**:

   | Field | Value |
   |---|---|
   | Node.js version | 18.17 or newer |
   | Application mode | Production |
   | Application root | `mdhygiene/frontend` |
   | Application URL | `new.mdhygiene.in` |
   | Application startup file | `server.js` |

3. Add the environment variables from `frontend/.env.example`. Set
   `NEXT_PUBLIC_SITE_URL` to `https://mdhygiene.in` — **the real domain, not the
   subdomain.** The canonical tags are baked in at build time and should already
   name the address the site will live at.
### 3d. Install and build

The build has to run **on the server** — it compiles for that machine and
pre-renders pages by reading Supabase. There is no Terminal in this cPanel, so
use one of these.

**Either — SSH from your own PC (recommended).** You have SSH Access, which
gives a real terminal with readable errors. In cPanel → *SSH Access*, note the
host, username and port. On Windows, open PowerShell:

```powershell
ssh USERNAME@mdhygiene.in -p PORT
```

Then run the command cPanel's Node.js App screen shows under *enter virtual
environment*, and:

```bash
cd ~/mdhygiene/frontend
npm ci
npm run build
```

**Or — the buttons on the Node.js App screen.** No terminal needed:

1. **Run NPM Install** — installs everything in `package.json`, `sharp`
   included, so there is no separate step for it.
2. **Run JS script** → choose **build** → Run. This is `npm run build`. It takes
   a few minutes and the screen gives little feedback; wait for it to finish
   rather than clicking again.

Then **Restart** the application.

### Keep the subdomain out of Google

While `new.mdhygiene.in` is up it is a second copy of the site. Add a
`robots.txt` to the subdomain's document root:

```
User-agent: *
Disallow: /
```

The canonical tags already point at `mdhygiene.in`, so the risk is small, but
this closes it.

---

## Phase 4 — Test the new site properly

At `https://new.mdhygiene.in`. Work through all of it; this is the last chance
before customers see it.

**Pages**
- Homepage, `/products`, a product page, a brand page, `/about`,
  `/certifications`, `/careers`, `/contact`
- The catalogue filters on `/products`

**The things that only break in production**
- `/card/95863.php` → should land on Rutika's new card
- `/card/pdf/1.pdf` → should **open the PDF**, not a web page
- `/sitemap.xml`, `/robots.txt`, `/llms.txt` → should load
- View source on the homepage: the canonical tag must read
  `https://mdhygiene.in`, not the subdomain and not localhost

**Admin**
- Sign in at `/admin/login`
- **Change the admin password** at Admin → Account, if you have not already
- Edit something — a product name — save, and confirm the public page updates
- Submit the contact form and confirm it appears under Inquiries

Do not proceed until all of that passes.

---

## Phase 5 — The cutover

The actual switch. Five minutes, and reversible.

1. **Back up `public_html` again**, in whatever state it is now.
2. **Move the old site aside rather than deleting it:** in File Manager, create
   `~/old-site-backup` and move the contents of `public_html` into it. Keep
   `.well-known` where it is — AutoSSL uses it.
3. cPanel → **Setup Node.js App** → open the application → change
   **Application URL** from `new.mdhygiene.in` to `mdhygiene.in` → Save →
   **Restart**.

   cPanel rewrites the `.htaccess` in `public_html` to pass requests to the Node
   process.
4. **Add the HTTPS redirect above cPanel's block** in `public_html/.htaccess`:

   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} !=on
   RewriteCond %{HTTP:X-Forwarded-Proto} !https
   RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

   Do this only once AutoSSL has issued a certificate for the domain. The app
   sends `Strict-Transport-Security`, which tells browsers never to use plain
   HTTP for this domain again — that must not go out before HTTPS works.
5. Decide `www`. If `www.mdhygiene.in` resolves, point it at the bare domain
   with a redirect, so the two are not competing as separate addresses. The
   canonical is `https://mdhygiene.in`, without `www`.

---

## Phase 6 — Verify the live domain

Same list as Phase 4, now against `https://mdhygiene.in`:

```bash
# canonical must say mdhygiene.in
curl -s https://mdhygiene.in/ | grep -o '<link rel="canonical" href="[^"]*"'

# the old visiting-card addresses
curl -sI https://mdhygiene.in/card/95863.php | head -3

# the catalogue must come back as a PDF, not a page
curl -sI https://mdhygiene.in/card/pdf/1.pdf | grep -i content-type

# plain HTTP must be redirected
curl -sI http://mdhygiene.in/ | head -3
```

Then submit `https://mdhygiene.in/sitemap.xml` to Google Search Console and Bing
Webmaster Tools, and paste the verification strings into Admin → SEO.

---

## If it goes wrong — rollback

Under two minutes, at any point:

1. cPanel → **Setup Node.js App** → **Stop** the application.
2. File Manager → open `public_html/.htaccess` → delete the block cPanel added
   for the Node app (it is marked with `# DO NOT REMOVE` comments — remove it
   anyway, that is what the backup is for).
3. Move the old site's files back from `~/old-site-backup` into `public_html`.

The old site is serving again. Nothing about it was deleted, which is the whole
point of moving rather than removing in Phase 5.

---

## After the dust settles

- Leave `~/old-site-backup` in place for a few weeks. Once you are sure nothing
  is missing, it can go.
- The old site's database — the one `card/db-config.php` points at — is no
  longer used by anything. Those credentials were committed to this repository's
  history at one point, so **change that database password** even though nothing
  reads it any more.
- Content changes do not need a rebuild. Only code changes need
  `git pull && npm ci && npm run build` and a restart.

---

## If the build fails on the server

| Symptom | Cause |
|---|---|
| Hangs, then fails | Outbound HTTPS is blocked. The build fetches two typefaces from `fonts.gstatic.com` and reads Supabase to pre-render pages. |
| "supabaseUrl is required" | The environment variables are not set on the app, or were added after the build. Add them, then build again. |
| Runs out of memory | Ask the host to raise the Node memory limit for the app. The build peaks well above what it needs at rest. |
| Neither the buttons nor SSH work | This host cannot build a Next.js application, which means it cannot run this site. That is a hosting question, not a code one — raise it with the provider. |
