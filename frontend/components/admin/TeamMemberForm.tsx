"use client";

import { FormEvent, useState } from "react";
import { saveTeamMemberAction } from "@/lib/admin-actions";
import MediaUploader from "@/components/admin/MediaUploader";
import type { TeamMember } from "@/lib/types";
import { isRedirectError } from "@/lib/is-redirect";

export default function TeamMemberForm({ member }: { member?: TeamMember }) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await saveTeamMemberAction(member?.id ?? null, new FormData(e.currentTarget));
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
    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-4 max-w-2xl">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Full name" name="name" defaultValue={member?.name} required />
        <Field label="Designation" name="designation" defaultValue={member?.designation ?? ""} placeholder="e.g. Production Manager" />
        <Field label="Card URL slug" name="slug" defaultValue={member?.slug ?? ""} placeholder="firstname-lastname" />
        <Field label="WhatsApp number" name="whatsapp" defaultValue={member?.whatsapp ?? ""} placeholder="+919999999999" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Department" name="department" defaultValue={member?.department ?? ""} placeholder="e.g. Quality, Sales, Export" />
        <Field label="Location" name="location" defaultValue={member?.location ?? ""} placeholder="e.g. Surat" />
      </div>

      <MediaUploader label="Photo" name="photo_url" defaultValue={member?.photo_url} />

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Email" name="email" type="email" defaultValue={member?.email ?? ""} />
        <Field label="Phone" name="phone" defaultValue={member?.phone ?? ""} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="LinkedIn URL" name="linkedin_url" defaultValue={member?.linkedin_url ?? ""} />
        <Field label="Joined year" name="joined_year" defaultValue={member?.joined_year ?? ""} placeholder="2016" />
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        Card intro
        <textarea name="intro" defaultValue={member?.intro ?? ""} rows={2} className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal resize-none" />
        <span className="text-xs font-normal text-muted-2">Shown on their digital visiting card at /card/&lt;slug&gt;</span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        Bio
        <textarea
          name="bio"
          defaultValue={member?.bio ?? ""}
          rows={4}
          className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal resize-none"
        />
      </label>

      <div className="grid md:grid-cols-2 gap-4 items-center">
        <label className="flex items-center gap-2 text-sm font-semibold text-navy">
          <input type="checkbox" name="is_active" defaultChecked={member?.is_active ?? true} /> Currently employed
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-navy">
          <input type="checkbox" name="show_on_website" defaultChecked={member?.show_on_website ?? true} /> Show on public website
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-navy">
          <input type="checkbox" name="card_enabled" defaultChecked={member?.card_enabled ?? true} /> Digital card enabled
        </label>
      </div>
      <p className="text-xs text-muted-2 -mt-2">
        Both must be ticked for someone to appear publicly — so you can keep an internal roster
        without publishing everyone.
      </p>

      <Field label="Sort order" name="sort_order" type="number" defaultValue={String(member?.sort_order ?? 0)} />

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="self-start bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink transition-colors disabled:opacity-60"
      >
        {saving ? "Saving…" : member ? "Save member" : "Add member"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
      {label}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal"
      />
    </label>
  );
}
