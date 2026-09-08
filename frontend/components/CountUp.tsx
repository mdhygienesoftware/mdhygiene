"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a stat up when it scrolls into view.
 *
 * Values are free text set in admin ("10+", "500+", "PAN India"), so the numeric
 * part is animated and any prefix/suffix is preserved. Values with no digits
 * ("PAN India") render as-is rather than animating to nothing.
 */
export default function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const match = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
  const target = match ? Number(match[2].replace(/,/g, "")) : null;
  const [display, setDisplay] = useState(target === null ? value : `${match?.[1] ?? ""}0${match?.[3] ?? ""}`);

  useEffect(() => {
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

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const duration = 1400;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          // easeOutExpo — fast start, gentle settle
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          setDisplay(`${prefix}${Math.round(target * eased).toLocaleString("en-IN")}${suffix}`);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, target, match]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
