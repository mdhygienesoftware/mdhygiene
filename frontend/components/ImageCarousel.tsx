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
 * The current picture sits in the middle at 4:3, with the ones either side of
 * it showing at the edges, so it reads as a run of pictures rather than a
 * single frame that swaps its contents. Every slide is the same fixed shape,
 * so the section's height never changes as it runs.
 *
 * It travels left to right: each picture arrives from the left and pushes the
 * one before it off to the right. A scroll container can only do that by
 * scrolling backwards, so the pictures are laid out in reverse and it opens at
 * the far end — which leaves the running order on screen the right way round,
 * first picture first.
 */
export default function ImageCarousel({ images }: { images: GalleryImage[] }) {
  const track = useRef<HTMLDivElement | null>(null);
  const idleUntil = useRef(0);
  const [active, setActive] = useState(0);

  const last = images.length - 1;
  const ordered = [...images].reverse();

  const scrollTo = useCallback(
    (index: number) => {
      const el = track.current;
      if (!el) return;
      el.scrollTo({ left: centreOf(el, last - index), behavior: "smooth" });
    },
    [last]
  );

  /** Open at the far end, so there is room to travel leftwards. */
  const openAtEnd = useCallback(
    (el: HTMLDivElement | null) => {
      track.current = el;
      if (el && el.clientWidth > 0) el.scrollLeft = centreOf(el, last);
    },
    [last]
  );

  // Belt and braces for the jump above: if the track had no width yet when it
  // mounted, that did nothing and it would open on the last picture instead of
  // the first. Put it right once layout has actually happened.
  useEffect(() => {
    const el = track.current;
    if (!el || el.scrollLeft > 0 || el.clientWidth === 0) return;
    el.scrollLeft = centreOf(el, last);
  }, [last]);

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
        setActive(last - slotAt(el));
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

      const at = last - slotAt(el);
      if (at >= last) {
        // Round again. Jumped, not glided: sliding back across every picture
        // would undo the direction the whole thing is travelling in.
        el.scrollLeft = centreOf(el, last);
        return;
      }
      el.scrollTo({ left: centreOf(el, last - at - 1), behavior: "smooth" });
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
        // relative so each slide's offsetLeft is measured against this track,
        // which is the same space scrollLeft is in.
        //
        // The side padding is exactly half the room a slide leaves over
        // ((100% - 76%) / 2), which is what lets the first and last pictures
        // reach the middle — and what makes the far end of the scroll the
        // resting place of the last slot.
        className="relative flex w-full snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-[12%] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
      >
        {ordered.map((image, i) => {
          const index = last - i;
          return (
            <div
              key={`${image.url}-${index}`}
              className="relative aspect-[4/3] w-[76%] shrink-0 snap-center overflow-hidden rounded-2xl border border-border bg-[#FBF6F2]"
            >
              <Image
                src={image.url}
                alt={image.alt || ""}
                fill
                draggable={false}
                className="object-cover"
                // 76% of a box capped at max-w-3xl, so a full-viewport hint
                // would fetch a far larger file than is ever shown.
                sizes="(max-width: 768px) 76vw, 584px"
                priority={index === 0}
              />
            </div>
          );
        })}
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
