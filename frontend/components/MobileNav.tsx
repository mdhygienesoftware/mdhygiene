"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Slide-out navigation for phones/tablets, where the desktop nav is hidden. */
export default function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  // Don't let the page scroll behind the open panel.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape closes, matching normal dialog behaviour.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-[#F2F6FA] transition-colors"
      >
        <span className="block w-5 h-[2px] bg-navy rounded-full" />
        <span className="block w-5 h-[2px] bg-navy rounded-full" />
        <span className="block w-5 h-[2px] bg-navy rounded-full" />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`lg:hidden fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <div
        className={`lg:hidden fixed top-0 right-0 z-50 h-full w-[82%] max-w-[320px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-extrabold text-navy">Menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-9 h-9 rounded-lg hover:bg-[#F2F6FA] text-navy text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col p-3 gap-0.5 overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-lg text-[15px] font-semibold text-navy hover:bg-[#F2F6FA] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-border">
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="block text-center bg-pink text-white px-5 py-3 rounded-lg font-semibold hover:bg-navy transition-colors"
          >
            Get a Quote
          </Link>
        </div>
      </div>
    </>
  );
}
