# API reference

There is no bespoke REST backend. The Next.js app talks to Supabase directly:
public pages read through the anon key (RLS filters what's visible), and every mutation
goes through a Next.js **Server Action** that runs on the server with the caller's
Supabase session attached. Authorization is enforced by Postgres RLS, not by the app —
so a forged request can't write anything a signed-in admin couldn't.

Two consequences worth knowing:
- The data contract is the schema in [ERD.md](./ERD.md), not a set of URL routes.
- Supabase also exposes an auto-generated PostgREST API at
  `https://gtpvibbeqlndkaezqniz.supabase.co/rest/v1/<table>`; the same RLS policies
  apply there, so it's safe for the anon key to be public.

## Server Actions

### Public (`frontend/lib/actions.ts`)

| Action | Args | Effect |
|---|---|---|
| `submitInquiryAction` | `FormData` | Inserts into `distributor_inquiries` (status `new`). Honeypot `website` field silently drops bots. |
| `adminSignInAction` | `FormData` (email, password) | Supabase password sign-in, sets the session cookie, redirects to `/admin`. |
| `adminSignOutAction` | — | Ends the session, redirects to `/admin/login`. |

Returns `{ ok: true }` or `{ ok: false, error }` — errors are deliberately generic to
avoid leaking whether an email exists.

> The public site has no cart/checkout: enquiries are the only inbound channel. The
> `orders` / `order_items` tables and the admin Orders screen remain in place for
> tracking, but nothing on the public site writes to them.

### Admin (`frontend/lib/admin-actions.ts`)

All require an `admin_profiles` row; RLS rejects them otherwise.

| Action | Args | Effect |
|---|---|---|
| `saveBrandAction` | `id \| null`, `FormData` | Create/update a brand |
| `deleteBrandAction` | `id` | Delete a brand |
| `saveProductAction` | `id \| null`, `FormData` | Create/update a product line |
| `deleteProductAction` | `id` | Delete a product (variants cascade) |
| `saveVariantAction` | `productId`, `variantId \| null`, `FormData` | Create/update a priced size |
| `deleteVariantAction` | `productId`, `variantId` | Delete a size |
| `saveHeroSlideAction` | `id \| null`, `FormData` | Create/update a hero slide (image or video) |
| `deleteHeroSlideAction` | `id` | Delete a hero slide |
| `updateSiteSettingAction` | `key`, `value` | Upsert a `site_settings` row |
| `updateInquiryStatusAction` | `id`, `status` | `new` → `contacted` → `closed` |
| `updateOrderStatusAction` | `id`, `status` | `pending` → `confirmed` → … → `delivered`/`cancelled` |

Each mutation calls `revalidatePath` so public pages reflect changes immediately.

## Read helpers (`frontend/lib/queries.ts`)

`getBrands`, `getBrandBySlug`, `getCategories`, `getProducts({ brandSlug, categorySlug })`,
`getFeaturedProducts`, `getProductBySlug`, `getHeroSlides`, `getCompanyStats`,
`getContactInfo`, `getAboutContent`, `getCertifications`, `getFooterTagline`.

Product reads join brand, category and variants in one query and return variants sorted
by `sort_order`.

## Media uploads

`components/admin/MediaUploader.tsx` uploads straight from the browser to the Supabase
Storage `media` bucket using the admin's session, then stores the returned public URL on
the record. Storage policies allow public read and admin-only write, so an anonymous
visitor can view images but cannot upload.

## Auth

Supabase Auth (email/password), admins only — there is no public sign-up. `middleware.ts`
refreshes the session cookie and redirects unauthenticated `/admin/*` requests to
`/admin/login`; `app/admin/(dashboard)/layout.tsx` additionally verifies an
`admin_profiles` row exists and signs out anyone who lacks one.
