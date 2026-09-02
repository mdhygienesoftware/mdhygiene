"use client";

import { FormEvent, useState } from "react";
import { saveBrandAction } from "@/lib/admin-actions";
import MediaUploader from "@/components/admin/MediaUploader";
import type { Brand } from "@/lib/types";

export default function BrandForm({ brand }: { brand?: Brand }) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await saveBrandAction(brand?.id ?? null, new FormData(e.currentTarget));
    if (result && !result.ok) {
      setError(result.error ?? "Failed to save.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-4 max-w-xl">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Name" name="name" defaultValue={brand?.name} required />
        <Field label="Slug" name="slug" defaultValue={brand?.slug} required />
      </div>
      <Field label="Tagline" name="tagline" defaultValue={brand?.tagline ?? ""} />
      <MediaUploader label="Logo" name="logo_url" defaultValue={brand?.logo_url} />
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Accent color (hex)" name="accent_color" defaultValue={brand?.accent_color ?? "#1E62B0"} />
        <Field label="Sort order" name="sort_order" type="number" defaultValue={String(brand?.sort_order ?? 0)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={saving} className="self-start bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink transition-colors disabled:opacity-60">
        {saving ? "Saving…" : "Save brand"}
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
