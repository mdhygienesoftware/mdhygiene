"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/lib/types";
import { isRenderableImage } from "@/lib/image";

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Each slide carries its own display time, set per slide in admin.
  useEffect(() => {
    if (slides.length < 2) return;
    const seconds = slides[active]?.duration_seconds ?? 6;
    const id = setTimeout(() => setActive((i) => (i + 1) % slides.length), Math.max(2, seconds) * 1000);
    return () => clearTimeout(id);
  }, [active, slides]);

  if (!slides.length) return null;
  const slide = slides[active];

  // The standing "Partner with us" button is a fallback. A slide whose own CTA
  // says the same thing, or already leads to /contact, would otherwise render
  // the same button twice.
  const showPartnerCta =
    slide.cta_href?.trim() !== "/contact" &&
    slide.cta_label?.trim().toLowerCase() !== "partner with us";

  return (
    <section
      className="relative overflow-hidden min-h-[560px] md:min-h-[600px] flex flex-col justify-end md:flex-row md:items-center md:justify-start m-3 md:m-6 rounded-[24px] md:rounded-[32px]"
      // Swipe to change slides. Touch only: a mouse drag across a hero is not
      // a gesture anyone expects, and the desktop hero has dots for this.
      onTouchStart={(e) => {
        const t = e.touches[0];
        touchStart.current = t ? { x: t.clientX, y: t.clientY } : null;
      }}
      onTouchEnd={(e) => {
        const from = touchStart.current;
        const to = e.changedTouches[0];
        touchStart.current = null;
        if (!from || !to || slides.length < 2) return;

        const dx = to.clientX - from.x;
        const dy = to.clientY - from.y;
        // Sideways intent, and far enough to be a swipe rather than a tap or a
        // scroll that drifted.
        if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy)) return;
        setActive((i) => (i + (dx < 0 ? 1 : -1) + slides.length) % slides.length);
      }}
    >
      {/* Full-bleed media at every width. On a phone the copy sits ON the photo
          over a dark scrim; from md up a frosted panel carries it instead.
          Slides cross-fade and drift left→right. */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <div
            key={s.id}
            aria-hidden={i !== active}
            className={`absolute inset-0 transition-all duration-[1200ms] ease-out ${
              i === active
                ? "opacity-100 translate-x-0 scale-100 animate-[kenburns_9s_ease-out_both] md:animate-none"
                : "opacity-0 -translate-x-6 scale-105"
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
      </div>

      {/* Scrim, phone only: the copy sits on the photo there, and white text on
          an unmanaged photograph is unreadable without one. */}
      <div className="absolute inset-0 md:hidden bg-[linear-gradient(to_top,rgba(12,38,60,0.92)_0%,rgba(12,38,60,0.72)_38%,rgba(12,38,60,0.12)_72%,transparent_100%)]" />

      {/* Frosted panel behind the copy, desktop only — blurs the image on the
          left. 36% wide with the mask going transparent at 78% of that: solid
          across the first 28% of the frame, photo clean for the rest. */}
      <div className="hidden md:block absolute md:inset-y-0 md:left-0 md:right-auto md:w-[36%] backdrop-blur-xl bg-white/60 md:[mask-image:linear-gradient(to_right,black_78%,transparent_100%)]" />

      {/* Phone slide controls. Dots are a pointer affordance; on a touch screen
          the photo itself is the control — tap left or right — with segment
          bars showing where you are and how long is left on this slide. */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => setActive((i) => (i - 1 + slides.length) % slides.length)}
            className="md:hidden absolute top-0 left-0 w-[32%] h-[62%]"
          />
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setActive((i) => (i + 1) % slides.length)}
            className="md:hidden absolute top-0 right-0 w-[68%] h-[62%]"
          />
          <div className="md:hidden absolute top-3.5 inset-x-4 flex items-center gap-1.5">
            {slides.map((s, i) => (
              <span key={s.id} className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden">
                <span
                  // Re-keyed on the active slide so the fill restarts each time.
                  key={`${active}-${i}`}
                  className="block h-full rounded-full bg-white"
                  style={
                    i < active
                      ? { width: "100%" }
                      : i === active
                        ? { animation: `barFill ${Math.max(2, slide.duration_seconds ?? 6)}s linear forwards` }
                        : { width: 0 }
                  }
                />
              </span>
            ))}
          </div>
          <span className="md:hidden absolute top-[30px] right-4 font-mono text-[11px] tracking-[0.1em] text-white/85 [text-shadow:0_1px_6px_rgba(12,38,60,0.5)]">
            {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </>
      )}

      <div className="relative w-full px-5 py-8 md:px-10 lg:px-14 md:py-16">
        <div className="max-w-[560px] md:max-w-[min(560px,23vw)] flex flex-col gap-[18px] md:gap-8">
          {slide.eyebrow && (
            <span
              key={`${slide.id}-eyebrow`}
              className="self-start inline-flex items-center gap-2 bg-pink text-white md:bg-white md:text-pink text-xs md:text-[13px] font-bold px-4 py-1.5 rounded-full md:shadow-sm animate-[heroIn_700ms_ease-out_both]"
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
            className="text-[32px] sm:text-4xl md:text-[clamp(22px,2.9vw,42px)] leading-[1.32] md:leading-[1.4] font-extrabold text-white md:text-navy text-balance animate-[heroIn_700ms_ease-out_both] [animation-delay:80ms]"
          >
            {slide.headline}
          </h1>
          {slide.subheading && (
            <p
              key={`${slide.id}-sub`}
              className="text-[15px] sm:text-base md:text-[15px] lg:text-base leading-relaxed text-[#E3ECF4] md:text-[#44566B] max-w-[500px] animate-[heroIn_700ms_ease-out_both] [animation-delay:160ms]"
            >
              {slide.subheading}
            </p>
          )}
          <div className="flex flex-wrap gap-2.5 md:gap-3.5 animate-[heroIn_700ms_ease-out_both] [animation-delay:240ms]">
            {slide.cta_label && slide.cta_href && (
              <Link
                href={slide.cta_href}
                className="flex-1 md:flex-none text-center bg-white text-navy md:bg-blue md:text-white px-6 md:px-[30px] py-[14px] md:py-[15px] rounded-[10px] md:rounded-lg font-bold md:font-semibold text-[15px] md:text-base hover:bg-navy hover:text-white transition-colors"
              >
                {slide.cta_label}
              </Link>
            )}
            {showPartnerCta && (
              <Link
                href="/contact"
                className="flex-1 md:flex-none text-center bg-white/[0.14] md:bg-white/90 border-[1.5px] border-white/45 md:border-border text-white md:text-navy px-6 md:px-[30px] py-[14px] md:py-[15px] rounded-[10px] md:rounded-lg font-semibold text-[15px] md:text-base hover:border-pink transition-colors"
              >
                Partner with us
              </Link>
            )}
          </div>

          {slides.length > 1 && (
            <div className="hidden md:flex gap-2 mt-2">
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
