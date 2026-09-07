import SeoSettingsForm from "@/components/admin/SeoSettingsForm";
import { getSeoAi, getSeoAnalytics, getSeoGeneral, getSeoLocal, getSeoRobots, resolveSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  const [general, local, ai, analytics, robots] = await Promise.all([
    getSeoGeneral(),
    getSeoLocal(),
    getSeoAi(),
    getSeoAnalytics(),
    getSeoRobots(),
  ]);

  const siteUrl = resolveSiteUrl(general.canonical_domain);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">SEO &amp; GEO</h1>
        <p className="text-sm text-muted-2 mt-1">
          Search-engine settings, local/geographic targeting, and how AI assistants describe your business.
        </p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <span className="font-semibold text-navy">Live files:</span>
        <a className="text-blue font-semibold" href={`${siteUrl}/sitemap.xml`} target="_blank" rel="noreferrer">sitemap.xml →</a>
        <a className="text-blue font-semibold" href={`${siteUrl}/robots.txt`} target="_blank" rel="noreferrer">robots.txt →</a>
        <a className="text-blue font-semibold" href={`${siteUrl}/llms.txt`} target="_blank" rel="noreferrer">llms.txt →</a>
      </div>

      <SeoSettingsForm general={general} local={local} ai={ai} analytics={analytics} robots={robots} />
    </div>
  );
}
