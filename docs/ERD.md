# Data model

Source of truth: the Supabase project's Postgres schema
(`gtpvibbeqlndkaezqniz`, region `ap-south-1`). Regenerate app types after any schema
change and paste into `frontend/lib/database.types.ts`.

## Tables

```
brands
  id (uuid, pk), slug (unique), name, tagline, logo_url, accent_color, sort_order
  1—N  products

product_categories
  id (uuid, pk), slug (unique), name, description
  1—N  products
  rows: sanitary-pads, baby-diapers

products                       ← a product *line* (e.g. "7Soft Maxi Care Cottony (XXL)")
  id (uuid, pk), brand_id → brands, category_id → product_categories,
  slug (unique), name, description, features text[], badges text[],
  image_url, is_active, is_featured, sort_order, created_at
  1—N  product_variants

product_variants               ← a priced, orderable size/pack of a product
  id (uuid, pk), product_id → products (cascade),
  size_label, pack_count, case_qty, mrp, net_price, sku,
  stock_status (in_stock | low_stock | out_of_stock), sort_order

hero_slides                    ← homepage carousel, admin-managed
  id (uuid, pk), media_type (image | video), media_url, poster_url,
  eyebrow, headline, subheading, cta_label, cta_href, sort_order, is_active

site_settings                  ← editable site copy, no redeploy needed
  key (pk), value (jsonb), updated_at
  keys: company_stats, contact, about, certifications, footer_tagline

distributor_inquiries          ← public contact / quote form
  id (uuid, pk), company_name, contact_name, email, phone, region,
  inquiry_type (distribution | private_label | government_tender | general),
  message, status (new | contacted | closed), created_at

orders                         ← distributor order requests (no payment gateway)
  id (uuid, pk), company_name, contact_name, email, phone, region, notes,
  status (pending | confirmed | processing | shipped | delivered | cancelled),
  created_at
  1—N  order_items

order_items
  id (uuid, pk), order_id → orders (cascade), product_variant_id → product_variants,
  product_name_snapshot, variant_label_snapshot, quantity, unit_price_snapshot
  (snapshots preserve what was quoted even if the catalog later changes)

admin_profiles                 ← marks which auth.users rows are admins
  id (uuid, pk) → auth.users (cascade), full_name, created_at
```

## Relationships

```
brands (1) ────< (N) products (1) ────< (N) product_variants
product_categories (1) ────< (N) products                    (1) ────< (N) order_items
orders (1) ────< (N) order_items
auth.users (1) ──── (1) admin_profiles

hero_slides, site_settings, distributor_inquiries stand alone.
```

## Row-level security

Every table has RLS enabled. Writes are gated on `public.is_admin()`, which returns
`exists (select 1 from admin_profiles where id = auth.uid())`.

| Table | anon SELECT | anon INSERT | admin |
|---|---|---|---|
| brands, product_categories, product_variants | ✅ | ❌ | full |
| products | ✅ where `is_active` | ❌ | full (sees hidden rows too) |
| hero_slides | ✅ where `is_active` | ❌ | full |
| site_settings | ✅ | ❌ | full |
| distributor_inquiries | ❌ | ✅ (public form) | read + update |
| orders, order_items | ❌ | ✅ (public form) | full |
| admin_profiles | ❌ | ❌ | read |

Storage: one public `media` bucket — public read, admin-only write. Seeded catalog
imagery lives under `media/seed/...`; admin uploads land in `media/uploads/...`.

## Why variants are a separate table

The real MDHygiene price list prices **per size**, not per product: 7Soft Premium Pack
50 Pcs is ₹675 MRP / ₹260 net in S but ₹825 / ₹290 in L, and case quantities differ per
size (48 vs 24). A flat product row can't express that, so pricing, pack count, case
quantity and stock status all live on `product_variants`, and the distributor request
list references a variant id.

## Deliberately out of scope

No `Customer`, `Cart` or `Payment` tables. This is a distributor/tender business —
buyers submit an order *request* against listed net pricing and the team confirms
pricing, MOQ and freight offline. If online checkout is ever added, introduce
`customers` and `payments` and give `orders` a `customer_id`.
