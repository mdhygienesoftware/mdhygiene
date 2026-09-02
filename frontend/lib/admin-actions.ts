"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions";

function textArrayFromForm(formData: FormData, key: string): string[] {
  return String(formData.get(key) ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------- Brands ----------

export async function saveBrandAction(id: string | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const payload = {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim() || null,
    logo_url: String(formData.get("logo_url") ?? "").trim() || null,
    accent_color: String(formData.get("accent_color") ?? "").trim() || null,
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
  if (!payload.slug || !payload.name) return { ok: false, error: "Slug and name are required." };

  const { error } = id ? await supabase.from("brands").update(payload).eq("id", id) : await supabase.from("brands").insert(payload);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/brands");
  revalidatePath("/", "layout");
  redirect("/admin/brands");
}

export async function deleteBrandAction(id: string) {
  const supabase = await createClient();
  await supabase.from("brands").delete().eq("id", id);
  revalidatePath("/admin/brands");
  revalidatePath("/", "layout");
}

// ---------- Products ----------

export async function saveProductAction(id: string | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const payload = {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    brand_id: String(formData.get("brand_id") ?? "") || null,
    category_id: String(formData.get("category_id") ?? "") || null,
    catalog_type: String(formData.get("catalog_type") ?? "own_brand"),
    description: String(formData.get("description") ?? "").trim() || null,
    features: textArrayFromForm(formData, "features"),
    badges: textArrayFromForm(formData, "badges"),
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
  if (!payload.slug || !payload.name) return { ok: false, error: "Slug and name are required." };

  let productId = id;
  if (id) {
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase.from("products").insert(payload).select("id").single();
    if (error) return { ok: false, error: error.message };
    productId = data.id;
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect(`/admin/products/${productId}`);
}

export async function deleteProductAction(id: string) {
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function saveVariantAction(productId: string, variantId: string | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const payload = {
    product_id: productId,
    size_label: String(formData.get("size_label") ?? "").trim(),
    pack_count: String(formData.get("pack_count") ?? "").trim() || null,
    case_qty: formData.get("case_qty") ? Number(formData.get("case_qty")) : null,
    mrp: formData.get("mrp") ? Number(formData.get("mrp")) : null,
    net_price: formData.get("net_price") ? Number(formData.get("net_price")) : null,
    sku: String(formData.get("sku") ?? "").trim() || null,
    stock_status: String(formData.get("stock_status") ?? "in_stock"),
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
  if (!payload.size_label) return { ok: false, error: "Size label is required." };

  const { error } = variantId
    ? await supabase.from("product_variants").update(payload).eq("id", variantId)
    : await supabase.from("product_variants").insert(payload);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
  return { ok: true };
}

export async function deleteVariantAction(productId: string, variantId: string) {
  const supabase = await createClient();
  await supabase.from("product_variants").delete().eq("id", variantId);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
}

// ---------- Hero slides ----------

export async function saveHeroSlideAction(id: string | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const payload = {
    media_type: String(formData.get("media_type") ?? "image"),
    media_url: String(formData.get("media_url") ?? "").trim(),
    poster_url: String(formData.get("poster_url") ?? "").trim() || null,
    eyebrow: String(formData.get("eyebrow") ?? "").trim() || null,
    headline: String(formData.get("headline") ?? "").trim(),
    subheading: String(formData.get("subheading") ?? "").trim() || null,
    cta_label: String(formData.get("cta_label") ?? "").trim() || null,
    cta_href: String(formData.get("cta_href") ?? "").trim() || null,
    sort_order: Number(formData.get("sort_order") ?? 0),
    is_active: formData.get("is_active") === "on",
  };
  if (!payload.media_url || !payload.headline) return { ok: false, error: "Media and headline are required." };

  const { error } = id ? await supabase.from("hero_slides").update(payload).eq("id", id) : await supabase.from("hero_slides").insert(payload);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/hero");
  revalidatePath("/");
  redirect("/admin/hero");
}

export async function deleteHeroSlideAction(id: string) {
  const supabase = await createClient();
  await supabase.from("hero_slides").delete().eq("id", id);
  revalidatePath("/admin/hero");
  revalidatePath("/");
}

// ---------- Site settings ----------

export async function updateSiteSettingAction(key: string, value: unknown): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({ key, value: value as never, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---------- Inquiries & orders ----------

export async function updateInquiryStatusAction(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("distributor_inquiries").update({ status }).eq("id", id);
  revalidatePath("/admin/inquiries");
}

export async function updateOrderStatusAction(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
