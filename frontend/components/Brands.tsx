import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/lib/types";

export default function Brands({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null;

  return (
    <section id="brands" className="px-6 md:px-14 py-16 md:py-20 flex flex-col gap-9">
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-bold tracking-[0.14em] text-pink">OUR BRANDS</span>
        <h2 className="text-3xl md:text-[36px] font-extrabold text-navy">Trusted on shelves across India</h2>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/brands/${brand.slug}`}
            className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4 items-start hover:shadow-md transition-shadow"
          >
            <div className="h-14 flex items-center">
              {brand.logo_url ? (
                <Image src={brand.logo_url} alt={brand.name} width={140} height={56} className="h-14 w-auto object-contain" />
              ) : (
                <span className="text-[26px] font-extrabold italic" style={{ color: brand.accent_color ?? "#123A5C" }}>
                  {brand.name}
                </span>
              )}
            </div>
            <span className="text-base font-bold text-navy">{brand.name}</span>
            <span className="text-[14px] leading-relaxed text-muted-2">{brand.tagline}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
