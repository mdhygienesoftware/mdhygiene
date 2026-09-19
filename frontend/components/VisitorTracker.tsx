"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Records a page view once per navigation, so the admin dashboard can show who
 * is on the site without anyone having to open Google Analytics.
 *
 * sendBeacon where available: it hands the request to the browser and returns,
 * so the view is logged even if the visitor clicks away immediately.
 */
export default function VisitorTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    // Inside a frame this is the admin panel's mobile preview, not a visitor.
    if (window.self !== window.top) return;
    // React 18 runs effects twice in development; without this the same view
    // would be counted twice on every page.
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    const body = JSON.stringify({
      path: pathname + window.location.search,
      referrer: document.referrer || null,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/track", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
