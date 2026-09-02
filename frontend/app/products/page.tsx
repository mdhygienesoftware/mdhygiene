import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductShowcase from "@/components/ProductShowcase";
import Brands from "@/components/Brands";
import { getBrands, getCategories, getProducts } from "@/lib/queries";

export const metadata = { title: "Products — MDHygiene" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { brand?: string; category?: string };
}) {
  const [products, brands, categories] = await Promise.all([
    getProducts({ brandSlug: searchParams.brand, categorySlug: searchParams.category }),
    getBrands(),
    getCategories(),
  ]);

  const activeBrand = searchParams.brand;
  const activeCategory = searchParams.category;

  return (
    <>
      <Header />
      <main>
        <section className="px-6 md:px-14 py-14 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl md:text-[40px] font-extrabold text-navy">Product catalog</h1>
            <p className="text-muted-2 mt-2 max-w-xl">
              Sanitary napkins and baby diapers manufactured in Surat — priced for distribution, private
              label, OEM and government tender supply.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip href="/products" active={!activeBrand && !activeCategory}>
              All products
            </FilterChip>
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
        <ProductShowcase products={products} />
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
      className={`text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
        active ? "bg-navy text-white border-navy" : "bg-white text-navy border-border hover:border-pink"
      }`}
    >
      {children}
    </Link>
  );
}
