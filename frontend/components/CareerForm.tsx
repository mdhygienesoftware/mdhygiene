"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { submitApplicationAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import {
  RESUME_ACCEPT,
  RESUME_BUCKET,
  RESUME_MAX_BYTES,
  RESUME_TYPES_LABEL,
  prettyBytes,
  resumeContentType,
  resumePathFor,
} from "@/lib/resume";
import type { JobOpening } from "@/lib/types";

type Status = "idle" | "submitting" | "success" | "error";

const OPEN_APPLICATION = "Open application";

export default function CareerForm({ openings }: { openings: JobOpening[] }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState(OPEN_APPLICATION);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  // Where this file ended up, once it has been sent. Kept so that a submit
  // that fails downstream and is tried again does not upload it twice.
  const uploaded = useRef<{ file: File; path: string } | null>(null);

  // "Apply" on a listing links to #apply?role=…, so the form opens with that
  // role already chosen. Read on mount rather than with useSearchParams, which
  // would force this subtree into a Suspense boundary.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("role");
    if (wanted && openings.some((o) => o.title === wanted)) setRole(wanted);
  }, [openings]);

  /** Checked as soon as it is picked, so nobody fills in the whole form and
   *  only then finds out the file was too big. */
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setFileError(null);
    if (!picked) {
      setFile(null);
      return;
    }
    if (picked.size > RESUME_MAX_BYTES) {
      setFileError(
        `That file is ${prettyBytes(picked.size)} and the limit is ${prettyBytes(RESUME_MAX_BYTES)}. ` +
          "Save it smaller, or paste a link to it instead."
      );
      setFile(null);
      e.target.value = "";
      return;
    }
    if (!resumeContentType(picked)) {
      setFileError(`That file type isn't supported. Use ${RESUME_TYPES_LABEL}.`);
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(picked);
  }

  /**
   * Sends the file straight to storage from here rather than through the
   * server action. A Server Action body is capped around a megabyte, which a
   * scanned CV clears easily, and routing it through the server would mean
   * holding the whole thing in memory on the way past for no benefit.
   *
   * Returns the stored path, or null if there was nothing to send.
   */
  async function uploadResume(): Promise<string | null> {
    if (!file) return null;
    if (uploaded.current?.file === file) return uploaded.current.path;

    const contentType = resumeContentType(file);
    if (!contentType) return null;

    const path = resumePathFor(file.name);
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(path, file, { upsert: false, contentType });

    if (uploadError) throw uploadError;
    uploaded.current = { file, path };
    return path;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    setFileError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    // The file goes up first. If it cannot be stored, the application is not
    // sent at all — better to say so than to file it with the resume missing
    // and leave the applicant thinking it arrived.
    try {
      const path = await uploadResume();
      if (path && file) {
        data.set("resume_path", path);
        data.set("resume_name", file.name);
      }
    } catch {
      setStatus("error");
      setFileError(
        "We couldn't upload that file. Try again, or paste a link to your resume instead."
      );
      return;
    }
    // The picker's own field is not part of what gets submitted.
    data.delete("resume_upload");

    const result = await submitApplicationAction(data);
    if (result.ok) {
      setStatus("success");
      form.reset();
      setFile(null);
      uploaded.current = null;
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
      <div className="flex flex-col gap-1.5">
        <label htmlFor="resume-upload" className="text-sm font-semibold text-navy">
          Resume
        </label>
        <input
          id="resume-upload"
          type="file"
          name="resume_upload"
          accept={RESUME_ACCEPT}
          onChange={handleFile}
          disabled={status === "submitting"}
          className="text-sm text-navy file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2.5 file:text-white file:text-sm file:font-semibold hover:file:bg-pink file:cursor-pointer disabled:opacity-60"
        />
        <span className="text-xs text-muted-2">
          {file
            ? `${file.name} · ${prettyBytes(file.size)}`
            : `${RESUME_TYPES_LABEL}, up to ${prettyBytes(RESUME_MAX_BYTES)}.`}
        </span>
        {fileError && <p className="text-sm text-red-600">{fileError}</p>}
      </div>

      <Field
        label="Or a link to your resume or profile"
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
