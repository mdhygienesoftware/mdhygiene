"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a stat up the first time it scrolls into view.
 *
 * Values are free text set in admin ("10+", "500+", "PAN India"), so only the
 * numeric part animates and any prefix/suffix is preserved. Values with no
 * digits render as-is.
 *
 * The real value is rendered on the server, so it is correct without JS and for
 * crawlers; the client only rewinds it to the start just before animating.
 */
export default function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    // Only `value` is a dependency — parsing happens inside so no unstable
    // object (a fresh regex match array) can retrigger this and restart the count.
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
    if (!el || hasRun.current) return;

    let frame = 0;
    let cancelled = false;
    setDisplay(`${prefix}0${suffix}`);

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || hasRun.current) return;
        hasRun.current = true;
        observer.disconnect();

        const duration = 1500;
        const start = performance.now();
        const tick = (now: number) => {
          if (cancelled) return;
          const progress = Math.min(1, (now - start) / duration);
          // easeOutExpo — quick start, gentle settle
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          setDisplay(`${prefix}${Math.round(target * eased).toLocaleString("en-IN")}${suffix}`);
          if (progress < 1) {
            frame = requestAnimationFrame(tick);
          } else {
            // Land exactly on the authored value, not a rounded approximation.
            setDisplay(value);
          }
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.35 }
    );

    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
