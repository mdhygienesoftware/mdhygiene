"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartBadge() {
  const { count } = useCart();

  return (
    <Link href="/request" className="relative flex items-center text-navy hover:text-pink transition-colors" aria-label="Distributor request list">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="21" r="1.2" />
        <circle cx="17" cy="21" r="1.2" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-pink text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
