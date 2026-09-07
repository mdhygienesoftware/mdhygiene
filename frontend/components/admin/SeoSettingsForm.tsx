"use client";

import { FormEvent, useState } from "react";
import { updateSeoSettingAction } from "@/lib/admin-actions";
import type { SeoAi, SeoAddress, SeoAnalytics, SeoGeneral, SeoLocal, SeoRobots } from "@/lib/types";

const lines = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

export default function SeoSettingsForm({
  general,
  local,
  ai,
  analytics,
  robots,
}: {
  general: SeoGeneral;
  local: SeoLocal;
  ai: SeoAi;
  analytics: SeoAnalytics;
  robots: SeoRobots;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Section
        title="General"
        hint="Titles and descriptions shown in Google results and link previews."
        settingKey="general"
        build={(f) => ({
          site_name: String(f.get("site_name") ?? ""),
          title_template: String(f.get("title_template") ?? ""),
          default_title: String(f.get("default_title") ?? ""),
          default_description: String(f.get("default_description") ?? ""),
          canonical_domain: String(f.get("canonical_domain") ?? "").trim(),
          default_og_image: String(f.get("default_og_image") ?? "").trim(),
          keywords: lines(String(f.get("keywords") ?? "")),
        })}
      >
        <Text label="Site name" name="site_name" defaultValue={general.site_name} />
        <Text
          label="Canonical domain"
          name="canonical_domain"
          defaultValue={general.canonical_domain}
          placeholder="https://mdhygiene.in"
          hint="Your live domain. Used for canonical URLs and the sitemap — set this before launch."
        />
        <Text label="Title template" name="title_template" defaultValue={general.title_template} hint="%s is replaced by the page title." />
        <Text label="Homepage title" name="default_title" defaultValue={general.default_title} hint="Aim for under 60 characters." />
        <Area label="Default description" name="default_description" defaultValue={general.default_description} rows={3} hint="Aim for 150-160 characters." />
        <Text label="Default share image (OG)" name="default_og_image" defaultValue={general.default_og_image} />
        <Area label="Target keywords (one per line)" name="keywords" defaultValue={(general.keywords ?? []).join("\n")} rows={4} />
      </Section>

      <Section
        title="Local / GEO targeting"
        hint="Powers LocalBusiness data for &ldquo;manufacturer near me&rdquo; and map results."
        settingKey="local"
        build={(f) => ({
          business_name: String(f.get("business_name") ?? ""),
          founded_year: String(f.get("founded_year") ?? ""),
          factory: address(f, "factory"),
          corporate: address(f, "corporate"),
          opening_hours: String(f.get("opening_hours") ?? ""),
          service_areas: lines(String(f.get("service_areas") ?? "")),
          export_markets: lines(String(f.get("export_markets") ?? "")),
          google_maps_url: String(f.get("google_maps_url") ?? "").trim(),
        })}
      >
        <Text label="Business name" name="business_name" defaultValue={local.business_name} />
        <Text label="Founded year" name="founded_year" defaultValue={local.founded_year} />
        <AddressFields prefix="factory" title="Manufacturing unit" value={local.factory} />
        <AddressFields prefix="corporate" title="Corporate office" value={local.corporate} />
        <Text label="Opening hours" name="opening_hours" defaultValue={local.opening_hours} hint="Schema format, e.g. Mo-Sa 09:00-18:00" />
        <Text label="Google Maps link" name="google_maps_url" defaultValue={local.google_maps_url} />
        <Area label="Service areas (one per line)" name="service_areas" defaultValue={(local.service_areas ?? []).join("\n")} rows={4} />
        <Area label="Export markets (one per line)" name="export_markets" defaultValue={(local.export_markets ?? []).join("\n")} rows={3} />
      </Section>

      <Section
        title="AI / Generative engines"
        hint="What ChatGPT, Perplexity, Claude and Google AI Overviews read when describing you. Served at /llms.txt and as FAQ schema."
        settingKey="ai"
        build={(f) => ({
          allow_ai_crawlers: f.get("allow_ai_crawlers") === "on",
          summary: String(f.get("summary") ?? ""),
          key_facts: lines(String(f.get("key_facts") ?? "")),
          faqs: parseFaqs(String(f.get("faqs") ?? "")),
        })}
      >
        <Check label="Allow AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)" name="allow_ai_crawlers" defaultChecked={ai.allow_ai_crawlers} />
        <Area label="Business summary" name="summary" defaultValue={ai.summary} rows={4} hint="One factual paragraph. Keep it accurate — this is what gets quoted." />
        <Area label="Key facts (one per line)" name="key_facts" defaultValue={(ai.key_facts ?? []).join("\n")} rows={7} />
        <Area
          label="FAQs"
          name="faqs"
          defaultValue={(ai.faqs ?? []).map((f) => `${f.question}\n${f.answer}`).join("\n\n")}
          rows={12}
          hint="Question on one line, answer on the next. Separate each pair with a blank line."
        />
      </Section>

      <Section
        title="Analytics & verification"
        hint="Paste IDs from Google Analytics and Search Console."
        settingKey="analytics"
        build={(f) => ({
          ga_measurement_id: String(f.get("ga_measurement_id") ?? "").trim(),
          gtm_id: String(f.get("gtm_id") ?? "").trim(),
          google_site_verification: String(f.get("google_site_verification") ?? "").trim(),
          bing_site_verification: String(f.get("bing_site_verification") ?? "").trim(),
        })}
      >
        <Text label="Google Analytics ID" name="ga_measurement_id" defaultValue={analytics.ga_measurement_id} placeholder="G-XXXXXXXXXX" />
        <Text label="Google Tag Manager ID" name="gtm_id" defaultValue={analytics.gtm_id} placeholder="GTM-XXXXXXX" hint="If set, GTM loads instead of GA directly." />
        <Text label="Search Console verification" name="google_site_verification" defaultValue={analytics.google_site_verification} />
        <Text label="Bing verification" name="bing_site_verification" defaultValue={analytics.bing_site_verification} />
      </Section>

      <Section
        title="Indexing / robots.txt"
        hint="Controls what search engines are allowed to crawl."
        settingKey="robots"
        build={(f) => ({
          allow_indexing: f.get("allow_indexing") === "on",
          disallow_paths: lines(String(f.get("disallow_paths") ?? "")),
          extra_rules: String(f.get("extra_rules") ?? ""),
        })}
      >
        <Check label="Allow search engines to index this site" name="allow_indexing" defaultChecked={robots.allow_indexing} />
        <p className="text-xs text-muted-2 -mt-1">Turn this off only for a staging site — unchecking it removes you from Google.</p>
        <Area label="Disallowed paths (one per line)" name="disallow_paths" defaultValue={(robots.disallow_paths ?? []).join("\n")} rows={3} />
      </Section>
    </div>
  );
}

function address(f: FormData, prefix: string): SeoAddress {
  const get = (k: string) => String(f.get(`${prefix}_${k}`) ?? "").trim();
  return {
    label: get("label"),
    street: get("street"),
    city: get("city"),
    state: get("state"),
    postal_code: get("postal_code"),
    country: get("country") || "IN",
    latitude: get("latitude"),
    longitude: get("longitude"),
  };
}

/** "Question\nAnswer" pairs separated by blank lines. */
function parseFaqs(raw: string) {
  return raw
    .split(/\n\s*\n/)
    .map((block) => block.split("\n").map((s) => s.trim()).filter(Boolean))
    .filter((parts) => parts.length >= 2)
    .map((parts) => ({ question: parts[0], answer: parts.slice(1).join(" ") }));
}

function Section({
  title,
  hint,
  settingKey,
  build,
  children,
}: {
  title: string;
  hint: string;
  settingKey: string;
  build: (f: FormData) => unknown;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("saving");
    setMessage(null);
    const result = await updateSeoSettingAction(settingKey, build(new FormData(e.currentTarget)));
    if (result?.ok) {
      setState("saved");
      setTimeout(() => setState("idle"), 2500);
    } else {
      setState("error");
      setMessage(result?.error ?? "Failed to save.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-extrabold text-navy">{title}</h2>
        <p className="text-sm text-muted-2 mt-0.5">{hint}</p>
      </div>
      {children}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={state === "saving"}
          className="self-start bg-navy text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-pink transition-colors disabled:opacity-60"
        >
          {state === "saving" ? "Saving…" : "Save"}
        </button>
        {state === "saved" && <span className="text-sm font-semibold text-green-700">Saved ✓</span>}
        {state === "error" && <span className="text-sm font-semibold text-red-600">{message}</span>}
      </div>
    </form>
  );
}

function AddressFields({ prefix, title, value }: { prefix: string; title: string; value: SeoAddress }) {
  return (
    <fieldset className="border border-border rounded-xl p-4 flex flex-col gap-3">
      <legend className="text-sm font-bold text-navy px-2">{title}</legend>
      <Text label="Label" name={`${prefix}_label`} defaultValue={value.label} />
      <Text label="Street" name={`${prefix}_street`} defaultValue={value.street} />
      <div className="grid md:grid-cols-3 gap-3">
        <Text label="City" name={`${prefix}_city`} defaultValue={value.city} />
        <Text label="State" name={`${prefix}_state`} defaultValue={value.state} />
        <Text label="PIN code" name={`${prefix}_postal_code`} defaultValue={value.postal_code} />
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <Text label="Country code" name={`${prefix}_country`} defaultValue={value.country} />
        <Text label="Latitude" name={`${prefix}_latitude`} defaultValue={value.latitude} placeholder="21.1702" />
        <Text label="Longitude" name={`${prefix}_longitude`} defaultValue={value.longitude} placeholder="72.8311" />
      </div>
      <p className="text-xs text-muted-2">
        Coordinates are optional but improve map results. Get them by right-clicking your location in Google Maps.
        Leave blank rather than guessing — wrong coordinates hurt local ranking.
      </p>
    </fieldset>
  );
}

function Text({
  label,
  name,
  defaultValue,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
      {label}
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal"
      />
      {hint && <span className="text-xs font-normal text-muted-2">{hint}</span>}
    </label>
  );
}

function Area({
  label,
  name,
  defaultValue,
  rows = 3,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={rows}
        className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal"
      />
      {hint && <span className="text-xs font-normal text-muted-2">{hint}</span>}
    </label>
  );
}

function Check({ label, name, defaultChecked }: { label: string; name: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2.5 text-sm font-semibold text-navy">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="w-4 h-4" />
      {label}
    </label>
  );
}
