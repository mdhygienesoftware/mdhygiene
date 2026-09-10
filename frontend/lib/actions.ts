"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendInquiryNotification } from "@/lib/email";
import { claimSession, sessionIdFromToken } from "@/lib/session";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function submitInquiryAction(formData: FormData): Promise<ActionResult> {
  // Honeypot — real users never fill this hidden field in.
  if (String(formData.get("website") ?? "").length > 0) {
    return { ok: true };
  }

  const payload = {
    company_name: String(formData.get("company_name") ?? "").trim(),
    contact_name: String(formData.get("contact_name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    region: String(formData.get("region") ?? "").trim() || null,
    inquiry_type: String(formData.get("inquiry_type") ?? "general"),
    message: String(formData.get("message") ?? "").trim(),
  };

  if (!payload.contact_name || !payload.email || !payload.phone || !payload.message || !payload.company_name) {
    return { ok: false, error: "Please fill in all required fields." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("distributor_inquiries").insert(payload);
  if (error) return { ok: false, error: "Something went wrong — please try again." };

  // Saved first, notified second: a mail outage must not lose the enquiry or
  // show the visitor an error, so the result is logged rather than surfaced.
  await sendInquiryNotification(payload);

  return { ok: true };
}

/**
 * A job application from /careers.
 *
 * Applications land in the same table as distributor enquiries — it is the only
 * table the public can write to, and standing up a separate one would need a
 * migration this project can't apply from here. The company_name column carries
 * the role instead, so applications are obvious at a glance in Admin →
 * Inquiries and can be filtered out of the distributor pipeline.
 */
export async function submitApplicationAction(formData: FormData): Promise<ActionResult> {
  // Honeypot — real users never fill this hidden field in.
  if (String(formData.get("website") ?? "").length > 0) {
    return { ok: true };
  }

  const name = String(formData.get("contact_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() || "Open application";
  const location = String(formData.get("region") ?? "").trim();
  const experience = String(formData.get("experience") ?? "").trim();
  const resumeUrl = String(formData.get("resume_url") ?? "").trim();
  const note = String(formData.get("message") ?? "").trim();

  if (!name || !email || !phone || !note) {
    return { ok: false, error: "Please fill in all required fields." };
  }

  // Everything the role-specific fields captured, kept in the message so no
  // detail is lost to a table that was designed for a different form.
  const message = [
    `Applying for: ${role}`,
    experience ? `Experience: ${experience}` : null,
    resumeUrl ? `Resume / profile: ${resumeUrl}` : null,
    "",
    note,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const payload = {
    company_name: `Job application · ${role}`,
    contact_name: name,
    email,
    phone,
    region: location || null,
    inquiry_type: "general",
    message,
  };

  const supabase = await createClient();
  const { error } = await supabase.from("distributor_inquiries").insert(payload);
  if (error) return { ok: false, error: "Something went wrong — please try again." };

  // Saved first, notified second: a mail outage must not lose the application.
  await sendInquiryNotification(payload);

  return { ok: true };
}

export async function adminSignInAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "Enter your email and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: "Invalid email or password." };

  // Claim this as the one active session — any other signed-in device is
  // dropped on its next request.
  const sessionId = sessionIdFromToken(data.session?.access_token);
  if (sessionId && data.user) {
    await claimSession(supabase, data.user.id, sessionId);
  }

  redirect("/admin");
}

export async function adminSignOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function revalidateAdminPath(path: string) {
  revalidatePath(path);
}
