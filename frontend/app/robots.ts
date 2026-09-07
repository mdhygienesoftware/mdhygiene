import type { MetadataRoute } from "next";
import { getSeoAi, getSeoGeneral, getSeoRobots, resolveSiteUrl } from "@/lib/seo";

/** Crawlers used by generative engines, gated by the AI toggle in admin. */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "meta-externalagent",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [general, settings, ai] = await Promise.all([getSeoGeneral(), getSeoRobots(), getSeoAi()]);
  const base = resolveSiteUrl(general.canonical_domain);
  const disallow = settings.disallow_paths?.length ? settings.disallow_paths : ["/admin"];

  if (!settings.allow_indexing) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...AI_CRAWLERS.map((userAgent) =>
        ai.allow_ai_crawlers
          ? { userAgent, allow: "/", disallow }
          : { userAgent, disallow: "/" }
      ),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
