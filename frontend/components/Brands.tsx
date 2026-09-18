import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import MobileRail from "@/components/MobileRail";
import type { Brand } from "@/lib/types";
import { isRenderableImage } from "@/lib/image";

export default function Brands({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null;

  return (
    <section id="brands" className="px-5 md:px-14 py-10 md:py-20 flex flex-col gap-7 md:gap-9">
      <Reveal>
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold tracking-[0.14em] text-pink">OUR BRANDS</span>
          <h2 className="text-[26px] md:text-[36px] font-extrabold text-navy">Trusted on shelves across India</h2>
        </div>
      </Reveal>

      <MobileRail className="flex items-stretch overflow-x-auto snap-x snap-mandatory gap-[14px] -mx-5 px-5 pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0 md:pb-0 md:overflow-visible md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {brands.map((brand, i) => (
          <Reveal key={brand.slug} delay={i * 110} holdOnPhone className="flex-[0_0_76%] snap-start md:flex-none">
            <Link
              href={`/brands/${brand.slug}`}
              style={{ ["--brand-accent" as string]: brand.accent_color ?? "#E4779F" }}
              className="group relative h-full bg-white border border-border rounded-2xl p-6 md:p-7 flex flex-col gap-4 items-start overflow-hidden
                         transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(18,58,92,0.12)] hover:border-[var(--brand-accent)]"
            >
              {/* Accent wash that grows on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{ background: brand.accent_color ?? "#E4779F" }}
              />
              <div className="h-16 w-full flex items-center justify-center">
                {isRenderableImage(brand.logo_url) ? (
                  <Image
                    src={brand.logo_url}
                    alt={brand.name}
                    width={340}
                    height={140}
                    className="max-h-12 md:max-h-14 w-auto max-w-[180px] object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-[26px] font-extrabold italic" style={{ color: brand.accent_color ?? "#123A5C" }}>
                    {brand.name}
                  </span>
                )}
              </div>
              {/* Desktop only: on a phone the cards are a swipe rail, and the
                  taglines made each card tall enough to crowd the row. */}
              <span className="hidden md:block text-[14px] leading-relaxed text-muted-2">
                {brand.tagline}
              </span>
              <span className="mt-auto pt-1 text-sm font-semibold text-blue opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                View range →
              </span>
            </Link>
          </Reveal>
        ))}
      </MobileRail>
    </section>
  );
}
