"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Pinned sidebar on desktop; a drawer behind a hamburger on mobile, where a
 * fixed 240px rail would otherwise eat most of the screen.
 */
export default function AdminSidebar({
  nav,
  signOut,
}: {
  nav: { href: string; label: string }[];
  signOut: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever navigation happens.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const navList = (
    <>
      <span className="font-extrabold text-lg mb-6">MDHygiene Admin</span>
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive(item.href) ? "bg-white/15 text-white" : "text-[#C3D6E7] hover:bg-white/10 hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      ))}
      <div className="mt-auto pt-6">{signOut}</div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-navy text-white flex items-center justify-between px-4">
        <span className="font-extrabold">MDHygiene Admin</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={open}
          className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-white/10 transition-colors"
        >
          <span className="block w-5 h-[2px] bg-white rounded-full" />
          <span className="block w-5 h-[2px] bg-white rounded-full" />
          <span className="block w-5 h-[2px] bg-white rounded-full" />
        </button>
      </div>

      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer (mobile) */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-[76%] max-w-[280px] bg-navy text-white flex flex-col gap-1 p-5 overflow-y-auto transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navList}
      </aside>

      {/* Rail (desktop) */}
      <aside className="hidden md:flex w-60 shrink-0 bg-navy text-white flex-col gap-1 p-5 h-full overflow-y-auto">
        {navList}
      </aside>
    </>
  );
}
