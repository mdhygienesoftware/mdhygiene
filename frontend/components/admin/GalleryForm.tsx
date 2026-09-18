"use client";

import { FormEvent, useState } from "react";
import { updateSiteSettingAction } from "@/lib/admin-actions";
import MediaUploader from "@/components/admin/MediaUploader";
import DeleteButton from "@/components/admin/DeleteButton";
import type { GalleryBlock, GalleryImage, SiteGalleries } from "@/lib/types";
import { isRedirectError } from "@/lib/is-redirect";

/**
 * The two carousels — homepage and About — saved together under one settings
 * key but edited separately, so the two pages can show different images.
 */
export default function GalleryForm({ galleries }: { galleries: SiteGalleries }) {
  const [home, setHome] = useState<GalleryImage[]>(galleries.home.images);
  const [about, setAbout] = useState<GalleryImage[]>(galleries.about.images);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const f = new FormData(e.currentTarget);
    const read = (page: "home" | "about", images: GalleryImage[]): GalleryBlock => ({
      eyebrow: String(f.get(`${page}_eyebrow`) ?? "").trim(),
      heading: String(f.get(`${page}_heading`) ?? "").trim(),
      caption: String(f.get(`${page}_caption`) ?? "").trim(),
      is_active: f.get(`${page}_is_active`) === "on",
      // A row someone added and left empty is not published.
      images: images.filter((image) => image.url.trim()),
    });

    const value = { home: read("home", home), about: read("about", about) };
    try {
      const result = await updateSiteSettingAction("galleries", value);
      if (result.ok) {
        setHome(value.home.images);
        setAbout(value.about.images);
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
      <GalleryFields
        page="home"
        label="Homepage carousel"
        where="Shows on the homepage, between Our Brands and Featured products."
        initial={galleries.home}
        images={home}
        onImages={setHome}
        onDirty={() => setSaved(false)}
      />
      <GalleryFields
        page="about"
        label="About page carousel"
        where="Shows on the About page, above Certifications."
        initial={galleries.about}
        images={about}
        onImages={setAbout}
        onDirty={() => setSaved(false)}
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
          {saving ? "Saving…" : "Save carousels"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Saved ✓</span>}
      </div>
    </form>
  );
}

function GalleryFields({
  page,
  label,
  where,
  initial,
  images,
  onImages,
  onDirty,
}: {
  page: "home" | "about";
  label: string;
  where: string;
  initial: GalleryBlock;
  images: GalleryImage[];
  onImages: (images: GalleryImage[]) => void;
  onDirty: () => void;
}) {
  function patch(index: number, changes: Partial<GalleryImage>) {
    onImages(images.map((image, i) => (i === index ? { ...image, ...changes } : image)));
    onDirty();
  }

  function move(index: number, delta: number) {
    const to = index + delta;
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    [next[index], next[to]] = [next[to], next[index]];
    onImages(next);
    onDirty();
  }

  return (
    <section className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-extrabold text-navy">{label}</h2>
        <p className="text-sm text-muted-2">{where}</p>
      </div>

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

      <div className="flex items-center justify-between gap-4 pt-1">
        <span className="text-sm font-bold text-navy">
          Images {images.length > 0 && <span className="font-normal text-muted-2">({images.length})</span>}
        </span>
        <button
          type="button"
          onClick={() => {
            onImages([...images, { url: "", alt: "" }]);
            onDirty();
          }}
          className="text-sm font-semibold text-blue"
        >
          + Add image
        </button>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-muted-2">
          No images yet. The carousel stays hidden until at least one is added.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {images.map((image, i) => (
            <div key={`${page}-${i}`} className="border border-border rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold tracking-[0.1em] text-muted">IMAGE {i + 1}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="text-sm font-semibold text-blue disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    className="text-sm font-semibold text-blue disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <DeleteButton
                    label="Remove"
                    what={image.alt || `image ${i + 1}`}
                    action={() => {
                      onImages(images.filter((_, index) => index !== i));
                      onDirty();
                    }}
                  />
                </div>
              </div>

              <MediaUploader
                label="Picture"
                name={`${page}_image_${i}`}
                defaultValue={image.url}
                onValueChange={(url) => patch(i, { url })}
              />

              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
                Description
                <input
                  type="text"
                  value={image.alt}
                  onChange={(e) => patch(i, { alt: e.target.value })}
                  placeholder="What the picture shows — read aloud by screen readers"
                  className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal"
                />
              </label>
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 text-sm font-semibold text-navy pt-1">
        <input type="checkbox" name={`${page}_is_active`} defaultChecked={initial.is_active} /> Show this
        carousel on the site
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
