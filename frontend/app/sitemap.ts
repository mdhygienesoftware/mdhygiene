import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSeoGeneral, resolveSiteUrl } from "@/lib/seo";

/** Generated from live data, so new products appear without a redeploy. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const general = await getSeoGeneral();
  const base = resolveSiteUrl(general.canonical_domain);
  const supabase = await createClient();

  const [{ data: products }, { data: brands }] = await Promise.all([
    supabase.from("products").select("slug, created_at").eq("is_active", true),
    supabase.from("brands").select("slug, created_at"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.8 },
  ];

  return [
    ...staticRoutes,
    ...(brands ?? []).map((b) => ({
      url: `${base}/brands/${b.slug}`,
      lastModified: b.created_at ? new Date(b.created_at) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...(products ?? []).map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.created_at ? new Date(p.created_at) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
