"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryImage } from "@/lib/types";

/** How long each image holds before the carousel moves on. */
const DWELL_MS = 4500;

/**
 * Image carousel for the homepage and About page.
 *
 * Cross-fades rather than sliding, so images of different shapes don't shunt
 * the page around; each sits in a fixed box so the section's height never
 * changes between slides.
 *
 * It stops advancing while the pointer is over it, and doesn't advance at all
 * for someone who has asked for reduced motion.
 */
export default function ImageCarousel({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (delta: number) => setActive((i) => (i + delta + images.length) % images.length),
    [images.length]
  );

  useEffect(() => {
    if (images.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => go(1), DWELL_MS);
    return () => window.clearTimeout(id);
  }, [active, paused, images.length, go]);

  if (images.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const from = touchStartX.current;
        const to = e.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (from == null || to == null) return;
        // A deliberate swipe, not a tap or a vertical scroll that drifted.
        if (Math.abs(to - from) > 40) go(to < from ? 1 : -1);
      }}
    >
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-[#F5E1EA]">
        {images.map((image, i) => (
          <div
            key={`${image.url}-${i}`}
            aria-hidden={i !== active}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image.url}
              alt={image.alt || ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority={i === 0}
            />
          </div>
        ))}

        {images.length > 1 && (
          <>
            <Arrow direction="prev" onClick={() => go(-1)} />
            <Arrow direction="next" onClick={() => go(1)} />
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {images.map((image, i) => (
            <button
              key={`${image.url}-dot-${i}`}
              type="button"
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-8 bg-pink" : "w-4 bg-navy/25 hover:bg-navy/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Arrow({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? "Previous image" : "Next image"}
      className={`absolute top-1/2 -translate-y-1/2 ${
        isPrev ? "left-3" : "right-3"
      } grid h-11 w-11 place-items-center rounded-full bg-white/85 text-navy shadow-[0_4px_14px_rgba(18,58,92,0.18)] backdrop-blur-sm transition-colors hover:bg-white hover:text-pink`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d={isPrev ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
      </svg>
    </button>
  );
}
