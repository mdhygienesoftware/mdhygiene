"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryImage } from "@/lib/types";

/** How long each image holds before the carousel moves on. */
const DWELL_MS = 4500;
/** Quiet period after someone scrolls it by hand, before the timer resumes. */
const RESUME_MS = 3000;

/** Which slot is nearest the middle of the track right now. */
function slotAt(el: HTMLDivElement) {
  const middle = el.scrollLeft + el.clientWidth / 2;
  let nearest = 0;
  let shortest = Infinity;
  for (let i = 0; i < el.children.length; i++) {
    const slide = el.children[i] as HTMLElement;
    const gap = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - middle);
    if (gap < shortest) {
      shortest = gap;
      nearest = i;
    }
  }
  return nearest;
}

/** The scroll position that puts a given slot in the middle. */
function centreOf(el: HTMLDivElement, slot: number) {
  const slide = el.children[slot] as HTMLElement | undefined;
  if (!slide) return 0;
  return slide.offsetLeft - (el.clientWidth - slide.offsetWidth) / 2;
}

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
 * The pictures run left to right in the order they were added — first picture
 * at the left-hand end — and the carousel works its way along them, so the one
 * peeking on the left is the picture before and the one on the right is the
 * picture next. It spans the full width of the window: the slide widths and
 * the padding that centres them are both set in vw, and the padding is exactly
 * half of what a slide leaves over, which is what lets the first and last
 * pictures reach the middle.
 *
 * Every slide is 4:3, and the same shape as every other, so the section's
 * height never changes as it runs. The height is capped: at full width 4:3
 * would be taller than the window on a monitor, so past that point the box
 * gets wider rather than taller and the picture is cropped to suit.
 */
export default function ImageCarousel({ images }: { images: GalleryImage[] }) {
  const track = useRef<HTMLDivElement>(null);
  const idleUntil = useRef(0);
  const [active, setActive] = useState(0);

  const last = images.length - 1;

  const scrollTo = useCallback((index: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: centreOf(el, index), behavior: "smooth" });
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
        setActive(slotAt(el));
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

      const at = slotAt(el);
      if (at >= last) {
        // Round again. Jumped, not glided: sweeping back across every picture
        // would run the whole thing backwards for several seconds.
        el.scrollLeft = Math.max(0, centreOf(el, 0));
        return;
      }
      el.scrollTo({ left: centreOf(el, at + 1), behavior: "smooth" });
    }, DWELL_MS);

    return () => window.clearInterval(id);
  }, [images.length, last]);

  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={track}
        role="group"
        aria-roledescription="carousel"
        aria-label="Image carousel"
        tabIndex={0}
        // relative so each slide's offsetLeft is measured against this track,
        // which is the space scrollLeft is in. items-start so the slides keep
        // their own 4:3 height instead of being stretched to the tallest.
        className="relative flex w-full items-start snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-[12vw] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
      >
        {images.map((image, i) => (
          <div
            key={`${image.url}-${i}`}
            className="relative aspect-[4/3] max-h-[68vh] w-[76vw] shrink-0 snap-center overflow-hidden rounded-2xl border border-border bg-[#FBF6F2]"
          >
            <Image
              src={image.url}
              alt={image.alt || ""}
              fill
              draggable={false}
              className="object-cover"
              sizes="76vw"
              // Deliberately not priority. This sits well below the fold, and
              // preloading it competes with the hero for the bandwidth that
              // decides the page's largest-contentful-paint.
              loading="lazy"
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
