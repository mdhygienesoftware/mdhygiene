import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import MobileRail from "@/components/MobileRail";

export default function ProductShowcase({ products, title }: { products: Product[]; title?: string }) {
  if (!products.length) {
    return (
      <section className="px-5 md:px-14 pb-16 md:pb-20">
        <p className="text-muted-2">No products to show yet — check back soon.</p>
      </section>
    );
  }

  return (
    <section className="px-5 md:px-14 pb-10 md:pb-20 flex flex-col gap-7 md:gap-8">
      {title && (
        <Reveal>
          <h2 className="text-[26px] md:text-[36px] font-extrabold text-navy">{title}</h2>
        </Reveal>
      )}
      <MobileRail className="flex items-stretch overflow-x-auto snap-x snap-mandatory gap-[14px] -mx-5 px-[15vw] pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0 md:pb-0 md:overflow-visible md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {products.map((product, i) => (
          // Stagger caps out so a long grid doesn't leave the last cards waiting.
          <Reveal key={product.slug} delay={Math.min(i, 7) * 80} holdOnPhone className="flex-[0_0_70vw] snap-center md:flex-none">
            <ProductCard product={product} />
          </Reveal>
        ))}
      </MobileRail>
    </section>
  );
}
