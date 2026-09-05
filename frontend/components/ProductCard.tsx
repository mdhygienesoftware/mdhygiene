import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const sizes = Array.from(new Set(product.variants.map((v) => v.size_label)));

  return (
    <Link
      href={`/products/${product.slug}`}
      className="rounded-2xl overflow-hidden border border-border bg-white flex flex-col hover:shadow-lg transition-shadow"
    >
      <div className="relative h-[220px] bg-[#F5E1EA]">
        {product.image_url && (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" />
        )}
        {product.badges?.[0] && (
          <span className="absolute top-3 left-3 bg-navy text-white text-[11px] font-bold px-3 py-1 rounded-full">
            {product.badges[0]}
          </span>
        )}
      </div>
      <div className="p-6 flex flex-col gap-3 flex-1">
        {product.brand && (
          <span className="text-[12px] font-bold tracking-[0.1em] uppercase" style={{ color: product.brand.accent_color ?? "#E4779F" }}>
            {product.brand.name}
          </span>
        )}
        <h3 className="text-lg font-extrabold text-navy leading-snug">{product.name}</h3>
        <div className="flex gap-2 flex-wrap">
          <span className="bg-[#FBF1F5] text-[#8C6A77] text-[12px] px-3 py-1 rounded-full">{sizes.join(" · ")}</span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-2">
          <span className="text-[12px] text-muted">
            {product.variants.length} size{product.variants.length === 1 ? "" : "s"}
          </span>
          <span className="text-blue font-semibold text-sm">View range →</span>
        </div>
      </div>
    </Link>
  );
}
