import { createClient } from "@/lib/supabase/server";
import type { AboutContent, Brand, Category, CompanyStats, ContactInfo, HeroSlide, Product } from "@/lib/types";

/** Public content is fetched straight from Supabase with the anon key — RLS
 * (`is_active = true`) is the only filter that matters, so these never throw
 * on a missing/unreachable backend the way the old Express fetch layer did. */

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("brands").select("*").order("sort_order");
  return data ?? [];
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("brands").select("*").eq("slug", slug).maybeSingle();
  return data ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("product_categories").select("*").order("name");
  return data ?? [];
}

export async function getProducts(filter?: {
  brandSlug?: string;
  categorySlug?: string;
  catalogType?: string;
}): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, brand:brands(*), category:product_categories(*), variants:product_variants(*)")
    .eq("is_active", true)
    .order("sort_order");

  if (filter?.catalogType) query = query.eq("catalog_type", filter.catalogType);

  if (filter?.brandSlug) {
    const { data: brand } = await supabase.from("brands").select("id").eq("slug", filter.brandSlug).single();
    if (!brand) return [];
    query = query.eq("brand_id", brand.id);
  }
  if (filter?.categorySlug) {
    const { data: category } = await supabase
      .from("product_categories")
      .select("id")
      .eq("slug", filter.categorySlug)
      .single();
    if (!category) return [];
    query = query.eq("category_id", category.id);
  }

  const { data } = await query;
  return (data as Product[] | null)?.map(sortVariants) ?? [];
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, brand:brands(*), category:product_categories(*), variants:product_variants(*)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("sort_order")
    .limit(limit);
  return (data as Product[] | null)?.map(sortVariants) ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, brand:brands(*), category:product_categories(*), variants:product_variants(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data ? sortVariants(data as Product) : null;
}

function sortVariants(product: Product): Product {
  return { ...product, variants: [...product.variants].sort((a, b) => a.sort_order - b.sort_order) };
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hero_slides")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

async function getSetting<T>(key: string): Promise<T | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
  return (data?.value as T) ?? null;
}

export const getCompanyStats = () => getSetting<CompanyStats>("company_stats");
export const getContactInfo = () => getSetting<ContactInfo>("contact");
export const getAboutContent = () => getSetting<AboutContent>("about");
export const getCertifications = () => getSetting<string[]>("certifications");
export const getFooterTagline = () => getSetting<{ text: string }>("footer_tagline");

/** One member's digital visiting card (the React port of the old PHP cards). */
export async function getTeamMemberBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .eq("slug", slug)
    .eq("card_enabled", true)
    .eq("is_active", true)
    .maybeSingle();
  return data;
}

/** Every member with a live card — used to list and pre-render them. */
export async function getCardMembers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .eq("card_enabled", true)
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

export async function getSocialLinks() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "social_links").maybeSingle();
  return (data?.value ?? {}) as Record<string, string>;
}
