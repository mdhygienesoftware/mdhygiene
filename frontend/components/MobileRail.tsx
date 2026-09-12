"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** How long one card-to-card move takes. */
const GLIDE_MS = 400;
/** How long a card rests before the rail moves on. */
const DWELL_MS = 1400;
/** Quiet time after the finger lifts before the rail takes over again. */
const RESUME_MS = 1200;

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * A swipe rail that also moves on its own — phone only.
 *
 * From md up this renders as the plain grid the `className` describes and the
 * timer never starts, so the desktop layout is untouched.
 *
 * The move is animated by hand rather than with `scrollTo({behavior:"smooth"})`
 * because that gives no control over duration, and the glide here is a fixed
 * 0.4 seconds.
 */
export default function MobileRail({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;

    const phone = window.matchMedia("(max-width: 767px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    // A rail that moves under someone reading is worse than one that doesn't.
    if (!phone.matches || still.matches) return;

    let frame = 0;
    let timer = 0;
    let idleUntil = 0;
    let holding = false;

    function glideTo(target: number) {
      const el = rail.current;
      if (!el) return;
      const from = el.scrollLeft;
      const distance = target - from;
      if (Math.abs(distance) < 1) return;
      const start = performance.now();

      // Mandatory snapping pulls against a scripted scroll and makes the glide
      // stutter, so it is lifted for the duration and restored at the end —
      // finger swipes keep snapping.
      el.style.scrollSnapType = "none";

      const step = (now: number) => {
        const el = rail.current;
        if (!el) return;
        const t = Math.min(1, (now - start) / GLIDE_MS);
        el.scrollLeft = from + distance * easeInOut(t);
        if (t < 1) {
          frame = requestAnimationFrame(step);
        } else {
          el.style.scrollSnapType = "";
        }
      };
      frame = requestAnimationFrame(step);
    }

    function advance() {
      const el = rail.current;
      if (!el) return;
      if (holding || performance.now() < idleUntil) return;

      const cards = Array.from(el.children) as HTMLElement[];
      if (cards.length < 2) return;

      // Card positions are measured from the rail's own left edge, then the
      // side padding is taken off so the first card lands flush with the copy
      // above it rather than against the screen edge.
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const offsets = cards.map((card) => card.offsetLeft - el.offsetLeft - pad);

      // Next card whose left edge is past the current position, or back to the
      // start once the last one is showing.
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      const next = atEnd ? 0 : (offsets.find((x) => x > el.scrollLeft + 8) ?? 0);
      glideTo(Math.max(0, next));
    }

    // The rail holds still under a finger and picks up again shortly after it
    // lifts — pausing until a fixed timeout expires instead made it look like
    // touching the rail had stopped it for good.
    const hold = () => {
      holding = true;
      cancelAnimationFrame(frame);
      if (rail.current) rail.current.style.scrollSnapType = "";
    };
    const release = () => {
      holding = false;
      idleUntil = performance.now() + RESUME_MS;
    };
    el.addEventListener("pointerdown", hold, { passive: true });
    el.addEventListener("touchstart", hold, { passive: true });
    el.addEventListener("wheel", release, { passive: true });
    // Listened for on the window: a finger that started on the rail often lifts
    // somewhere else, and the rail would never hear about it.
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("pointercancel", release, { passive: true });
    window.addEventListener("touchend", release, { passive: true });
    window.addEventListener("touchcancel", release, { passive: true });

    timer = window.setInterval(advance, DWELL_MS + GLIDE_MS);

    return () => {
      window.clearInterval(timer);
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerdown", hold);
      el.removeEventListener("touchstart", hold);
      el.removeEventListener("wheel", release);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("touchend", release);
      window.removeEventListener("touchcancel", release);
    };
  }, []);

  return (
    <div ref={rail} className={className}>
      {children}
    </div>
  );
}
