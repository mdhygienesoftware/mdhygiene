import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { SeoAi, SeoAnalytics, SeoGeneral, SeoLocal, SeoRobots } from "@/lib/types";

/** Reads one SEO settings block, falling back to `fallback` when unset. */
const getSeoSetting = cache(async <T,>(key: string, fallback: T): Promise<T> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("seo_settings").select("value").eq("key", key).maybeSingle();
  return ((data?.value as T) ?? fallback);
});

export const getSeoGeneral = () =>
  getSeoSetting<SeoGeneral>("general", {
    site_name: "M.D. Hygiene Private Limited",
    title_template: "%s | M.D. Hygiene",
    default_title: "M.D. Hygiene — Sanitary Napkin & Baby Diaper Manufacturer",
    default_description: "",
    canonical_domain: "",
    default_og_image: "",
    keywords: [],
  });

export const getSeoLocal = () =>
  getSeoSetting<SeoLocal>("local", {
    business_name: "M.D. Hygiene Private Limited",
    founded_year: "2016",
    factory: { label: "", street: "", city: "", state: "", postal_code: "", country: "IN", latitude: "", longitude: "" },
    corporate: { label: "", street: "", city: "", state: "", postal_code: "", country: "IN", latitude: "", longitude: "" },
    opening_hours: "",
    service_areas: [],
    export_markets: [],
    google_maps_url: "",
  });

export const getSeoAi = () =>
  getSeoSetting<SeoAi>("ai", { allow_ai_crawlers: true, summary: "", key_facts: [], faqs: [] });

export const getSeoAnalytics = () =>
  getSeoSetting<SeoAnalytics>("analytics", {
    ga_measurement_id: "",
    gtm_id: "",
    google_site_verification: "",
    bing_site_verification: "",
  });

export const getSeoRobots = () =>
  getSeoSetting<SeoRobots>("robots", { allow_indexing: true, disallow_paths: ["/admin"], extra_rules: "" });

/**
 * The public origin, used for canonical URLs, sitemap entries and absolute
 * OG image URLs. Admin-configured domain wins; otherwise fall back to the
 * deployment URL so it is still correct on Vercel previews.
 */
export function resolveSiteUrl(canonicalDomain: string): string {
  const candidate =
    canonicalDomain?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";
  const withScheme = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
  return withScheme.replace(/\/+$/, "");
}
