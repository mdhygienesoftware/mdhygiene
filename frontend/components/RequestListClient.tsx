"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/format";
import { submitOrderAction } from "@/lib/actions";

export default function RequestListClient() {
  const { items, updateQty, removeItem, clear } = useCart();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const total = items.reduce((sum, i) => sum + (i.unitPrice ?? 0) * i.qty, 0);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    const form = new FormData(e.currentTarget);

    const result = await submitOrderAction(
      {
        company_name: String(form.get("company_name") ?? ""),
        contact_name: String(form.get("contact_name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        region: String(form.get("region") ?? ""),
        notes: String(form.get("notes") ?? ""),
      },
      items.map((i) => ({
        product_variant_id: i.variantId,
        product_name_snapshot: i.productName,
        variant_label_snapshot: i.variantLabel,
        quantity: i.qty,
        unit_price_snapshot: i.unitPrice,
      }))
    );

    if (result.ok) {
      setStatus("success");
      clear();
    } else {
      setStatus("error");
      setError(result.error ?? "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white border border-border rounded-2xl p-10 text-center flex flex-col gap-2">
        <h2 className="text-xl font-bold text-navy">Order request received.</h2>
        <p className="text-muted-2">Our team will confirm pricing and dispatch timelines shortly.</p>
        <Link href="/products" className="text-blue font-semibold mt-2">Continue browsing →</Link>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="bg-white border border-border rounded-2xl p-10 text-center flex flex-col gap-2">
        <p className="text-muted-2">Your request list is empty.</p>
        <Link href="/products" className="text-blue font-semibold">Browse products →</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.variantId} className="bg-white border border-border rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-navy">{item.productName}</p>
              <p className="text-sm text-muted-2">{item.variantLabel}</p>
            </div>
            <input
              type="number"
              min={1}
              value={item.qty}
              onChange={(e) => updateQty(item.variantId, Number(e.target.value))}
              className="w-20 border border-border rounded-lg px-2 py-1.5 text-center"
            />
            <span className="w-28 text-right font-semibold text-navy">
              {item.unitPrice !== null ? formatINR(item.unitPrice * item.qty) : "—"}
            </span>
            <button onClick={() => removeItem(item.variantId)} className="text-muted hover:text-red-600 transition-colors" aria-label="Remove">
              ✕
            </button>
          </div>
        ))}
        <div className="flex justify-end gap-2 text-sm text-muted-2 pt-2">
          Estimated total (net):
          <span className="font-bold text-navy">{formatINR(total)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-4">
        <h2 className="text-lg font-extrabold text-navy">Your details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Company name" name="company_name" required />
          <Field label="Contact name" name="contact_name" required />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Email" name="email" type="email" required />
          <Field label="Phone" name="phone" required />
        </div>
        <Field label="Region / City" name="region" />
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          Notes
          <textarea name="notes" rows={3} className="border border-border rounded-lg px-4 py-3 text-[15px] font-normal text-navy resize-none" />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="self-start bg-pink text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-navy transition-colors disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting…" : "Submit order request"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
      {label}
      <input type={type} name={name} required={required} className="border border-border rounded-lg px-4 py-3 text-[15px] font-normal text-navy" />
    </label>
  );
}
