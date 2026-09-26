import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductShowcase from "@/components/ProductShowcase";
import Brands from "@/components/Brands";
import OemClients from "@/components/OemClients";
import { getBrands, getCategories, getOemClients, getProducts } from "@/lib/queries";
import StructuredData, { itemListSchema } from "@/components/StructuredData";
import { getSeoGeneral, resolveSiteUrl } from "@/lib/seo";
import { CATALOG_TYPES } from "@/lib/types";

// Rendered once and reused for five minutes, rather than rebuilt from scratch
// on every visit. Admin saves call revalidatePath, so an edit is live at once;
// what this changes is every visit in between.
export const revalidate = 300;

export const metadata = {
  title: "Products — MDHygiene",
  description:
    "The full M.D. Hygiene catalogue — sanitary napkins and baby diapers across 7Soft, Extra Sure, Extra Soft and 24Care, with pack sizes, case quantities and distributor pricing.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; category?: string; type?: string }>;
}) {
  const { brand: activeBrand, category: activeCategory, type: activeType } = await searchParams;

  const [general, products, brands, categories, oemClients] = await Promise.all([
    getSeoGeneral(),
    getProducts({
      brandSlug: activeBrand,
      categorySlug: activeCategory,
      catalogType: activeType,
    }),
    getBrands(),
    getCategories(),
    getOemClients(),
  ]);

  const isFiltered = Boolean(activeBrand || activeCategory || activeType);

  // With no filter applied, own-brand and OEM/private-label ranges are shown as
  // separate sections rather than one mixed grid.
  const ownBrand = products.filter((p) => p.catalog_type !== "oem");
  const oem = products.filter((p) => p.catalog_type === "oem");

  const siteUrl = resolveSiteUrl(general.canonical_domain);
  // Only the unfiltered catalogue is described as a list. A filtered view is a
  // subset of the same page, and emitting a different list for each filter
  // would have several URLs each claiming to be the catalogue.
  const list = isFiltered
    ? null
    : itemListSchema(
        "M.D. Hygiene product catalogue",
        products.map((product) => ({ name: product.name, url: `${siteUrl}/products/${product.slug}` })),
        `${siteUrl}/products`
      );

  return (
    <>
      {list && <StructuredData data={list} />}
      <Header />
      <main>
        <section className="px-5 md:px-14 py-8 md:py-12 flex flex-col gap-6">
          <div>
            <h1 className="text-[28px] md:text-[40px] font-extrabold text-navy">Product catalog</h1>
            <p className="text-muted-2 mt-2 max-w-xl">
              Sanitary napkins and baby diapers manufactured in Surat — priced for distribution, private
              label, OEM and government tender supply.
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterChip href="/products" active={!isFiltered}>
              All products
            </FilterChip>
            {CATALOG_TYPES.map((t) => (
              <FilterChip key={t.value} href={`/products?type=${t.value}`} active={activeType === t.value}>
                {t.label}
              </FilterChip>
            ))}
            {categories.map((c) => (
              <FilterChip key={c.id} href={`/products?category=${c.slug}`} active={activeCategory === c.slug}>
                {c.name}
              </FilterChip>
            ))}
            {brands.map((b) => (
              <FilterChip key={b.id} href={`/products?brand=${b.slug}`} active={activeBrand === b.slug}>
                {b.name}
              </FilterChip>
            ))}
          </div>
        </section>

        {isFiltered ? (
          <ProductShowcase products={products} />
        ) : (
          <>
            <ProductShowcase products={ownBrand} title="Our brands" />
            {oem.length > 0 ? (
              <ProductShowcase products={oem} title="OEM / Private label" />
            ) : (
              // There are no OEM products to list, so this is a call to action,
              // not a card: it spans the width and puts the ask in a button
              // rather than stranding a 768px box in a 1392px row.
              <section className="px-5 md:px-14 pb-4 md:pb-6">
                <div className="bg-white border border-border rounded-2xl p-7 md:p-9">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
                  <div className="flex flex-col gap-2 max-w-2xl">
                    <h2 className="text-xl md:text-2xl font-extrabold text-navy">OEM / Private label</h2>
                    <p className="text-muted-2 text-[15px] leading-relaxed">
                      We manufacture sanitary napkins and baby diapers under your own brand —
                      specification, production and packaging handled end-to-end. Private-label lines
                      aren&apos;t listed publicly; tell us your requirement and we&apos;ll quote.
                    </p>
                  </div>
                  <Link
                    href="/contact"
                    className="shrink-0 self-start bg-navy text-white px-8 py-4 rounded-lg font-semibold hover:bg-pink transition-colors"
                  >
                    Discuss a private-label run
                  </Link>
                  </div>

                  {/* Who already trusted us with a run. On a page that just
                      asked for a private-label enquiry, this is the answer to
                      the question the ask provokes. */}
                  <div className="mt-7 md:mt-8 pt-7 md:pt-8 border-t border-border">
                    <OemClients block={oemClients} compact />
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        <Brands brands={brands} />
      </main>
      <Footer />
    </>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`shrink-0 text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
        active ? "bg-navy text-white border-navy" : "bg-white text-navy border-border hover:border-pink"
      }`}
    >
      {children}
    </Link>
  );
}
