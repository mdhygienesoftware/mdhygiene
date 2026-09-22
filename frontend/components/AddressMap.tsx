"use client";

import { useEffect, useRef, useState } from "react";
import { mapEmbedSrc, mapLinkHref } from "@/lib/contact-links";

/**
 * An address that shows its location on the spot.
 *
 * The map is only mounted once someone actually asks for it, and stays mounted
 * afterwards — two footer iframes loading on every page view would cost every
 * visitor a Google request they never wanted.
 *
 * How it opens depends on what the device can do. With a pointer, hovering the
 * address is enough and moving away closes it. On a touch screen there is no
 * hover to offer, so a tap opens it and a second tap — or a tap anywhere else
 * on the page — closes it again. Either way it opens the map here rather than
 * sending you off to Google; the link to do that is inside the panel.
 * Keyboard focus opens it too.
 */
export default function AddressMap({ label, address }: { label: string; address: string }) {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  // Assume touch until proven otherwise, so the server and the first paint
  // agree and nothing depends on hover before we know it exists.
  const [canHover, setCanHover] = useState(false);
  const hideTimer = useRef<number | undefined>(undefined);
  const root = useRef<HTMLDivElement>(null);

  function show() {
    window.clearTimeout(hideTimer.current);
    setOpen(true);
    setEverOpened(true);
  }

  /**
   * Closing is delayed rather than immediate. Moving the pointer from the
   * address to the map crosses a diagonal, and a mouseleave that acted at once
   * would shut the map before the pointer arrived. The same grace lets a click
   * on the Maps link land before the button's blur closes anything.
   */
  function scheduleHide() {
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setOpen(false), 160);
  }

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
    return () => window.clearTimeout(hideTimer.current);
  }, []);

  // On touch there is no pointer to move away, so an open map would otherwise
  // sit there for good. A tap outside it is the equivalent gesture.
  useEffect(() => {
    if (!open || canHover) return;
    function onDown(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, canHover]);

  const hoverProps = canHover ? { onMouseEnter: show, onMouseLeave: scheduleHide } : {};

  return (
    <div ref={root} className="relative flex flex-col gap-2.5 text-sm text-[#9DB4C8]" {...hoverProps}>
      <span className="text-white font-bold text-[13px] tracking-[0.1em]">{label}</span>

      <button
        type="button"
        onClick={() => (open ? setOpen(false) : show())}
        // Focus and blur are a pointer story too: on touch, tapping the button
        // focuses it and the blur that follows would close what the tap just
        // opened. The outside-tap handler covers that case instead.
        onFocus={canHover ? show : undefined}
        onBlur={canHover ? scheduleHide : undefined}
        aria-expanded={open}
        className="text-left hover:text-white transition-colors"
      >
        {address}
      </button>

      {everOpened && (
        <div
          // Kept mounted once opened so re-opening is instant, and hidden
          // rather than unmounted so the iframe is not re-fetched each time.
          // The offset is padding, not margin: a margin would leave dead space
          // between address and map that the pointer has to cross, which reads
          // as the map closing the moment you reach for it.
          {...hoverProps}
          className={`absolute bottom-full left-0 z-20 pb-3 w-[320px] max-w-[min(320px,86vw)] transition-opacity duration-150 ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="overflow-hidden rounded-xl border border-white/15 bg-navy shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <iframe
              src={mapEmbedSrc(address)}
              title={`${label} location`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-[190px] w-full border-0"
            />
            <a
              href={mapLinkHref(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2.5 text-[13px] font-semibold text-white hover:text-pink transition-colors"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
