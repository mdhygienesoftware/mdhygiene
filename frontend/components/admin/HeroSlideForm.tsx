"use client";

import { FormEvent, useState } from "react";
import { saveHeroSlideAction } from "@/lib/admin-actions";
import MediaUploader from "@/components/admin/MediaUploader";
import type { HeroSlide } from "@/lib/types";
import SlidePreview from "@/components/admin/SlidePreview";
import { isRedirectError } from "@/lib/is-redirect";

export default function HeroSlideForm({ slide }: { slide?: HeroSlide }) {
  const [mediaType, setMediaType] = useState(slide?.media_type ?? "image");
  const [mobileType, setMobileType] = useState(slide?.mobile_media_type ?? "image");
  // Read straight off the form on every input, so the preview reflects the
  // current values without turning each field into controlled state.
  const [preview, setPreview] = useState<Partial<HeroSlide>>({
    media_url: slide?.media_url ?? "",
    media_type: slide?.media_type ?? "image",
    mobile_media_url: slide?.mobile_media_url ?? "",
    mobile_media_type: slide?.mobile_media_type ?? "image",
    eyebrow: slide?.eyebrow ?? "",
    headline: slide?.headline ?? "",
    subheading: slide?.subheading ?? "",
    cta_label: slide?.cta_label ?? "",
  });

  function syncPreview(form: HTMLFormElement) {
    const f = new FormData(form);
    setPreview({
      media_url: String(f.get("media_url") ?? ""),
      media_type: String(f.get("media_type") ?? "image"),
      mobile_media_url: String(f.get("mobile_media_url") ?? ""),
      mobile_media_type: String(f.get("mobile_media_type") ?? "image"),
      eyebrow: String(f.get("eyebrow") ?? ""),
      headline: String(f.get("headline") ?? ""),
      subheading: String(f.get("subheading") ?? ""),
      cta_label: String(f.get("cta_label") ?? ""),
    });
  }
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await saveHeroSlideAction(slide?.id ?? null, new FormData(e.currentTarget));
      if (result && !result.ok) {
        setError(result.error ?? "Failed to save.");
        setSaving(false);
      }
    } catch (err) {
      // A successful save signals itself by throwing a redirect — let it pass.
      if (isRedirectError(err)) throw err;
      // Anything else (network drop, expired session, a failed media import)
      // must surface, or the button sticks on "Saving…" with no explanation.
      setError(err instanceof Error ? err.message : "Couldn't save. Check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onInput={(e) => syncPreview(e.currentTarget)}
      onChange={(e) => syncPreview(e.currentTarget)}
      className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-4 max-w-xl"
    >
      {/* The two screens are separate sections because they are separate
          pictures: the hero is about 3:1 on a monitor and about 2:3 on a phone,
          so a landscape file loses its sides on a phone and a portrait one
          loses its top and bottom on a monitor. Each section previews the crop
          it will actually produce, beside the picker that sets it. */}
      <fieldset className="border border-border rounded-xl p-5 flex flex-col gap-3.5">
        <legend className="text-sm font-bold text-navy px-2">Computer</legend>
        <p className="text-xs text-muted-2 -mt-1">
          Landscape, 16:9 — 1920 × 1080 is the size to aim for. Used on every screen unless a phone
          picture is set below.
        </p>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          Media
          <select
            name="media_type"
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal"
          >
            <option value="image">Image</option>
            <option value="video">Video (autoplays, muted, looped)</option>
          </select>
        </label>
        <MediaUploader
          label={mediaType === "video" ? "Hero video" : "Hero image"}
          name="media_url"
          defaultValue={slide?.media_url}
          kind={mediaType === "video" ? "video" : "image"}
          onValueChange={(media_url) => setPreview((p) => ({ ...p, media_url }))}
        />
        {mediaType === "video" && (
          <MediaUploader
            label="Poster image (shown while video loads)"
            name="poster_url"
            defaultValue={slide?.poster_url}
          />
        )}
        <SlidePreview slide={preview} />
      </fieldset>

      <fieldset className="border border-border rounded-xl p-5 flex flex-col gap-3.5">
        <legend className="text-sm font-bold text-navy px-2">Phone (optional)</legend>
        <p className="text-xs text-muted-2 -mt-1">
          A portrait crop — ideally 9:16, around 1080 × 1920. Leave it empty and the computer picture is
          used on phones too.
        </p>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          Media
          <select
            name="mobile_media_type"
            value={mobileType}
            onChange={(e) => setMobileType(e.target.value)}
            className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal"
          >
            <option value="image">Image</option>
            <option value="video">Video (autoplays, muted, looped)</option>
          </select>
        </label>
        <MediaUploader
          label={mobileType === "video" ? "Phone video" : "Phone image"}
          name="mobile_media_url"
          defaultValue={slide?.mobile_media_url}
          kind={mobileType === "video" ? "video" : "image"}
          onValueChange={(mobile_media_url) => setPreview((p) => ({ ...p, mobile_media_url }))}
        />
        {mobileType === "video" && (
          <MediaUploader
            label="Phone poster image (shown while video loads)"
            name="mobile_poster_url"
            defaultValue={slide?.mobile_poster_url}
          />
        )}
        <SlidePreview slide={preview} variant="mobile" />
      </fieldset>

      <fieldset className="border border-border rounded-xl p-5 flex flex-col gap-3.5">
        <legend className="text-sm font-bold text-navy px-2">Words and buttons</legend>
        <p className="text-xs text-muted-2 -mt-1">Shared by both screens.</p>
        <Field label="Eyebrow" name="eyebrow" defaultValue={slide?.eyebrow ?? ""} />
        <Field label="Headline" name="headline" defaultValue={slide?.headline} required />
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          Subheading
          <textarea name="subheading" defaultValue={slide?.subheading ?? ""} rows={3} className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal resize-none" />
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="CTA label" name="cta_label" defaultValue={slide?.cta_label ?? ""} />
          <Field label="CTA link" name="cta_href" defaultValue={slide?.cta_href ?? ""} />
        </div>
      </fieldset>

      <div className="grid md:grid-cols-3 gap-4 items-start">
        <Field label="Sort order" name="sort_order" type="number" defaultValue={String(slide?.sort_order ?? 0)} />
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          Display time (seconds)
          <input
            type="number"
            name="duration_seconds"
            min={2}
            max={60}
            defaultValue={String(slide?.duration_seconds ?? 6)}
            className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal"
          />
          <span className="text-xs font-normal text-muted-2">2–60 seconds.</span>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-navy md:pt-8">
          <input type="checkbox" name="is_active" defaultChecked={slide?.is_active ?? true} /> Active
        </label>
      </div>
      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}
      <button type="submit" disabled={saving} className="self-start bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink transition-colors disabled:opacity-60">
        {saving ? "Saving…" : "Save slide"}
      </button>
    </form>
  );
}

function Field({ label, name, defaultValue, type = "text", required = false }: { label: string; name: string; defaultValue?: string; type?: string; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
      {label}
      <input type={type} name={name} defaultValue={defaultValue} required={required} className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal" />
    </label>
  );
}
