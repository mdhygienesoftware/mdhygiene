"use client";

import { useState } from "react";
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

  function show() {
    setOpen(true);
    setEverOpened(true);
  }

  return (
    <div
      className="relative flex flex-col gap-2.5 text-sm text-[#9DB4C8] md:max-w-[240px]"
      onMouseEnter={show}
      onMouseLeave={() => setOpen(false)}
    >
      <span className="text-white font-bold text-[13px] tracking-[0.1em]">{label}</span>

      <button
        type="button"
        onClick={() => (open ? setOpen(false) : show())}
        onFocus={show}
        onBlur={() => setOpen(false)}
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
          className={`absolute bottom-full left-0 z-20 mb-3 w-[320px] max-w-[78vw] overflow-hidden rounded-xl border border-white/15 bg-navy shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition-opacity duration-150 ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
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
      )}
    </div>
  );
}
