import type { Tables } from "@/lib/database.types";

export type Brand = Tables<"brands">;
export type Category = Tables<"product_categories">;
export type ProductVariant = Tables<"product_variants">;
export type HeroSlide = Tables<"hero_slides">;
export type Inquiry = Tables<"distributor_inquiries">;
export type TeamMember = Tables<"team_members">;

export type Product = Tables<"products"> & {
  brand: Brand | null;
  category: Category | null;
  variants: ProductVariant[];
};

export interface CompanyStats {
  years_in_market: string;
  distributors: string;
  employees: string;
  reach: string;
}

export interface ContactInfo {
  phones: string[];
  email: string;
  website: string;
  factory_address: string;
  corporate_address: string;
}

export interface AboutContent {
  heading: string;
  body: string;
  mission: string;
}

export interface VideoBlock {
  url: string;
  eyebrow: string;
  heading: string;
  caption: string;
  is_active: boolean;
}

/** One video per page, so the two can differ. */
export interface SiteVideos {
  home: VideoBlock;
  about: VideoBlock;
}

export interface JobOpening {
  /** Stable id so a listing can be linked to and applied for by name. */
  id: string;
  title: string;
  location: string;
  /** "Full-time", "Contract", "Internship" — free text, set in admin. */
  employment_type: string;
  experience: string;
  description: string;
  is_open: boolean;
}

export interface CareersContent {
  eyebrow: string;
  heading: string;
  body: string;
  cta_label: string;
  perks: string[];
  openings: JobOpening[];
  closing_note: string;
}

export const INQUIRY_TYPES = [
  { value: "distribution", label: "Distribution" },
  { value: "private_label", label: "Private Label / OEM" },
  { value: "government_tender", label: "Government / Tender" },
  { value: "general", label: "General enquiry" },
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number]["value"];

export const CATALOG_TYPES = [
  { value: "own_brand", label: "Our Brands" },
  { value: "oem", label: "OEM / Private Label" },
] as const;

export type CatalogType = (typeof CATALOG_TYPES)[number]["value"];

export const catalogTypeLabel = (value: string) =>
  CATALOG_TYPES.find((t) => t.value === value)?.label ?? value;

// ---------- SEO & GEO ----------

export interface SeoGeneral {
  site_name: string;
  title_template: string;
  default_title: string;
  default_description: string;
  canonical_domain: string;
  default_og_image: string;
  keywords: string[];
}

export interface SeoAddress {
  label: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: string;
  longitude: string;
}

export interface SeoLocal {
  business_name: string;
  founded_year: string;
  factory: SeoAddress;
  corporate: SeoAddress;
  opening_hours: string;
  service_areas: string[];
  export_markets: string[];
  google_maps_url: string;
}

export interface SeoFaq {
  question: string;
  answer: string;
}

export interface SeoAi {
  allow_ai_crawlers: boolean;
  summary: string;
  key_facts: string[];
  faqs: SeoFaq[];
}

export interface SeoAnalytics {
  ga_measurement_id: string;
  gtm_id: string;
  google_site_verification: string;
  bing_site_verification: string;
}

export interface SeoRobots {
  allow_indexing: boolean;
  disallow_paths: string[];
  extra_rules: string;
}
