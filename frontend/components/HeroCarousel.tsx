"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { HeroSlide } from "@/lib/types";
import { isRenderableImage } from "@/lib/image";

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
    <section className="relative overflow-hidden min-h-[520px] md:min-h-[600px] flex items-end md:items-center m-3 md:m-6 rounded-[24px] md:rounded-[32px]">
      {/* Full-bleed media, edge to edge. Slides cross-fade and drift left→right. */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          aria-hidden={i !== active}
          className={`absolute inset-0 transition-all duration-[1200ms] ease-out ${
            i === active ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-6 scale-105"
          }`}
        >
          {s.media_type === "video" && isRenderableImage(s.media_url) ? (
            <video
              src={s.media_url}
              poster={s.poster_url ?? undefined}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : isRenderableImage(s.media_url) ? (
            <Image
              src={s.media_url}
              alt={s.headline}
              fill
              className="object-cover object-center"
              priority={i === 0}
              sizes="100vw"
            />
          ) : (
            // Unsupported or broken media: keep the slide readable rather than
            // letting next/image throw and take the whole homepage down.
            <div className="w-full h-full bg-gradient-to-br from-[#FDEFF4] via-cream to-[#F3F8FC]" />
          )}
        </div>
      ))}

      {/* Frosted panel behind the copy — blurs the image only on the left.
          43% wide with the mask going transparent at 70% of that: solid across
          the first 30% of the frame, leaving the photo clean for the other 70%. */}
      <div className="absolute inset-0 md:inset-y-0 md:left-0 md:right-auto md:w-[36%] backdrop-blur-xl bg-white/60 [mask-image:linear-gradient(to_top,black_85%,transparent_100%)] md:[mask-image:linear-gradient(to_right,black_78%,transparent_100%)]" />

      <div className="relative w-full px-5 pt-24 pb-10 md:px-10 lg:px-14 md:py-16">
        <div className="max-w-[560px] md:max-w-[min(560px,23vw)] flex flex-col gap-8">
          {slide.eyebrow && (
            <span
              key={`${slide.id}-eyebrow`}
              className="self-start inline-flex items-center gap-2 bg-white text-pink text-[13px] font-bold px-4 py-1.5 rounded-full shadow-sm animate-[heroIn_700ms_ease-out_both]"
            >
              {slide.eyebrow}
            </span>
          )}
          {/* Schibsted Grotesk reports 0.98em above the baseline and 0.26em below
              it, so anything under ~1.15 line-height lets a descender ("g", "y")
              touch the line beneath. 1.4 leaves the lines clearly separate.
              The size is tied to the viewport because the column is a share of
              it — a fixed size overflows on a narrow desktop. */}
          <h1
            key={`${slide.id}-headline`}
            className="text-[32px] sm:text-4xl md:text-[clamp(22px,2.9vw,42px)] leading-[1.4] font-extrabold text-navy text-balance [hyphens:auto] animate-[heroIn_700ms_ease-out_both] [animation-delay:80ms]"
          >
            {slide.headline}
          </h1>
          {slide.subheading && (
            <p
              key={`${slide.id}-sub`}
              className="text-[15px] sm:text-base md:text-[15px] lg:text-base leading-relaxed text-[#44566B] max-w-[500px] animate-[heroIn_700ms_ease-out_both] [animation-delay:160ms]"
            >
              {slide.subheading}
            </p>
          )}
          <div className="flex flex-wrap gap-3.5 animate-[heroIn_700ms_ease-out_both] [animation-delay:240ms]">
            {slide.cta_label && slide.cta_href && (
              <Link
                href={slide.cta_href}
                className="flex-1 md:flex-none text-center bg-blue text-white px-6 md:px-[30px] py-[14px] md:py-[15px] rounded-lg font-semibold text-[15px] md:text-base hover:bg-navy transition-colors"
              >
                {slide.cta_label}
              </Link>
            )}
            <Link
              href="/contact"
              className="flex-1 md:flex-none text-center bg-white/90 border-[1.5px] border-border text-navy px-6 md:px-[30px] py-[14px] md:py-[15px] rounded-lg font-semibold text-[15px] md:text-base hover:border-pink transition-colors"
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
