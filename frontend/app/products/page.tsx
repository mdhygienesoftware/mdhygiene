import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductShowcase from "@/components/ProductShowcase";
import Brands from "@/components/Brands";
import { getBrands, getCategories, getProducts } from "@/lib/queries";
import { CATALOG_TYPES } from "@/lib/types";

// Always render against current data — admin edits must show up immediately.
export const dynamic = "force-dynamic";

export const metadata = { title: "Products — MDHygiene" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { brand?: string; category?: string; type?: string };
}) {
  const [products, brands, categories] = await Promise.all([
    getProducts({
      brandSlug: searchParams.brand,
      categorySlug: searchParams.category,
      catalogType: searchParams.type,
    }),
    getBrands(),
    getCategories(),
  ]);

  const { brand: activeBrand, category: activeCategory, type: activeType } = searchParams;
  const isFiltered = Boolean(activeBrand || activeCategory || activeType);

  // With no filter applied, own-brand and OEM/private-label ranges are shown as
  // separate sections rather than one mixed grid.
  const ownBrand = products.filter((p) => p.catalog_type !== "oem");
  const oem = products.filter((p) => p.catalog_type === "oem");

  return (
    <>
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
              <section className="px-5 md:px-14 pb-16 md:pb-20">
                <div className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-2 max-w-3xl">
                  <h2 className="text-xl font-extrabold text-navy">OEM / Private label</h2>
                  <p className="text-muted-2 text-[15px] leading-relaxed">
                    We manufacture sanitary napkins and baby diapers under your own brand —
                    specification, production and packaging handled end-to-end. Private-label lines aren&apos;t
                    listed publicly; tell us your requirement and we&apos;ll quote.
                  </p>
                  <Link href="/contact" className="text-blue font-semibold text-[15px] mt-1">
                    Discuss a private-label run →
                  </Link>
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
