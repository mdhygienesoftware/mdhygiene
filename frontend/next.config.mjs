/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Only the Supabase bucket that actually serves our media. A wildcard host
    // let anyone proxy arbitrary images through this domain at our cost, and is
    // the exact configuration called out by GHSA-9g9p-9gw9-jx7f (DoS via the
    // Image Optimizer's remotePatterns).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gtpvibbeqlndkaezqniz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // AVIF decoding is the surface in GHSA-2xp9-vwfh-vxw4 (unauthenticated RCE
    // in the Image Optimization API). Serving WebP only avoids it until the
    // Next upgrade lands.
    formats: ["image/webp"],
    // Optimised images are re-derived from Supabase once this expires. The
    // default is 60 seconds, which on a single VPS means re-encoding the same
    // photographs all day; the media is content-addressed by upload path and
    // never changes underneath us, so a month is safe and much cheaper.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // Everything the platform used to add for us. On a VPS behind cPanel nothing
  // sets these unless we do, and a missing header is not visible in testing —
  // it only shows up in an audit or an incident.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stops a browser second-guessing a Content-Type — the trick that
          // turns an uploaded file into an executable script.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // No other site may frame us, so a transparent overlay cannot
          // collect clicks meant for the admin panel.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          // Send the full URL within our own site, only the origin off it, so
          // an admin path never leaks in a referrer to a third party.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Hardware we never ask for. Denied outright rather than left to a
          // prompt somebody might accept.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
          // Two years, subdomains included. Only meaningful once the VPS is
          // serving https — which it must be before this goes live.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
      {
        // The admin panel is per-session and must never be held by a proxy or
        // a shared cache in front of the app.
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
