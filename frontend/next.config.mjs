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
  },
};

export default nextConfig;
