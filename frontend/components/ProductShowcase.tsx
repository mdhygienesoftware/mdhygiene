import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default function ProductShowcase({ products, title }: { products: Product[]; title?: string }) {
  if (!products.length) {
    return (
      <section className="px-6 md:px-14 pb-16 md:pb-20">
        <p className="text-muted-2">No products to show yet — check back soon.</p>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-14 pb-16 md:pb-20 flex flex-col gap-8">
      {title && <h2 className="text-3xl md:text-[36px] font-extrabold text-navy">{title}</h2>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
