"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a stat up when it scrolls into view, and replays each time it comes
 * back into view.
 *
 * Values are free text set in admin ("10+", "500+", "PAN India"), so only the
 * numeric part animates and any prefix/suffix is preserved. Values with no
 * digits render as-is.
 *
 * The real value is server-rendered, so figures are correct without JS and for
 * crawlers; the client only rewinds just before animating.
 */
export default function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  // Guards against a wheel-scroll re-crossing the threshold and restarting the
  // count mid-flight, which made it look far slower on desktop than on mobile.
  const activeRef = useRef(false);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    // Parsed inside the effect so no unstable object can retrigger it.
    const match = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
    const target = match ? Number(match[2].replace(/,/g, "")) : null;

    if (target === null) {
      setDisplay(value);
      return;
    }

    const prefix = match?.[1] ?? "";
    const suffix = match?.[3] ?? "";

    const prefersReduced =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      return;
    }

    const el = ref.current;
    if (!el) return;

    let cancelled = false;

    const run = () => {
      if (activeRef.current) return;
      activeRef.current = true;
      cancelAnimationFrame(frameRef.current);
      const duration = 700;
      const start = performance.now();

      const tick = (now: number) => {
        if (cancelled) return;
        const progress = Math.min(1, (now - start) / duration);
        // easeInOutCubic — eases in and out, so there's no hard jump at the
        // start and no abrupt stop, which reads far smoother than easeOutExpo.
        const eased =
          progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        setDisplay(`${prefix}${Math.round(target * eased).toLocaleString("en-IN")}${suffix}`);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          // Land on the authored string, not a reformatted approximation.
          setDisplay(value);
          activeRef.current = false;
        }
      };
      frameRef.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          run();
        } else if (entry.boundingClientRect.top > 0) {
          // Rewind only when it leaves below the viewport, so scrolling back up
          // replays it — but scrolling past upward doesn't blank the figure.
          cancelAnimationFrame(frameRef.current);
          activeRef.current = false;
          setDisplay(`${prefix}0${suffix}`);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);

    return () => {
      cancelled = true;
      activeRef.current = false;
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
