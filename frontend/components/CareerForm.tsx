"use client";

import { FormEvent, useEffect, useState } from "react";
import { submitApplicationAction } from "@/lib/actions";
import type { JobOpening } from "@/lib/types";

type Status = "idle" | "submitting" | "success" | "error";

const OPEN_APPLICATION = "Open application";

export default function CareerForm({ openings }: { openings: JobOpening[] }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState(OPEN_APPLICATION);

  // "Apply" on a listing links to #apply?role=…, so the form opens with that
  // role already chosen. Read on mount rather than with useSearchParams, which
  // would force this subtree into a Suspense boundary.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("role");
    if (wanted && openings.some((o) => o.title === wanted)) setRole(wanted);
  }, [openings]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const result = await submitApplicationAction(new FormData(form));
    if (result.ok) {
      setStatus("success");
      form.reset();
    } else {
      setStatus("error");
      setError(result.error ?? "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white border border-border rounded-2xl p-8 text-center flex flex-col gap-2">
        <h3 className="text-xl font-bold text-navy">Thanks — your application is in.</h3>
        <p className="text-muted-2">
          We read every one. If your background fits what we&apos;re hiring for, someone from the team will
          be in touch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-4">
      <div aria-hidden="true" className="hidden">
        <label htmlFor="career-website">Leave this field empty</label>
        <input id="career-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        Role you&apos;re applying for
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-border rounded-lg px-4 py-3 text-[15px] font-normal text-navy bg-white"
        >
          {openings
            .filter((o) => o.is_open)
            .map((o) => (
              <option key={o.id} value={o.title}>
                {o.title}
                {o.location ? ` — ${o.location}` : ""}
              </option>
            ))}
          <option value={OPEN_APPLICATION}>{OPEN_APPLICATION} (no specific role)</option>
        </select>
      </label>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Full name" name="contact_name" required />
        <Field label="Email" name="email" type="email" required />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Phone" name="phone" required />
        <Field label="Current city" name="region" />
      </div>
      <Field label="Years of experience" name="experience" placeholder="e.g. 4 years in production QC" />
      <Field
        label="Resume or profile link"
        name="resume_url"
        placeholder="Google Drive, Dropbox or LinkedIn URL"
      />

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        Why you&apos;d be a fit
        <textarea
          name="message"
          required
          minLength={10}
          rows={5}
          placeholder="Tell us what you've worked on and what you're looking for next."
          className="border border-border rounded-lg px-4 py-3 text-[15px] font-normal text-navy resize-none"
        />
      </label>

      <p className="text-xs text-muted-2 leading-relaxed">
        Attachments can&apos;t be uploaded here — paste a link to your resume instead, or email it to us
        once we reply.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full sm:w-auto sm:self-start bg-pink text-white px-8 py-4 sm:py-3.5 rounded-lg font-semibold hover:bg-navy transition-colors disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
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
        required={required}
        placeholder={placeholder}
        className="border border-border rounded-lg px-4 py-3 text-[15px] font-normal text-navy"
      />
    </label>
  );
}
