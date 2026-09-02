import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "MDHygiene — Sanitary Pads & Baby Diapers Manufacturer",
  description:
    "MDHygiene manufactures sanitary pads and baby diapers in Surat, India, for distribution, private label / OEM, and government tender partners across India and export markets.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-navy antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
