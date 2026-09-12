"use client";

import { FormEvent, useState } from "react";
import { updateSiteSettingAction } from "@/lib/admin-actions";
import type { SiteVideos, VideoBlock } from "@/lib/types";
import { youTubeId } from "@/lib/video";
import { isRedirectError } from "@/lib/is-redirect";

/**
 * The two video bands — homepage and About — saved together under one settings
 * key but edited separately, so the two pages can show different videos.
 */
export default function VideosForm({ videos }: { videos: SiteVideos }) {
  const [homeUrl, setHomeUrl] = useState(videos.home.url);
  const [aboutUrl, setAboutUrl] = useState(videos.about.url);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const f = new FormData(e.currentTarget);
    const read = (page: "home" | "about"): VideoBlock => ({
      url: String(f.get(`${page}_url`) ?? "").trim(),
      eyebrow: String(f.get(`${page}_eyebrow`) ?? "").trim(),
      heading: String(f.get(`${page}_heading`) ?? "").trim(),
      caption: String(f.get(`${page}_caption`) ?? "").trim(),
      is_active: f.get(`${page}_is_active`) === "on",
    });

    try {
      const result = await updateSiteSettingAction("videos", { home: read("home"), about: read("about") });
      if (result.ok) {
        setSaved(true);
      } else {
        setError(result.error ?? "Failed to save.");
      }
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError(err instanceof Error ? err.message : "Couldn't save. Check your connection and try again.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      <VideoFields
        page="home"
        label="Homepage video"
        where="Shows on the homepage, just above Our Brands."
        initial={videos.home}
        url={homeUrl}
        onUrl={setHomeUrl}
      />
      <VideoFields
        page="about"
        label="About page video"
        where="Shows on the About page, just above Certifications."
        initial={videos.about}
        url={aboutUrl}
        onUrl={setAboutUrl}
      />

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="self-start bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save videos"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Saved ✓</span>}
      </div>
    </form>
  );
}

function VideoFields({
  page,
  label,
  where,
  initial,
  url,
  onUrl,
}: {
  page: "home" | "about";
  label: string;
  where: string;
  initial: VideoBlock;
  url: string;
  onUrl: (value: string) => void;
}) {
  const id = youTubeId(url);

  return (
    <section className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-extrabold text-navy">{label}</h2>
        <p className="text-sm text-muted-2">{where}</p>
      </div>

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
            That isn&apos;t a YouTube link we can read. Copy the address from the video&apos;s page or its
            Share button.
          </p>
        ))}

      <Field label="Eyebrow (small pink line above the heading)" name={`${page}_eyebrow`} defaultValue={initial.eyebrow} />
      <Field label="Heading" name={`${page}_heading`} defaultValue={initial.heading} />
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        Caption
        <textarea
          name={`${page}_caption`}
          defaultValue={initial.caption}
          rows={2}
          className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal resize-none"
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-semibold text-navy">
        <input type="checkbox" name={`${page}_is_active`} defaultChecked={initial.is_active} /> Show this
        video on the site
      </label>
    </section>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
      {label}
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal"
      />
    </label>
  );
}
