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

  /**
   * The addresses the old PHP site answered on, pointed at their replacements.
   *
   * mdhygiene.in has been serving visiting cards at /card/<number>.php. Those
   * numbers are printed on cards and encoded in QR codes that are already in
   * people's hands — a QR code cannot be edited once it is printed, so the
   * address it points at has to keep working for as long as the cards exist.
   * Each one now lands on the same person's new card.
   *
   * 308 rather than 307: permanent, so a search engine moves its record to the
   * new address instead of re-checking the old one for ever.
   */
  async redirects() {
    // Old numeric page → the slug of the same person's card today.
    const cards = {
      "72111": "MDH2X7V", // Digisha Kanani
      "73592": "MDH5N6J", // Bhargav Patel
      "75674": "MDH3R9T", // Nirali Rafaliya
      "75730": "MDH4D8Z", // Pooja Tanna
      "89800": "MDH7K4P", // Dharmendra Gurjar
      "95105": "MDH8W2M", // Kishor Soliya
      "95862": "MDH9F4C", // Janvi Desai
      "95863": "MDH6B3H", // Rutika Vora
      "95864": "MDH7Q5S", // Kishan Tanna
    };

    // The folder was uploaded in a way that answered on both paths, so both are
    // covered. Costs nothing, and guessing wrong here breaks a printed card.
    const prefixes = ["/card", "/card/card"];

    const cardRedirects = prefixes.flatMap((prefix) =>
      Object.entries(cards).map(([old, slug]) => ({
        source: `${prefix}/${old}.php`,
        destination: `/card/${slug}`,
        permanent: true,
      }))
    );

    return [
      ...cardRedirects,

      // The catalogue PDFs are NOT redirected. They are served as static files
      // from public/card/pdf, at the addresses the old site used, so an old
      // link opens the same document it always did rather than a page about
      // it. Only the duplicated /card/card path needs sending anywhere, and it
      // goes to the file rather than away from it.
      { source: "/card/card/pdf/:file", destination: "/card/pdf/:file", permanent: true },

      // Any other numbered card page we do not have a mapping for. Better the
      // homepage than an error, and it keeps the old site from leaving 404s
      // behind in Search Console.
      { source: "/card/:id(\\d+).php", destination: "/", permanent: true },
      { source: "/card/card/:id(\\d+).php", destination: "/", permanent: true },
    ];
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
