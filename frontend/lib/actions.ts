"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
  return { ok: true };
}

export interface OrderItemInput {
  product_variant_id: string;
  product_name_snapshot: string;
  variant_label_snapshot: string;
  quantity: number;
  unit_price_snapshot: number | null;
}

export async function submitOrderAction(
  details: { company_name: string; contact_name: string; email: string; phone: string; region?: string; notes?: string },
  items: OrderItemInput[]
): Promise<ActionResult> {
  if (!details.company_name || !details.contact_name || !details.email || !details.phone) {
    return { ok: false, error: "Please fill in all required fields." };
  }
  if (!items.length) {
    return { ok: false, error: "Your request list is empty." };
  }

  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      company_name: details.company_name,
      contact_name: details.contact_name,
      email: details.email,
      phone: details.phone,
      region: details.region || null,
      notes: details.notes || null,
    })
    .select("id")
    .single();

  if (orderError || !order) return { ok: false, error: "Something went wrong — please try again." };

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(items.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) return { ok: false, error: "Something went wrong — please try again." };
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
