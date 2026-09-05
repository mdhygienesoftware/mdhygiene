"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendInquiryNotification } from "@/lib/email";

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

export async function adminSignInAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: "Invalid email or password." };

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
