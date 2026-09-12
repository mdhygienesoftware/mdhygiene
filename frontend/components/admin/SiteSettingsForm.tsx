"use client";

import { FormEvent, useState } from "react";
import { updateSiteSettingAction } from "@/lib/admin-actions";
import type { AboutContent, CompanyStats, ContactInfo, SiteVideos } from "@/lib/types";
import { youTubeId } from "@/lib/video";

function SaveButton({ saving }: { saving: boolean }) {
  return (
    <button type="submit" disabled={saving} className="self-start bg-navy text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-pink transition-colors disabled:opacity-60">
      {saving ? "Saving…" : "Save"}
    </button>
  );
}

export default function SiteSettingsForm({
  stats,
  contact,
  about,
  certifications,
  footerTagline,
  videos,
}: {
  stats: CompanyStats | null;
  contact: ContactInfo | null;
  about: AboutContent | null;
  certifications: string[] | null;
  footerTagline: string;
  videos: SiteVideos;
}) {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <StatsBlock initial={stats} />
      <ContactBlock initial={contact} />
      <AboutBlock initial={about} />
      <VideosBlock initial={videos} />
      <CertificationsBlock initial={certifications ?? []} />
      <FooterBlock initial={footerTagline} />
    </div>
  );
}

function useSaveState() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setSaving(true);
    setSaved(false);
    setError(null);
    const result = await fn();
    setSaving(false);
    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError(result.error ?? "Failed to save.");
    }
  }
  return { saving, saved, error, run };
}

function StatsBlock({ initial }: { initial: CompanyStats | null }) {
  const { saving, saved, error, run } = useSaveState();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() =>
          updateSiteSettingAction("company_stats", {
            years_in_market: f.get("years_in_market"),
            distributors: f.get("distributors"),
            employees: f.get("employees"),
            reach: f.get("reach"),
          })
        );
      }}
      className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4"
    >
      <h2 className="text-lg font-extrabold text-navy">Homepage stats</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Years in market" name="years_in_market" defaultValue={initial?.years_in_market} />
        <Field label="Distributors" name="distributors" defaultValue={initial?.distributors} />
        <Field label="Employees" name="employees" defaultValue={initial?.employees} />
        <Field label="Reach" name="reach" defaultValue={initial?.reach} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <SaveButton saving={saving} />
        {saved && <span className="text-sm text-emerald-600">Saved ✓</span>}
      </div>
    </form>
  );
}

function ContactBlock({ initial }: { initial: ContactInfo | null }) {
  const { saving, saved, error, run } = useSaveState();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() =>
          updateSiteSettingAction("contact", {
            phones: String(f.get("phones") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
            email: f.get("email"),
            website: f.get("website"),
            factory_address: f.get("factory_address"),
            corporate_address: f.get("corporate_address"),
          })
        );
      }}
      className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4"
    >
      <h2 className="text-lg font-extrabold text-navy">Contact details</h2>
      <Field label="Phones (comma-separated)" name="phones" defaultValue={initial?.phones?.join(", ")} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email" name="email" defaultValue={initial?.email} />
        <Field label="Website" name="website" defaultValue={initial?.website} />
      </div>
      <TextArea label="Factory address" name="factory_address" defaultValue={initial?.factory_address} />
      <TextArea label="Corporate office address" name="corporate_address" defaultValue={initial?.corporate_address} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <SaveButton saving={saving} />
        {saved && <span className="text-sm text-emerald-600">Saved ✓</span>}
      </div>
    </form>
  );
}

function AboutBlock({ initial }: { initial: AboutContent | null }) {
  const { saving, saved, error, run } = useSaveState();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() => updateSiteSettingAction("about", { heading: f.get("heading"), body: f.get("body"), mission: f.get("mission") }));
      }}
      className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4"
    >
      <h2 className="text-lg font-extrabold text-navy">About page</h2>
      <Field label="Heading" name="heading" defaultValue={initial?.heading} />
      <TextArea label="Body" name="body" defaultValue={initial?.body} rows={6} />
      <TextArea label="Mission statement" name="mission" defaultValue={initial?.mission} rows={2} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <SaveButton saving={saving} />
        {saved && <span className="text-sm text-emerald-600">Saved ✓</span>}
      </div>
    </form>
  );
}

/**
 * The two video bands, saved together under one settings key but edited
 * separately — the homepage and About page are meant to be able to show
 * different videos.
 */
function VideosBlock({ initial }: { initial: SiteVideos }) {
  const { saving, saved, error, run } = useSaveState();
  const [homeUrl, setHomeUrl] = useState(initial.home.url);
  const [aboutUrl, setAboutUrl] = useState(initial.about.url);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const read = (page: "home" | "about") => ({
          url: String(f.get(`${page}_url`) ?? "").trim(),
          eyebrow: String(f.get(`${page}_eyebrow`) ?? "").trim(),
          heading: String(f.get(`${page}_heading`) ?? "").trim(),
          caption: String(f.get(`${page}_caption`) ?? "").trim(),
          is_active: f.get(`${page}_is_active`) === "on",
        });
        run(() => updateSiteSettingAction("videos", { home: read("home"), about: read("about") }));
      }}
      className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-extrabold text-navy">Videos</h2>
        <p className="text-sm text-muted-2">
          One video band on the homepage (above Our Brands) and one on the About page (above
          Certifications). They are separate — leave either switched off to hide it.
        </p>
      </div>

      <VideoFields page="home" label="Homepage video" initial={initial.home} url={homeUrl} onUrl={setHomeUrl} />
      <VideoFields page="about" label="About page video" initial={initial.about} url={aboutUrl} onUrl={setAboutUrl} />

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <SaveButton saving={saving} />
        {saved && <span className="text-sm text-emerald-600">Saved ✓</span>}
      </div>
    </form>
  );
}

function VideoFields({
  page,
  label,
  initial,
  url,
  onUrl,
}: {
  page: "home" | "about";
  label: string;
  initial: SiteVideos["home"];
  url: string;
  onUrl: (value: string) => void;
}) {
  const id = youTubeId(url);

  return (
    <fieldset className="border border-border rounded-xl p-5 flex flex-col gap-3.5">
      <legend className="text-sm font-bold text-navy px-2">{label}</legend>

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        YouTube link
        <input
          type="text"
          name={`${page}_url`}
          value={url}
          onChange={(e) => onUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal"
        />
        <span className="text-xs font-normal text-muted-2">
          Any YouTube address works — watch, youtu.be, Shorts or embed.
        </span>
      </label>

      {url.trim() &&
        (id ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-navy">Preview</span>
            <div className="relative w-full max-w-sm aspect-video overflow-hidden rounded-lg border border-border bg-navy">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
                title={`${label} preview`}
                loading="lazy"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        ) : (
          <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            That isn&apos;t a YouTube link we can read. Copy the address from the video&apos;s page or
            its Share button.
          </p>
        ))}

      <Field label="Eyebrow (small pink line above)" name={`${page}_eyebrow`} defaultValue={initial.eyebrow} />
      <Field label="Heading" name={`${page}_heading`} defaultValue={initial.heading} />
      <TextArea label="Caption" name={`${page}_caption`} defaultValue={initial.caption} rows={2} />
      <label className="flex items-center gap-2 text-sm font-semibold text-navy">
        <input type="checkbox" name={`${page}_is_active`} defaultChecked={initial.is_active} /> Show this
        video on the site
      </label>
    </fieldset>
  );
}

function CertificationsBlock({ initial }: { initial: string[] }) {
  const { saving, saved, error, run } = useSaveState();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() =>
          updateSiteSettingAction(
            "certifications",
            String(f.get("certifications") ?? "").split("\n").map((s) => s.trim()).filter(Boolean)
          )
        );
      }}
      className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4"
    >
      <h2 className="text-lg font-extrabold text-navy">Certifications on the homepage (one per line)</h2>
      <p className="text-sm text-muted-2 -mt-2">
        Which badges show in the homepage band — keep it to three or four. Every certification we hold
        is listed in full on the <span className="font-semibold">/certifications</span> page regardless
        of what is here.
      </p>
      <TextArea label="" name="certifications" defaultValue={initial.join("\n")} rows={5} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <SaveButton saving={saving} />
        {saved && <span className="text-sm text-emerald-600">Saved ✓</span>}
      </div>
    </form>
  );
}

function FooterBlock({ initial }: { initial: string }) {
  const { saving, saved, error, run } = useSaveState();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() => updateSiteSettingAction("footer_tagline", { text: f.get("text") }));
      }}
      className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4"
    >
      <h2 className="text-lg font-extrabold text-navy">Footer tagline</h2>
      <Field label="" name="text" defaultValue={initial} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <SaveButton saving={saving} />
        {saved && <span className="text-sm text-emerald-600">Saved ✓</span>}
      </div>
    </form>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
      {label}
      <input type="text" name={name} defaultValue={defaultValue} className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal" />
    </label>
  );
}

function TextArea({ label, name, defaultValue, rows = 3 }: { label: string; name: string; defaultValue?: string; rows?: number }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
      {label}
      <textarea name={name} defaultValue={defaultValue} rows={rows} className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal resize-none" />
    </label>
  );
}
