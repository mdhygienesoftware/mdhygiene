"use client";

import { useState } from "react";

const PAGES = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/certifications", label: "Certifications" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

/** Real device widths, not round numbers — the layout changes at 640 and 768. */
const SIZES = [
  { label: "Small phone", width: 360, height: 740 },
  { label: "Phone", width: 390, height: 844 },
  { label: "Large phone", width: 430, height: 932 },
  { label: "Tablet", width: 768, height: 1024 },
];

/**
 * The live site in a phone-sized frame.
 *
 * An iframe of our own pages rather than a mock-up, so what is shown is what
 * the site actually does at that width — including anything just changed in
 * the admin panel.
 */
export default function MobilePreview() {
  const [page, setPage] = useState(PAGES[0].href);
  const [size, setSize] = useState(SIZES[1]);
  const [nonce, setNonce] = useState(0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          Page
          <select
            value={page}
            onChange={(e) => setPage(e.target.value)}
            className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal bg-white"
          >
            {PAGES.map((p) => (
              <option key={p.href} value={p.href}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          Screen
          <select
            value={size.label}
            onChange={(e) => setSize(SIZES.find((s) => s.label === e.target.value) ?? SIZES[1])}
            className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal bg-white"
          >
            {SIZES.map((s) => (
              <option key={s.label} value={s.label}>
                {s.label} — {s.width}px
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          // Re-keying the iframe remounts it, which is the only reliable way to
          // reload a frame whose document we are not allowed to reach into.
          onClick={() => setNonce((n) => n + 1)}
          className="border border-border rounded-lg px-4 py-2.5 text-sm font-semibold text-navy hover:border-pink transition-colors"
        >
          Reload
        </button>

        <a
          href={page}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-blue hover:text-pink transition-colors py-2.5"
        >
          Open full size →
        </a>
      </div>

      <div className="flex justify-center rounded-2xl border border-border bg-[#F7F3EF] p-5 md:p-8 overflow-x-auto">
        <div
          className="shrink-0 rounded-[28px] border-[10px] border-navy bg-white shadow-[0_18px_40px_rgba(18,58,92,0.18)] overflow-hidden"
          style={{ width: size.width + 20 }}
        >
          <iframe
            key={`${page}-${size.label}-${nonce}`}
            src={page}
            title={`${page} at ${size.width}px`}
            className="block border-0 bg-white"
            style={{ width: size.width, height: size.height }}
          />
        </div>
      </div>

      <p className="text-xs text-muted-2">
        This is the real site, so it reflects whatever you last saved. Scroll inside the frame to see the
        whole page.
      </p>
    </div>
  );
}
