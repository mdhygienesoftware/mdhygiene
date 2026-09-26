"use client";

import { FormEvent, useState } from "react";
import { updateSiteSettingAction } from "@/lib/admin-actions";
import MediaUploader from "@/components/admin/MediaUploader";
import type { OemClient, OemClientsBlock } from "@/lib/types";
import { isRedirectError } from "@/lib/is-redirect";

/**
 * The private-label clients shown on the homepage and on /products.
 *
 * Stored under one settings key rather than a table of its own: it is a short,
 * hand-curated list that changes when a contract is signed, not something with
 * a lifecycle worth a migration.
 */
export default function OemClientsForm({ block }: { block: OemClientsBlock }) {
  const [clients, setClients] = useState<OemClient[]>(block.clients);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(index: number, patch: Partial<OemClient>) {
    setClients((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const f = new FormData(e.currentTarget);
    const value: OemClientsBlock = {
      eyebrow: String(f.get("eyebrow") ?? "").trim(),
      heading: String(f.get("heading") ?? "").trim(),
      caption: String(f.get("caption") ?? "").trim(),
      is_active: f.get("is_active") === "on",
      // A row added and left blank is not published. Both halves are required:
      // a logo with no name has no alt text, and a name with no logo has
      // nothing to show.
      clients: clients.filter((c) => c.name.trim() && c.logo_url.trim()),
    };

    try {
      const result = await updateSiteSettingAction("oem_clients", value);
      if (result.ok) {
        setClients(value.clients);
        setSaved(true);
      } else {
        setError(result.error ?? "Failed to save.");
      }
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError(err instanceof Error ? err.message : "Couldn't save. Check your connection.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-5 max-w-2xl">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-navy">Brands we manufacture for</h2>
        <p className="text-sm text-muted-2">
          Shown on the homepage and inside the private-label block on /products.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-navy">
        <input type="checkbox" name="is_active" defaultChecked={block.is_active} /> Show this section
      </label>

      <Field label="Eyebrow" name="eyebrow" defaultValue={block.eyebrow} />
      <Field label="Heading" name="heading" defaultValue={block.heading} />
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        Caption
        <textarea
          name="caption"
          defaultValue={block.caption}
          rows={2}
          className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal resize-none"
        />
      </label>

      <div className="flex flex-col gap-4">
        <span className="text-sm font-semibold text-navy">Clients</span>

        {clients.length === 0 && (
          <p className="text-sm text-muted-2">None yet — add one below.</p>
        )}

        {clients.map((client, i) => (
          <div key={i} className="border border-border rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-muted-2 uppercase tracking-wide">
                Client {i + 1}
              </span>
              <button
                type="button"
                onClick={() => {
                  setClients((rows) => rows.filter((_, x) => x !== i));
                  setSaved(false);
                }}
                className="text-xs font-semibold text-red-700 hover:underline"
              >
                Remove
              </button>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
              Company name
              <input
                type="text"
                value={client.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Trent Limited"
                className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal"
              />
              <span className="text-xs font-normal text-muted-2">
                Also used as the logo&apos;s alt text, so write it as the company does.
              </span>
            </label>

            <MediaUploader
              label="Logo"
              name={`logo_${i}`}
              defaultValue={client.logo_url}
              onValueChange={(logo_url) => update(i, { logo_url })}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => {
            setClients((rows) => [...rows, { name: "", logo_url: "" }]);
            setSaved(false);
          }}
          className="self-start border border-border rounded-lg px-4 py-2.5 text-sm font-semibold text-navy hover:bg-cream transition-colors"
        >
          + Add client
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}
      {saved && <p className="text-sm font-semibold text-green-700">Saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="self-start bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink transition-colors disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
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
