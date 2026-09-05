import type { Tables } from "@/lib/database.types";

export type Brand = Tables<"brands">;
export type Category = Tables<"product_categories">;
export type ProductVariant = Tables<"product_variants">;
export type HeroSlide = Tables<"hero_slides">;
export type Inquiry = Tables<"distributor_inquiries">;

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
