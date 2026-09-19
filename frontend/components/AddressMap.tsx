"use client";

import { useEffect, useRef, useState } from "react";
import { mapEmbedSrc, mapLinkHref } from "@/lib/contact-links";

/**
 * An address that shows its location on hover.
 *
 * The map is only mounted once someone actually asks for it, and stays mounted
 * afterwards — two footer iframes loading on every page view would cost every
 * visitor a Google request they never wanted.
 *
 * Hover is a pointer idea, so the address is also a button: tap toggles it on a
 * phone, and it opens on keyboard focus.
 */
export default function AddressMap({ label, address }: { label: string; address: string }) {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const hideTimer = useRef<number | undefined>(undefined);

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

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  return (
    <div
      className="relative flex flex-col gap-2.5 text-sm text-[#9DB4C8]"
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
    >
      <span className="text-white font-bold text-[13px] tracking-[0.1em]">{label}</span>

      <button
        type="button"
        onClick={() => (open ? setOpen(false) : show())}
        onFocus={show}
        onBlur={scheduleHide}
        aria-expanded={open}
        className="text-left hover:text-white transition-colors"
      >
        {address}
        <span className="block mt-1 text-[12px] text-[#7C93AB]">
          {open ? "Hide map" : "Hover or tap for the map"}
        </span>
      </button>

      {everOpened && (
        <div
          // Kept mounted once opened so re-hovering is instant, and hidden
          // rather than unmounted so the iframe is not re-fetched each time.
          // The offset is padding, not margin: a margin would leave dead space
          // between address and map that the pointer has to cross, which reads
          // as the map closing the moment you reach for it.
          onMouseEnter={show}
          onMouseLeave={scheduleHide}
          className={`absolute bottom-full left-0 z-20 pb-3 w-[320px] max-w-[78vw] transition-opacity duration-150 ${
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
