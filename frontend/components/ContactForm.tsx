"use client";

import { FormEvent, useState } from "react";
import { submitInquiryAction } from "@/lib/actions";
import { INQUIRY_TYPES } from "@/lib/types";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitInquiryAction(formData);
    if (result.ok) {
      setStatus("success");
      e.currentTarget.reset();
    } else {
      setStatus("error");
      setError(result.error ?? "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white border border-border rounded-2xl p-8 text-center flex flex-col gap-2">
        <h3 className="text-xl font-bold text-navy">Thanks — we&apos;ll be in touch.</h3>
        <p className="text-muted-2">Our team typically responds within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-4">
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Contact name" name="contact_name" required />
        <Field label="Company name" name="company_name" required />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone" name="phone" required />
      </div>
      <Field label="Region / City" name="region" />

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        Inquiry type
        <select
          name="inquiry_type"
          defaultValue="general"
          className="border border-border rounded-lg px-4 py-3 text-[15px] font-normal text-navy bg-white"
        >
          {INQUIRY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        Message
        <textarea
          name="message"
          required
          minLength={10}
          rows={5}
          className="border border-border rounded-lg px-4 py-3 text-[15px] font-normal text-navy resize-none"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full sm:w-auto sm:self-start bg-pink text-white px-8 py-4 sm:py-3.5 rounded-lg font-semibold hover:bg-navy transition-colors disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
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
