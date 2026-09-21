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
 * It travels left to right: each picture arrives from the left and pushes the
 * one before it off to the right. A scroll container can only do that by
 * scrolling backwards, so the pictures are laid out in reverse and it starts at
 * the far end — which leaves the running order on screen the right way round,
 * first picture first.
 *
 * Images are contained rather than cropped, because a packshot is portrait and
 * a factory photo is wide: cropping either to one common box cuts the subject
 * out. The box keeps a fixed shape so the section's height never changes.
 */
export default function ImageCarousel({ images }: { images: GalleryImage[] }) {
  const track = useRef<HTMLDivElement | null>(null);
  const idleUntil = useRef(0);
  const [active, setActive] = useState(0);

  const ordered = [...images].reverse();
  const last = images.length - 1;

  const scrollTo = useCallback(
    (index: number) => {
      const el = track.current;
      if (!el) return;
      el.scrollTo({ left: (last - index) * el.clientWidth, behavior: "smooth" });
    },
    [last]
  );

  /** Put the track at the far end on mount, so there is room to travel left. */
  const openAtEnd = useCallback(
    (el: HTMLDivElement | null) => {
      track.current = el;
      if (el && el.clientWidth > 0) el.scrollLeft = last * el.clientWidth;
    },
    [last]
  );

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
        // Slot n counts back from the end, because the track is reversed.
        setActive(last - Math.round(el.scrollLeft / el.clientWidth));
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [last]);

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      const el = track.current;
      if (!el || el.clientWidth === 0) return;
      if (performance.now() < idleUntil.current) return;
      const at = Math.round(el.scrollLeft / el.clientWidth);
      if (at <= 0) {
        // Round again. Jumped, not glided: sliding back across every picture
        // would undo the direction the whole thing is travelling in.
        el.scrollLeft = last * el.clientWidth;
        return;
      }
      el.scrollTo({ left: (at - 1) * el.clientWidth, behavior: "smooth" });
    }, DWELL_MS);

    return () => window.clearInterval(id);
  }, [images.length, last]);

  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={openAtEnd}
        role="group"
        aria-roledescription="carousel"
        aria-label="Image carousel"
        tabIndex={0}
        className="flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-2xl border border-border bg-[#FBF6F2] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
      >
        {ordered.map((image, i) => (
          <div
            key={`${image.url}-${i}`}
            className="relative aspect-[16/10] w-full shrink-0 snap-start"
          >
            <Image
              src={image.url}
              alt={image.alt || ""}
              fill
              draggable={false}
              className="object-contain"
              // The box is capped at max-w-3xl, so asking for more would fetch
              // a far larger file than is ever displayed.
              sizes="(max-width: 768px) 100vw, 768px"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2">
          {ordered.map((image, i) => (
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
