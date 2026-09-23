import type { SeoAi, SeoAddress, SeoGeneral, SeoLocal } from "@/lib/types";

/**
 * JSON-LD emitted into the page. Google reads this for rich results, and
 * generative engines read it to describe the business accurately.
 */
export default function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialise(data) }}
    />
  );
}

/**
 * JSON, with every character that could end the script tag written as an
 * escape instead.
 *
 * An HTML parser looks for the literal text `</script` and stops there — it
 * does not know it is inside a JSON string. So a product name or a job
 * description containing one would close the tag early and put whatever
 * followed into the page as markup. `<` means the same thing to a JSON
 * parser and nothing at all to the HTML one.
 *
 * This is all admin-entered copy rather than anything a visitor supplies, so
 * it is a second line rather than the first — but it costs one replace.
 */
function serialise(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
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

/**
 * Open roles, one JobPosting each.
 *
 * This is the schema Google Jobs reads, and it is how an assistant answers
 * "is M.D. Hygiene hiring?" with the actual roles rather than a guess. Roles
 * that are closed are left out rather than marked closed — a stale posting is
 * worse than none.
 *
 * `datePosted` is required by Google and we do not record one, so the page's
 * own build date stands in: it is the earliest date we can honestly claim to
 * have been showing the role.
 */
export function jobPostingSchemas(
  openings: { id: string; title: string; location: string; employment_type: string; experience: string; description: string; is_open: boolean }[],
  local: SeoLocal,
  siteUrl: string,
  postedIso: string
) {
  return openings
    .filter((role) => role.is_open)
    .map((role) => ({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: role.title,
      description: role.description || `${role.title} at M.D. Hygiene.`,
      datePosted: postedIso,
      employmentType: employmentTypeCode(role.employment_type),
      experienceRequirements: role.experience || undefined,
      hiringOrganization: { "@id": `${siteUrl}/#organization` },
      jobLocation: {
        "@type": "Place",
        address: postalAddress(role.location ? { ...local.factory, city: role.location } : local.factory),
      },
      directApply: true,
      url: `${siteUrl}/careers#apply`,
    }));
}

/** Free text in admin, but schema.org expects one of a fixed set. */
function employmentTypeCode(value: string): string {
  const normalised = value.toLowerCase().replace(/[^a-z]/g, "");
  if (normalised.includes("part")) return "PART_TIME";
  if (normalised.includes("contract")) return "CONTRACTOR";
  if (normalised.includes("intern")) return "INTERN";
  if (normalised.includes("temp")) return "TEMPORARY";
  return "FULL_TIME";
}

/**
 * A list page, described as a list.
 *
 * Without this a catalogue reads to a crawler as one long page of text. With
 * it, each entry is a named thing at its own URL, which is what lets an
 * assistant answer "what does M.D. Hygiene make?" by naming the products.
 */
export function itemListSchema(
  name: string,
  items: { name: string; url: string }[],
  pageUrl: string
) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: pageUrl,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

/** Marks the contact page as the place to reach the business. */
export function contactPageSchema(siteUrl: string, contact: { phones?: string[]; email?: string } = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${siteUrl}/contact`,
    name: "Contact M.D. Hygiene",
    mainEntity: {
      "@id": `${siteUrl}/#organization`,
      "@type": "Organization",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: contact.phones?.[0],
        email: contact.email,
        areaServed: "IN",
        availableLanguage: ["en", "hi", "gu"],
      },
    },
  };
}

/** Ties the about page to the organization it describes. */
export function aboutPageSchema(siteUrl: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${siteUrl}/about`,
    name: "About M.D. Hygiene",
    description: description || undefined,
    mainEntity: { "@id": `${siteUrl}/#organization` },
  };
}

/**
 * A brand, and the products carried under it.
 *
 * Brand pages carried no structured data at all, which left an assistant asked
 * "what does 7Soft make?" with nothing but prose to parse. `Brand` names the
 * thing and ties it back to the manufacturer; the nested `ItemList` names every
 * product under it at its own URL, so the answer can be specific.
 */
export function brandSchema(
  brand: { name: string; slug: string; tagline: string | null; logo_url: string | null },
  products: { name: string; slug: string }[],
  siteUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Brand",
    "@id": `${siteUrl}/brands/${brand.slug}#brand`,
    name: brand.name,
    description: brand.tagline ?? undefined,
    logo: brand.logo_url ?? undefined,
    url: `${siteUrl}/brands/${brand.slug}`,
    manufacturer: { "@id": `${siteUrl}/#organization` },
    hasPart: products.length
      ? products.map((product) => ({
          "@type": "Product",
          name: product.name,
          url: `${siteUrl}/products/${product.slug}`,
          brand: { "@id": `${siteUrl}/brands/${brand.slug}#brand` },
        }))
      : undefined,
  };
}
