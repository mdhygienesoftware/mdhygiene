import type { Metadata } from "next";
import { Schibsted_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted by next/font — no render-blocking request to Google, no layout shift.
const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "M.D. Hygiene — Sanitary Napkin & Baby Diaper Manufacturer",
  description:
    "M.D. Hygiene Private Limited manufactures sanitary napkins and baby diapers in Surat, India — for distribution, private label / OEM, and government tender supply across India and export markets.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans text-navy antialiased">{children}</body>
    </html>
  );
}
