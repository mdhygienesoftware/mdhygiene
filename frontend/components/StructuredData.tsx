import type { SeoAi, SeoAddress, SeoGeneral, SeoLocal } from "@/lib/types";

/**
 * JSON-LD emitted into the page. Google reads this for rich results, and
 * generative engines read it to describe the business accurately.
 */
export default function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Content is our own settings data, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function postalAddress(address: SeoAddress) {
  return {
    "@type": "PostalAddress",
    streetAddress: address.street,
    addressLocality: address.city,
    addressRegion: address.state,
    postalCode: address.postal_code,
    addressCountry: address.country || "IN",
  };
}

function geoCoordinates(address: SeoAddress) {
  // Omitted unless both are set — wrong coordinates hurt local ranking.
  if (!address.latitude?.trim() || !address.longitude?.trim()) return undefined;
  return { "@type": "GeoCoordinates", latitude: address.latitude, longitude: address.longitude };
}

export function organizationSchema(
  general: SeoGeneral,
  local: SeoLocal,
  siteUrl: string,
  contact: { phones?: string[]; email?: string } = {}
) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: local.business_name || general.site_name,
    url: siteUrl,
    logo: `${siteUrl}/images/brand/mdh-logo.png`,
    description: general.default_description,
    foundingDate: local.founded_year || undefined,
    address: postalAddress(local.corporate),
    email: contact.email,
    telephone: contact.phones?.[0],
    contactPoint: contact.phones?.length
      ? contact.phones.map((phone) => ({
          "@type": "ContactPoint",
          telephone: phone,
          contactType: "sales",
          areaServed: "IN",
          availableLanguage: ["en", "hi", "gu"],
        }))
      : undefined,
    areaServed: [...(local.service_areas ?? []), ...(local.export_markets ?? [])].map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
  };
}

/** LocalBusiness for the factory — what drives "manufacturer near me" results. */
export function localBusinessSchema(
  local: SeoLocal,
  siteUrl: string,
  contact: { phones?: string[]; email?: string } = {}
) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#localbusiness`,
    name: local.business_name,
    url: siteUrl,
    image: `${siteUrl}/images/brand/mdh-logo.png`,
    address: postalAddress(local.factory),
    geo: geoCoordinates(local.factory),
    telephone: contact.phones?.[0],
    email: contact.email,
    openingHours: local.opening_hours || undefined,
    hasMap: local.google_maps_url || undefined,
  };
}

export function productSchema(
  product: { name: string; description: string | null; image_url: string | null; slug: string },
  brandName: string | null,
  siteUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.image_url ?? undefined,
    url: `${siteUrl}/products/${product.slug}`,
    brand: brandName ? { "@type": "Brand", name: brandName } : undefined,
    manufacturer: { "@id": `${siteUrl}/#organization` },
  };
}

export function faqSchema(ai: SeoAi) {
  if (!ai.faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ai.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
