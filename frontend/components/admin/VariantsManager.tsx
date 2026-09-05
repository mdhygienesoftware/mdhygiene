"use client";

import { FormEvent, useState } from "react";
import { deleteVariantAction, saveVariantAction } from "@/lib/admin-actions";
import type { ProductVariant } from "@/lib/types";

export default function VariantsManager({ productId, variants }: { productId: string; variants: ProductVariant[] }) {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead>
            <tr className="bg-[#F7F3EF] text-muted uppercase text-[11px]">
              <th className="px-3 py-2">Size</th>
              <th className="px-3 py-2">Pack</th>
              <th className="px-3 py-2">Case</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2" /></tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <VariantRow key={v.id} productId={productId} variant={v} />
            ))}
          </tbody>
        </table>
      </div>
      {showNew ? (
        <VariantEditor productId={productId} onDone={() => setShowNew(false)} />
      ) : (
        <button onClick={() => setShowNew(true)} className="self-start text-sm font-semibold text-blue">
          + Add size / variant
        </button>
      )}
    </div>
  );
}

function VariantRow({ productId, variant }: { productId: string; variant: ProductVariant }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <VariantEditorRow productId={productId} variant={variant} onDone={() => setEditing(false)} />;

  return (
    <tr className="border-t border-border">
      <td className="px-3 py-2 font-semibold text-navy">{variant.size_label}</td>
      <td className="px-3 py-2">{variant.pack_count}</td>
      <td className="px-3 py-2">{variant.case_qty}</td>
      <td className="px-3 py-2 text-muted-2">{variant.sku}</td>
      <td className="px-3 py-2 flex gap-3">
        <button onClick={() => setEditing(true)} className="text-blue font-semibold">Edit</button>
        <form action={deleteVariantAction.bind(null, productId, variant.id)}>
          <button type="submit" className="text-red-600 font-semibold">Delete</button>
        </form>
      </td>
    </tr>
  );
}

function VariantEditorRow({ productId, variant, onDone }: { productId: string; variant: ProductVariant; onDone: () => void }) {
  return (
    <tr className="border-t border-border bg-[#FBF9F6]">
      <td colSpan={5} className="px-3 py-3">
        <VariantEditor productId={productId} variant={variant} onDone={onDone} />
      </td>
    </tr>
  );
}

function VariantEditor({ productId, variant, onDone }: { productId: string; variant?: ProductVariant; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await saveVariantAction(productId, variant?.id ?? null, new FormData(e.currentTarget));
    setSaving(false);
    if (result.ok) {
      e.currentTarget.reset();
      onDone();
    } else {
      setError(result.error ?? "Failed to save.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <Field label="Size" name="size_label" defaultValue={variant?.size_label} required />
      <Field label="Pack" name="pack_count" defaultValue={variant?.pack_count ?? ""} />
      <Field label="Case qty" name="case_qty" type="number" defaultValue={String(variant?.case_qty ?? "")} />
      <Field label="SKU" name="sku" defaultValue={variant?.sku ?? ""} />
      <Field label="Sort" name="sort_order" type="number" defaultValue={String(variant?.sort_order ?? 0)} />
      {error && <p className="text-xs text-red-600 w-full">{error}</p>}
      <button type="submit" disabled={saving} className="bg-navy text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-pink transition-colors disabled:opacity-60">
        {saving ? "Saving…" : "Save"}
      </button>
      <button type="button" onClick={onDone} className="text-xs font-semibold text-muted">
        Cancel
      </button>
    </form>
  );
}

function Field({ label, name, defaultValue, type = "text", step, required = false }: { label: string; name: string; defaultValue?: string; type?: string; step?: string; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-navy">
      {label}
      <input type={type} step={step} name={name} defaultValue={defaultValue} required={required} className="border border-border rounded-lg px-2 py-1.5 text-sm font-normal w-24" />
    </label>
  );
}
