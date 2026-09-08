import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

export default function ProductShowcase({ products, title }: { products: Product[]; title?: string }) {
  if (!products.length) {
    return (
      <section className="px-5 md:px-14 pb-16 md:pb-20">
        <p className="text-muted-2">No products to show yet — check back soon.</p>
      </section>
    );
  }

  return (
    <section className="px-5 md:px-14 pb-16 md:pb-20 flex flex-col gap-8">
      {title && (
        <Reveal>
          <h2 className="text-[26px] md:text-[36px] font-extrabold text-navy">{title}</h2>
        </Reveal>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {products.map((product, i) => (
          // Stagger caps out so a long grid doesn't leave the last cards waiting.
          <Reveal key={product.slug} delay={Math.min(i, 7) * 80} className="h-full">
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
