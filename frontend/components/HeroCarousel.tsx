"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { HeroSlide } from "@/lib/types";

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);

  // Each slide carries its own display time, set per slide in admin.
  useEffect(() => {
    if (slides.length < 2) return;
    const seconds = slides[active]?.duration_seconds ?? 6;
    const id = setTimeout(() => setActive((i) => (i + 1) % slides.length), Math.max(2, seconds) * 1000);
    return () => clearTimeout(id);
  }, [active, slides]);

  if (!slides.length) return null;
  const slide = slides[active];

  return (
    <section className="relative overflow-hidden min-h-[520px] md:min-h-[600px] flex items-center m-3 md:m-6 rounded-[24px] md:rounded-[32px]">
      {/* Full-bleed media, edge to edge. Slides cross-fade and drift left→right. */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          aria-hidden={i !== active}
          className={`absolute inset-0 transition-all duration-[1200ms] ease-out ${
            i === active ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-6 scale-105"
          }`}
        >
          {s.media_type === "video" ? (
            <video
              src={s.media_url}
              poster={s.poster_url ?? undefined}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <Image
              src={s.media_url}
              alt={s.headline}
              fill
              className="object-cover object-center"
              priority={i === 0}
              sizes="100vw"
            />
          )}
        </div>
      ))}

      {/* Frosted panel behind the copy — blurs the image only on the left. */}
      <div className="absolute inset-y-0 left-0 w-full md:w-[54%] lg:w-[48%] backdrop-blur-xl bg-white/60 md:[mask-image:linear-gradient(to_right,black_72%,transparent_100%)]" />

      <div className="relative w-full px-6 md:px-14 py-16">
        <div className="max-w-[560px] flex flex-col gap-6">
          {slide.eyebrow && (
            <span
              key={`${slide.id}-eyebrow`}
              className="self-start inline-flex items-center gap-2 bg-white text-pink text-[13px] font-bold px-4 py-1.5 rounded-full shadow-sm animate-[heroIn_700ms_ease-out_both]"
            >
              {slide.eyebrow}
            </span>
          )}
          <h1
            key={`${slide.id}-headline`}
            className="text-4xl md:text-[54px] leading-[1.07] font-extrabold text-navy text-balance animate-[heroIn_700ms_ease-out_both] [animation-delay:80ms]"
          >
            {slide.headline}
          </h1>
          {slide.subheading && (
            <p
              key={`${slide.id}-sub`}
              className="text-lg leading-relaxed text-[#44566B] max-w-[500px] animate-[heroIn_700ms_ease-out_both] [animation-delay:160ms]"
            >
              {slide.subheading}
            </p>
          )}
          <div className="flex flex-wrap gap-3.5 animate-[heroIn_700ms_ease-out_both] [animation-delay:240ms]">
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
              className="bg-white/90 border-[1.5px] border-border text-navy px-[30px] py-[15px] rounded-lg font-semibold text-base hover:border-pink transition-colors"
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
                  aria-current={i === active}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all ${i === active ? "w-8 bg-pink" : "w-4 bg-navy/25 hover:bg-navy/40"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
