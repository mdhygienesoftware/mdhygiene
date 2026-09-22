import { createPublicClient } from "@/lib/supabase/public";
import { getSeoAi, getSeoGeneral, getSeoLocal, resolveSiteUrl } from "@/lib/seo";

// Rendered once and reused for five minutes, rather than rebuilt from scratch
// on every visit. Admin saves call revalidatePath, so an edit is live at once;
// what this changes is every visit in between.
export const revalidate = 300;

/**
 * llms.txt — an emerging convention that gives AI assistants a clean, factual
 * summary of the site instead of leaving them to infer it from marketing copy.
 * Served from live data so it never drifts from the catalog.
 */
export async function GET() {
  const [general, local, ai] = await Promise.all([getSeoGeneral(), getSeoLocal(), getSeoAi()]);

  if (!ai.allow_ai_crawlers) {
    return new Response("# AI crawling is disabled for this site.\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const base = resolveSiteUrl(general.canonical_domain);
  const supabase = createPublicClient();
  const { data: products } = await supabase
    .from("products")
    .select("name, slug, description, brand:brands(name)")
    .eq("is_active", true)
    .order("sort_order");

  const lines: string[] = [
    `# ${local.business_name || general.site_name}`,
    "",
    `> ${ai.summary}`,
    "",
  ];

  if (ai.key_facts?.length) {
    lines.push("## Key facts", "");
    ai.key_facts.forEach((fact) => lines.push(`- ${fact}`));
    lines.push("");
  }

  lines.push("## Locations", "");
  lines.push(
    `- Manufacturing unit: ${[local.factory.street, local.factory.city, local.factory.state, local.factory.postal_code].filter(Boolean).join(", ")}`
  );
  lines.push(
    `- Corporate office: ${[local.corporate.street, local.corporate.city, local.corporate.state, local.corporate.postal_code].filter(Boolean).join(", ")}`
  );
  lines.push("");

  if (local.service_areas?.length) {
    lines.push(`## Areas served`, "", local.service_areas.join(", "), "");
  }
  if (local.export_markets?.length) {
    lines.push(`## Export markets`, "", local.export_markets.join(", "), "");
  }

  if (products?.length) {
    lines.push("## Products", "");
    for (const p of products) {
      const brand = (p as { brand?: { name?: string } | null }).brand?.name;
      lines.push(`- [${p.name}](${base}/products/${p.slug})${brand ? ` — brand: ${brand}` : ""}${p.description ? `. ${p.description}` : ""}`);
    }
    lines.push("");
  }

  if (ai.faqs?.length) {
    lines.push("## Frequently asked questions", "");
    for (const faq of ai.faqs) {
      lines.push(`### ${faq.question}`, "", faq.answer, "");
    }
  }

  lines.push("## Contact", "", `- Website: ${base}`, `- Enquiries: ${base}/contact`, "");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
