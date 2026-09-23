import type { Brand, Product } from "@/lib/types";

/**
 * Meta descriptions for pages whose copy comes from the catalogue.
 *
 * A product's own description is one marketing line — 55 to 106 characters
 * across the catalogue. Google gives a description roughly 155 characters and
 * rewrites anything that leaves most of that empty, usually by scraping a
 * sentence off the page instead. Writing 26 descriptions by hand is a content
 * job nobody has done; composing one from facts the record already holds costs
 * nothing and fills the space with the things a buyer actually searches for —
 * the brand, the sizes, and that it is sold wholesale.
 *
 * An admin override always wins. These only fill the gap where none is set.
 */

/** Google truncates near 160; a little under keeps the last word whole. */
const LIMIT = 158;

/** Trims at a word boundary rather than mid-word, and never adds a stray dot. */
function clamp(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= LIMIT) return clean;
  const cut = clean.slice(0, LIMIT);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > LIMIT * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:\s]+$/, "") + "…";
}

/** Joins sentences, giving each a full stop without doubling one up. */
function sentences(parts: (string | null | undefined)[]): string {
  return parts
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p))
    .map((p) => (/[.!?…]$/.test(p) ? p : `${p}.`))
    .join(" ");
}

export function productMetaDescription(product: Product, fallback: string): string {
  const own = product.meta_description?.trim();
  if (own) return own;

  const sizes = [...new Set((product.variants ?? []).map((v) => v.size_label?.trim()).filter(Boolean))];
  const brand = product.brand?.name?.trim();

  const composed = sentences([
    product.description?.trim() || product.name,
    sizes.length ? `Available in ${sizes.join(", ")}` : null,
    brand
      ? `${brand} from M.D. Hygiene, Surat — wholesale pack and case quantities with distributor pricing`
      : "Manufactured by M.D. Hygiene, Surat — wholesale pack and case quantities with distributor pricing",
  ]);

  return clamp(composed) || fallback;
}

export function brandMetaDescription(brand: Brand, productCount: number, fallback: string): string {
  const own = brand.meta_description?.trim();
  if (own) return own;

  const composed = sentences([
    brand.tagline?.trim(),
    productCount
      ? `${productCount} ${brand.name} products manufactured by M.D. Hygiene in Surat, Gujarat`
      : `${brand.name} products manufactured by M.D. Hygiene in Surat, Gujarat`,
    "Pack sizes, case quantities and distributor pricing",
  ]);

  return clamp(composed) || fallback;
}
