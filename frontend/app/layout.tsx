import type { Metadata } from "next";
import Script from "next/script";
import { Schibsted_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { getSeoAnalytics, getSeoGeneral, resolveSiteUrl } from "@/lib/seo";
import VisitorTracker from "@/components/VisitorTracker";
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

/** Built from the SEO settings so titles/descriptions are editable in admin. */
export async function generateMetadata(): Promise<Metadata> {
  const [general, analytics] = await Promise.all([getSeoGeneral(), getSeoAnalytics()]);
  const siteUrl = resolveSiteUrl(general.canonical_domain);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: general.default_title,
      template: general.title_template || "%s",
    },
    description: general.default_description,
    keywords: general.keywords?.length ? general.keywords : undefined,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: general.site_name,
      title: general.default_title,
      description: general.default_description,
      url: siteUrl,
      images: general.default_og_image ? [{ url: general.default_og_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: general.default_title,
      description: general.default_description,
      images: general.default_og_image ? [general.default_og_image] : undefined,
    },
    verification: {
      google: analytics.google_site_verification || undefined,
      other: analytics.bing_site_verification
        ? { "msvalidate.01": analytics.bing_site_verification }
        : undefined,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const analytics = await getSeoAnalytics();

  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans text-navy antialiased">
        <VisitorTracker />
        {children}

        {analytics.gtm_id && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${analytics.gtm_id}');`}
          </Script>
        )}

        {analytics.ga_measurement_id && !analytics.gtm_id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${analytics.ga_measurement_id}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analytics.ga_measurement_id}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
