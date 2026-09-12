"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades/slides children in when they scroll into view, and resets once they
 * leave, so the animation replays on every pass rather than only on first load.
 *
 * `holdOnPhone` switches that reset off below md. Inside a horizontal rail a
 * card leaves the viewport sideways every few seconds, and replaying a vertical
 * slide each time reads as the card bobbing up and down.
 *
 * Falls back to permanently visible if IntersectionObserver is unavailable, so
 * content can never be stranded invisible.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  holdOnPhone = false,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  holdOnPhone?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const stayShown = holdOnPhone && window.matchMedia("(max-width: 767px)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setShown(true);
        } else if (entry.boundingClientRect.top > 0 && !stayShown) {
          // Only reset when it leaves downward (below the viewport). Resetting
          // on the way out the top would make content vanish as you scroll past.
          setShown(false);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [holdOnPhone]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}
