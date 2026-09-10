"use client";

import { FormEvent, useState } from "react";
import { updateSiteSettingAction } from "@/lib/admin-actions";
import DeleteButton from "@/components/admin/DeleteButton";
import type { CareersContent, JobOpening } from "@/lib/types";
import { isRedirectError } from "@/lib/is-redirect";

function blankOpening(): JobOpening {
  return {
    // Only needs to be unique within this record, and stable once saved.
    id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    location: "",
    employment_type: "Full-time",
    experience: "",
    description: "",
    is_open: true,
  };
}

export default function CareersForm({ careers }: { careers: CareersContent }) {
  const [openings, setOpenings] = useState<JobOpening[]>(careers.openings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function patch(id: string, changes: Partial<JobOpening>) {
    setOpenings((list) => list.map((job) => (job.id === id ? { ...job, ...changes } : job)));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const f = new FormData(e.currentTarget);
    const value: CareersContent = {
      eyebrow: String(f.get("eyebrow") ?? "").trim(),
      heading: String(f.get("heading") ?? "").trim(),
      body: String(f.get("body") ?? "").trim(),
      cta_label: String(f.get("cta_label") ?? "").trim(),
      perks: String(f.get("perks") ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      // Openings live in React state, not form fields — an untitled one is a
      // row someone added and abandoned, so it isn't published.
      openings: openings.filter((job) => job.title.trim()),
      closing_note: String(f.get("closing_note") ?? "").trim(),
    };

    try {
      const result = await updateSiteSettingAction("careers", value);
      if (result.ok) {
        setOpenings(value.openings);
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-extrabold text-navy">Careers section</h2>
          <p className="text-sm text-muted-2">
            Shown on the homepage and at the top of <span className="font-semibold">/careers</span>.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Eyebrow" name="eyebrow" defaultValue={careers.eyebrow} />
          <Field label="Button label" name="cta_label" defaultValue={careers.cta_label} />
        </div>
        <Field label="Heading" name="heading" defaultValue={careers.heading} required />
        <Area label="Intro paragraph" name="body" defaultValue={careers.body} rows={4} />
        <Area
          label="Reasons to join (one per line)"
          name="perks"
          defaultValue={careers.perks.join("\n")}
          rows={4}
        />
        <Area
          label="Note below the openings"
          name="closing_note"
          defaultValue={careers.closing_note}
          rows={2}
        />
      </section>

      <section className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-extrabold text-navy">Open positions</h2>
            <p className="text-sm text-muted-2">
              Only roles marked <span className="font-semibold">Open</span> appear on the site and in the
              application form&apos;s role list.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpenings((list) => [...list, blankOpening()]);
              setSaved(false);
            }}
            className="shrink-0 text-sm font-semibold text-blue"
          >
            + Add a role
          </button>
        </div>

        {openings.length === 0 ? (
          <p className="text-sm text-muted-2">
            No roles listed. The careers page will invite open applications instead.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {openings.map((job) => (
              <div key={job.id} className="border border-border rounded-xl p-5 flex flex-col gap-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <Input
                    label="Job title"
                    value={job.title}
                    onChange={(title) => patch(job.id, { title })}
                    placeholder="Production Supervisor"
                  />
                  <Input
                    label="Location"
                    value={job.location}
                    onChange={(location) => patch(job.id, { location })}
                    placeholder="Surat, Gujarat"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <Input
                    label="Type"
                    value={job.employment_type}
                    onChange={(employment_type) => patch(job.id, { employment_type })}
                    placeholder="Full-time"
                  />
                  <Input
                    label="Experience"
                    value={job.experience}
                    onChange={(experience) => patch(job.id, { experience })}
                    placeholder="3–5 years"
                  />
                </div>
                <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
                  Description
                  <textarea
                    value={job.description}
                    onChange={(e) => patch(job.id, { description: e.target.value })}
                    rows={3}
                    className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal resize-none"
                  />
                </label>
                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-navy">
                    <input
                      type="checkbox"
                      checked={job.is_open}
                      onChange={(e) => patch(job.id, { is_open: e.target.checked })}
                    />
                    Open (visible on the site)
                  </label>
                  <DeleteButton
                    label="Remove"
                    what={job.title || "this role"}
                    action={() => {
                      setOpenings((list) => list.filter((entry) => entry.id !== job.id));
                      setSaved(false);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-2">
          Removing a role here takes effect when you press Save below.
        </p>
      </section>

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="self-start bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save careers page"}
        </button>
        {saved && <span className="text-sm font-semibold text-green-700">Saved — the site is updated.</span>}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal"
      />
    </label>
  );
}

function Area({
  label,
  name,
  defaultValue,
  rows,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal resize-none"
      />
    </label>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-border rounded-lg px-4 py-2.5 text-sm font-normal"
      />
    </label>
  );
}
