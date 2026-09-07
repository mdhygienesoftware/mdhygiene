"use client";

import { FormEvent, useState } from "react";
import { saveProductAction } from "@/lib/admin-actions";
import MediaUploader from "@/components/admin/MediaUploader";
import { catalogTypeLabel, type Brand, type Category, type Product } from "@/lib/types";

export default function ProductForm({
  product,
  brands,
  categories,
  defaultCatalogType = "own_brand",
}: {
  product?: Product;
  brands: Brand[];
  categories: Category[];
  /** Which section this form was opened from — determines the catalog it saves into. */
  defaultCatalogType?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const catalogType = product?.catalog_type ?? defaultCatalogType;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await saveProductAction(product?.id ?? null, new FormData(e.currentTarget));
    if (result && !result.ok) {
      setError(result.error ?? "Failed to save.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-4 max-w-2xl">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Name" name="name" defaultValue={product?.name} required />
        <Field label="Slug" name="slug" defaultValue={product?.slug} required />
      </div>
      {/* Set by the section the product is created from, not chosen in the form. */}
      <input type="hidden" name="catalog_type" value={catalogType} />
      <div className="grid md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          Brand
          <select name="brand_id" defaultValue={product?.brand_id ?? ""} className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal">
            <option value="">—</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          Category
          <select name="category_id" defaultValue={product?.category_id ?? ""} className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal">
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        Description
        <textarea name="description" defaultValue={product?.description ?? ""} rows={3} className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal resize-none" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        Features (one per line)
        <textarea name="features" defaultValue={(product?.features ?? []).join("\n")} rows={4} className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal resize-none" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        Badges (one per line)
        <textarea name="badges" defaultValue={(product?.badges ?? []).join("\n")} rows={2} className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal resize-none" />
      </label>
      <MediaUploader label="Product image" name="image_url" defaultValue={product?.image_url} />
      <div className="grid md:grid-cols-2 gap-4 items-center">
        <label className="flex items-center gap-2 text-sm font-semibold text-navy">
          <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} /> Active (visible on site)
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-navy">
          <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} /> Featured on homepage
        </label>
      </div>
      <Field label="Sort order" name="sort_order" type="number" defaultValue={String(product?.sort_order ?? 0)} />
      <fieldset className="border border-border rounded-xl p-4 flex flex-col gap-3 mt-1">
        <legend className="text-sm font-bold text-navy px-2">SEO (optional)</legend>
        <p className="text-xs text-muted-2">Leave blank to use the product name and description.</p>
        <Field label="Meta title" name="meta_title" defaultValue={product?.meta_title ?? ""} />
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          Meta description
          <textarea name="meta_description" defaultValue={product?.meta_description ?? ""} rows={2} className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal" />
        </label>
        <Field label="Share image URL (OG)" name="og_image_url" defaultValue={product?.og_image_url ?? ""} />
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink transition-colors disabled:opacity-60">
          {saving ? "Saving…" : product ? "Save product" : "Create product"}
        </button>
        <span className="text-xs text-muted">Saves under {catalogTypeLabel(catalogType)}</span>
      </div>
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
