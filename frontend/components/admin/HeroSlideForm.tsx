"use client";

import { FormEvent, useState } from "react";
import { saveHeroSlideAction } from "@/lib/admin-actions";
import MediaUploader from "@/components/admin/MediaUploader";
import type { HeroSlide } from "@/lib/types";

export default function HeroSlideForm({ slide }: { slide?: HeroSlide }) {
  const [mediaType, setMediaType] = useState(slide?.media_type ?? "image");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await saveHeroSlideAction(slide?.id ?? null, new FormData(e.currentTarget));
    if (result && !result.ok) {
      setError(result.error ?? "Failed to save.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-4 max-w-xl">
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        Media type
        <select name="media_type" value={mediaType} onChange={(e) => setMediaType(e.target.value)} className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal">
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </label>
      <MediaUploader
        label={mediaType === "video" ? "Hero video" : "Hero image"}
        name="media_url"
        defaultValue={slide?.media_url}
        accept={mediaType === "video" ? "video/*" : "image/*"}
        kind={mediaType === "video" ? "video" : "image"}
      />
      {mediaType === "video" && <MediaUploader label="Poster image (shown while video loads)" name="poster_url" defaultValue={slide?.poster_url} />}
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
      <div className="grid md:grid-cols-2 gap-4 items-center">
        <Field label="Sort order" name="sort_order" type="number" defaultValue={String(slide?.sort_order ?? 0)} />
        <label className="flex items-center gap-2 text-sm font-semibold text-navy">
          <input type="checkbox" name="is_active" defaultChecked={slide?.is_active ?? true} /> Active
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
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
