"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryImage } from "@/lib/types";

/** How long each image holds before the carousel moves on. */
const DWELL_MS = 4500;
/** How long the slide itself takes. */
const SLIDE_MS = 700;

/**
 * Image carousel for the homepage and About page.
 *
 * Slides horizontally on a continuous loop: past the last image it runs back
 * to the first. There are no arrow buttons — it moves on its own, and can be
 * steered by dragging it, by the dots, or with the arrow keys.
 *
 * The drag is on pointer events rather than touch events, so a mouse gets the
 * same gesture a finger does; with the arrows gone, a touch-only drag left a
 * desktop visitor no way to move it at all.
 *
 * Images are contained rather than cropped, because a packshot is portrait and
 * a factory photo is wide: cropping either to one common box cuts the subject
 * out. The box keeps a fixed shape so the section's height never changes as
 * the loop runs.
 */
export default function ImageCarousel({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0);
  const dragStartX = useRef<number | null>(null);

  const go = useCallback(
    (delta: number) => setActive((i) => (i + delta + images.length) % images.length),
    [images.length]
  );

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => go(1), DWELL_MS);
    return () => window.clearTimeout(id);
    // Keyed on `active`, so using a dot also restarts the count.
  }, [active, images.length, go]);

  if (images.length === 0) return null;

  return (
    <div
      className="flex flex-col gap-4 focus:outline-none"
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label="Image carousel"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onPointerDown={(e) => {
        // Left button or a finger; ignore right-clicks and middle-clicks.
        if (e.pointerType === "mouse" && e.button !== 0) return;
        dragStartX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        const from = dragStartX.current;
        dragStartX.current = null;
        if (from == null) return;
        // A deliberate drag, not a click or a scroll that drifted sideways.
        if (Math.abs(e.clientX - from) > 40) go(e.clientX < from ? 1 : -1);
      }}
      onPointerCancel={() => {
        dragStartX.current = null;
      }}
    >
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-[#FBF6F2] cursor-grab active:cursor-grabbing select-none touch-pan-y">
        {/* One wide track holding every image side by side; moving it is the
            slide. A transform beats animating `left` — it stays on the
            compositor instead of forcing layout on every frame. */}
        <div
          className="flex h-full w-full transition-transform ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${active * 100}%)`, transitionDuration: `${SLIDE_MS}ms` }}
        >
          {images.map((image, i) => (
            <div key={`${image.url}-${i}`} className="relative h-full w-full shrink-0">
              <Image
                src={image.url}
                alt={image.alt || ""}
                fill
                draggable={false}
                className="object-contain p-3 sm:p-4 pointer-events-none"
                // The box is capped at max-w-3xl, so asking for more would
                // fetch a far larger file than is ever displayed.
                sizes="(max-width: 768px) 100vw, 768px"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2">
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
