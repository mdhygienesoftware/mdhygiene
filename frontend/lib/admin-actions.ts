"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions";
import { isRenderableImage } from "@/lib/image";
import { importMediaFromUrlAction } from "@/lib/media-import";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * A Supabase client with no cookie handling and no session persistence, used
 * only to test whether a password is correct. Kept separate from the request's
 * own client so that checking cannot disturb the session doing the checking.
 */
function createVerifierClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function textArrayFromForm(formData: FormData, key: string): string[] {
  return String(formData.get(key) ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}


/**
 * Media must live in our own Storage bucket — the optimizer only serves
 * allow-listed hosts, and a foreign URL breaks when the other site changes.
 *
 * Rather than rejecting a pasted link, copy it into our bucket and use ours.
 * Returns the URL to store, or an error when the link can't be imported.
 */
async function resolveMediaUrl(
  url: string | null,
  kind: "image" | "video" = "image",
): Promise<{ url: string | null } | { error: string }> {
  if (!url) return { url: null };
  if (isRenderableImage(url)) return { url };

  const imported = await importMediaFromUrlAction(url, kind);
  if (imported.ok && imported.url) return { url: imported.url };
  return { error: imported.error ?? "That link couldn't be used." };
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
    meta_title: String(formData.get("meta_title") ?? "").trim() || null,
    meta_description: String(formData.get("meta_description") ?? "").trim() || null,
  };
  if (!payload.slug || !payload.name) return { ok: false, error: "Slug and name are required." };
  const logo = await resolveMediaUrl(payload.logo_url);
  if ("error" in logo) return { ok: false, error: logo.error };
  payload.logo_url = logo.url;

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
    meta_title: String(formData.get("meta_title") ?? "").trim() || null,
    meta_description: String(formData.get("meta_description") ?? "").trim() || null,
    og_image_url: String(formData.get("og_image_url") ?? "").trim() || null,
  };
  if (!payload.slug || !payload.name) return { ok: false, error: "Slug and name are required." };
  const img = await resolveMediaUrl(payload.image_url);
  if ("error" in img) return { ok: false, error: img.error };
  payload.image_url = img.url;
  const og = await resolveMediaUrl(payload.og_image_url);
  if ("error" in og) return { ok: false, error: og.error };
  payload.og_image_url = og.url;

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
  revalidatePath("/", "layout");
  redirect(`/admin/products/${productId}`);
}

export async function deleteProductAction(id: string) {
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

export async function saveVariantAction(productId: string, variantId: string | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  // Pricing (mrp/net_price) and stock_status are deliberately absent: they are no
  // longer edited in the UI, and including them here would null out the existing
  // price list on every save.
  const payload = {
    product_id: productId,
    size_label: String(formData.get("size_label") ?? "").trim(),
    pack_count: String(formData.get("pack_count") ?? "").trim() || null,
    case_qty: formData.get("case_qty") ? Number(formData.get("case_qty")) : null,
    sku: String(formData.get("sku") ?? "").trim() || null,
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
  if (!payload.size_label) return { ok: false, error: "Size label is required." };

  const { error } = variantId
    ? await supabase.from("product_variants").update(payload).eq("id", variantId)
    : await supabase.from("product_variants").insert(payload);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteVariantAction(productId: string, variantId: string) {
  const supabase = await createClient();
  await supabase.from("product_variants").delete().eq("id", variantId);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/", "layout");
}

// ---------- Hero slides ----------

export async function saveHeroSlideAction(id: string | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const payload = {
    media_type: String(formData.get("media_type") ?? "image"),
    media_url: String(formData.get("media_url") ?? "").trim(),
    poster_url: String(formData.get("poster_url") ?? "").trim() || null,
    // Optional phone crop. Left empty, the desktop media is used at every width.
    mobile_media_type: String(formData.get("mobile_media_type") ?? "image"),
    mobile_media_url: String(formData.get("mobile_media_url") ?? "").trim() || null,
    mobile_poster_url: String(formData.get("mobile_poster_url") ?? "").trim() || null,
    eyebrow: String(formData.get("eyebrow") ?? "").trim() || null,
    headline: String(formData.get("headline") ?? "").trim(),
    subheading: String(formData.get("subheading") ?? "").trim() || null,
    cta_label: String(formData.get("cta_label") ?? "").trim() || null,
    cta_href: String(formData.get("cta_href") ?? "").trim() || null,
    sort_order: Number(formData.get("sort_order") ?? 0),
    duration_seconds: Math.min(60, Math.max(2, Number(formData.get("duration_seconds") ?? 6))),
    is_active: formData.get("is_active") === "on",
  };
  if (!payload.media_url || !payload.headline) return { ok: false, error: "Media and headline are required." };
  const media = await resolveMediaUrl(payload.media_url, payload.media_type === "video" ? "video" : "image");
  if ("error" in media) return { ok: false, error: media.error };
  payload.media_url = media.url ?? payload.media_url;
  const poster = await resolveMediaUrl(payload.poster_url);
  if ("error" in poster) return { ok: false, error: poster.error };
  payload.poster_url = poster.url;

  const mobile = await resolveMediaUrl(
    payload.mobile_media_url,
    payload.mobile_media_type === "video" ? "video" : "image"
  );
  if ("error" in mobile) return { ok: false, error: mobile.error };
  payload.mobile_media_url = mobile.url;
  const mobilePoster = await resolveMediaUrl(payload.mobile_poster_url);
  if ("error" in mobilePoster) return { ok: false, error: mobilePoster.error };
  payload.mobile_poster_url = mobilePoster.url;

  const { error } = id ? await supabase.from("hero_slides").update(payload).eq("id", id) : await supabase.from("hero_slides").insert(payload);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/hero");
  revalidatePath("/", "layout");
  redirect("/admin/hero");
}

export async function deleteHeroSlideAction(id: string) {
  const supabase = await createClient();
  await supabase.from("hero_slides").delete().eq("id", id);
  revalidatePath("/admin/hero");
  revalidatePath("/", "layout");
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

// ---------- Inquiries ----------

export async function updateInquiryStatusAction(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("distributor_inquiries").update({ status }).eq("id", id);
  revalidatePath("/admin/inquiries");
}

// ---------- SEO & GEO ----------

/** Persists one SEO settings block, then revalidates the public surfaces it feeds. */
export async function updateSeoSettingAction(key: string, value: unknown) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("seo_settings")
    .upsert({ key, value: value as never, updated_at: new Date().toISOString() });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
  revalidatePath("/llms.txt");
  revalidatePath("/admin/seo");
  return { ok: true };
}

// ---------- Team members ----------

export async function saveTeamMemberAction(id: string | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    designation: String(formData.get("designation") ?? "").trim() || null,
    department: String(formData.get("department") ?? "").trim() || null,
    photo_url: String(formData.get("photo_url") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    bio: String(formData.get("bio") ?? "").trim() || null,
    linkedin_url: String(formData.get("linkedin_url") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    joined_year: String(formData.get("joined_year") ?? "").trim() || null,
    slug: String(formData.get("slug") ?? "").trim() || null,
    whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    intro: String(formData.get("intro") ?? "").trim() || null,
    card_enabled: formData.get("card_enabled") === "on",
    is_active: formData.get("is_active") === "on",
    show_on_website: formData.get("show_on_website") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
  if (!payload.name) return { ok: false, error: "Name is required." };
  const photo = await resolveMediaUrl(payload.photo_url);
  if ("error" in photo) return { ok: false, error: photo.error };
  payload.photo_url = photo.url;

  const { error } = id
    ? await supabase.from("team_members").update(payload).eq("id", id)
    : await supabase.from("team_members").insert(payload);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/members");
  revalidatePath("/", "layout");
  redirect("/admin/members");
}

export async function deleteTeamMemberAction(id: string) {
  const supabase = await createClient();
  await supabase.from("team_members").delete().eq("id", id);
  revalidatePath("/admin/members");
  revalidatePath("/", "layout");
}

// ---------- Account ----------

/** Matches the minimum the form asks for; enforced here because the form can be bypassed. */
export const MIN_PASSWORD_LENGTH = 12;

/**
 * Changes the signed-in admin's own password.
 *
 * This exists because there is no other working way to do it. The Supabase
 * dashboard's "Reset password" button sends a recovery *email*, and the link in
 * it returns to a URL this app has no route for — so it dead-ends. Rotating the
 * password had no path that actually completed.
 *
 * The current password is required and checked, not taken on trust. Without
 * that, anyone who got hold of a live session cookie could lock the real owner
 * out of their own admin panel by changing the password without knowing it.
 */
export async function changeAdminPasswordAction(formData: FormData): Promise<ActionResult> {
  const current = String(formData.get("current_password") ?? "");
  const next = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (!current || !next) return { ok: false, error: "Fill in both password fields." };
  if (next !== confirm) return { ok: false, error: "The two new passwords do not match." };
  if (next.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (next === current) return { ok: false, error: "The new password is the same as the old one." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, error: "Your session expired — sign in again." };

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return { ok: false, error: "Your session expired — sign in again." };

  // Verified on a throwaway client that never touches cookies. Signing in on
  // the request's own client would replace the session mid-change, which the
  // single-session check would then read as a different device and sign this
  // one out — in the middle of changing its own password.
  const verifier = createVerifierClient();
  const { error: wrongPassword } = await verifier.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (wrongPassword) {
    return { ok: false, error: "That is not the current password." };
  }
  // The check issued a session of its own; end it rather than leave it valid.
  await verifier.auth.signOut();

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) {
    // Supabase rejects a password its own rules refuse — length, required
    // characters, or a breach match on plans that check for one. Its wording is
    // clearer than anything generic we would put here.
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
