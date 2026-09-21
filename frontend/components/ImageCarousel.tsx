"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryImage } from "@/lib/types";

/** How long each image holds before the carousel moves on. */
const DWELL_MS = 4500;
/** Quiet period after someone scrolls it by hand, before the timer resumes. */
const RESUME_MS = 3000;

/**
 * Image carousel for the homepage and About page.
 *
 * This is a genuinely horizontally-scrolling element with scroll snapping, not
 * a transform driven from JavaScript. That is the point: the browser then
 * handles every sideways gesture itself — a two-finger trackpad swipe, a touch
 * swipe, shift-wheel, a dragged scrollbar — instead of the component trying to
 * recognise each one from raw wheel deltas and fighting the browser's own
 * back/forward gesture for them.
 *
 * All the component does is advance it on a timer and keep the dots in step.
 *
 * The pictures sit in a 4:3 box, the same shape at every width. They
 * are cut to 16:10 with a generous backdrop around the subject, so filling a
 * narrower box takes the backdrop from the sides rather than the product. The
 * shape is fixed, so the section's height never changes as it runs.
 */
export default function ImageCarousel({ images }: { images: GalleryImage[] }) {
  const track = useRef<HTMLDivElement>(null);
  const idleUntil = useRef(0);
  const [active, setActive] = useState(0);

  const scrollTo = useCallback((index: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }, []);

  // Which image is showing is read back from the scroll position, so a gesture
  // the browser handled on its own still moves the dots.
  useEffect(() => {
    const el = track.current;
    if (!el) return;

    let frame = 0;
    const onScroll = () => {
      // A hand-driven scroll defers the timer; without this the carousel would
      // yank itself onward mid-swipe.
      idleUntil.current = performance.now() + RESUME_MS;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = track.current;
        if (!el || el.clientWidth === 0) return;
        setActive(Math.round(el.scrollLeft / el.clientWidth));
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      const el = track.current;
      if (!el || el.clientWidth === 0) return;
      if (performance.now() < idleUntil.current) return;
      const at = Math.round(el.scrollLeft / el.clientWidth);
      el.scrollTo({ left: ((at + 1) % images.length) * el.clientWidth, behavior: "smooth" });
    }, DWELL_MS);

    return () => window.clearInterval(id);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={track}
        role="group"
        aria-roledescription="carousel"
        aria-label="Image carousel"
        tabIndex={0}
        className="flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-2xl border border-border bg-[#FBF6F2] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
      >
        {images.map((image, i) => (
          <div
            key={`${image.url}-${i}`}
            className="relative aspect-[4/3] w-full shrink-0 snap-start"
          >
            <Image
              src={image.url}
              alt={image.alt || ""}
              fill
              draggable={false}
              className="object-cover"
              // Capped at max-w-xl, so a full-viewport hint would fetch a far
              // larger file than is ever shown.
              sizes="(max-width: 576px) 100vw, 576px"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2">
          {images.map((image, i) => (
            <button
              key={`${image.url}-dot-${i}`}
              type="button"
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-current={i === active}
              onClick={() => scrollTo(i)}
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
