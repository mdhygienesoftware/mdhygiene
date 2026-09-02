"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { HeroSlide } from "@/lib/types";

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;
  const slide = slides[active];

  return (
    <section className="relative grid md:grid-cols-[1.05fr_1fr] gap-10 md:gap-14 px-6 md:px-14 py-16 md:py-20 bg-gradient-to-b from-[#FDEFF4] via-[#FBF6F2] to-[#F3F8FC] overflow-hidden">
      <div className="flex flex-col gap-6 justify-center">
        {slide.eyebrow && (
          <span className="self-start inline-flex items-center gap-2 bg-white text-pink text-[13px] font-bold px-4 py-1.5 rounded-full shadow-sm">
            {slide.eyebrow}
          </span>
        )}
        <h1 className="text-4xl md:text-[54px] leading-[1.07] font-extrabold text-navy text-balance">
          {slide.headline}
        </h1>
        {slide.subheading && (
          <p className="text-lg leading-relaxed text-[#55676F] max-w-[530px]">{slide.subheading}</p>
        )}
        <div className="flex flex-wrap gap-3.5">
          {slide.cta_label && slide.cta_href && (
            <Link
              href={slide.cta_href}
              className="bg-blue text-white px-[30px] py-[15px] rounded-lg font-semibold text-base hover:bg-navy transition-colors"
            >
              {slide.cta_label}
            </Link>
          )}
          <Link
            href="/contact"
            className="bg-white border-[1.5px] border-border text-navy px-[30px] py-[15px] rounded-lg font-semibold text-base hover:border-pink transition-colors"
          >
            Partner with us
          </Link>
        </div>
        {slides.length > 1 && (
          <div className="flex gap-2 mt-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${i === active ? "w-8 bg-pink" : "w-4 bg-border"}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="relative rounded-2xl overflow-hidden min-h-[280px] md:min-h-[400px] bg-[#F3DFE7]">
        {slide.media_type === "video" ? (
          <video key={slide.id} src={slide.media_url} poster={slide.poster_url ?? undefined} className="w-full h-full object-cover" autoPlay muted loop playsInline />
        ) : (
          <Image key={slide.id} src={slide.media_url} alt={slide.headline} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" />
        )}
      </div>
    </section>
  );
}
