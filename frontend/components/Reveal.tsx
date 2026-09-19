"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades/slides children in when they scroll into view, and resets once they
 * leave, so the animation replays on every pass rather than only on first load.
 *
 * `holdOnPhone` drops the whole entrance below md. Inside a horizontal rail a
 * card leaves the viewport sideways every few seconds and a fresh one takes its
 * place, so a vertical slide-in — whether replayed on the way back or run for
 * the first time on a card that has just scrolled in — reads as the row bobbing
 * up and down. There is nothing to reveal in a rail anyway: the cards are
 * already on screen, moving sideways.
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

    // In a phone rail: show it and never observe it, so it neither slides in
    // when it first scrolls into view nor resets on the way out.
    if (holdOnPhone && window.matchMedia("(max-width: 767px)").matches) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setShown(true);
        } else if (entry.boundingClientRect.top > 0) {
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
