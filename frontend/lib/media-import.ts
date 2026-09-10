"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Imports an image or video found elsewhere on the web into our own Storage
 * bucket.
 *
 * Pasting a foreign URL straight into a record doesn't work: the image
 * optimizer only serves allow-listed hosts, and the linked site can move or
 * delete the file at any time. Copying it into our bucket keeps the media
 * under our control and served from our own domain.
 */

const MAX_BYTES = 25 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 20_000;

const ALLOWED = {
  image: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
};

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/**
 * A Google Images result link points at a *search page*, not a picture — but it
 * carries the real file in its `imgurl` parameter, which is what people
 * actually mean when they paste one.
 */
export async function resolveImageUrl(input: string): Promise<string> {
  const url = input.trim();
  try {
    const parsed = new URL(url);
    const embedded = parsed.searchParams.get("imgurl") ?? parsed.searchParams.get("mediaurl");
    if (embedded) return decodeURIComponent(embedded);
  } catch {
    // fall through — validated by the caller
  }
  return url;
}

export interface ImportResult {
  ok: boolean;
  url?: string;
  error?: string;
}

export async function importMediaFromUrlAction(rawUrl: string, kind: "image" | "video" = "image"): Promise<ImportResult> {
  const supabase = await createClient();

  // Admin-only: the same check the rest of the panel relies on.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired — sign in again." };
  const { data: profile } = await supabase.from("admin_profiles").select("id").eq("id", user.id).maybeSingle();
  if (!profile) return { ok: false, error: "Your session expired — sign in again." };

  const target = await resolveImageUrl(rawUrl);

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return { ok: false, error: "That doesn't look like a valid link." };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, error: "Only https links can be imported." };
  }

  let res: Response;
  try {
    res = await fetch(target, {
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MDHygieneBot/1.0)" },
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "Couldn't download that link. Check it opens in a browser, or upload the file instead." };
  }
  if (!res.ok) {
    return { ok: false, error: `That link returned ${res.status}. Try “Copy image address” on the picture itself.` };
  }

  const contentType = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!ALLOWED[kind].includes(contentType)) {
    // The commonest cause: the link is a web page, not the picture itself.
    const looksLikePage = contentType.startsWith("text/");
    return {
      ok: false,
      error: looksLikePage
        ? "That link is a web page, not the picture. Right-click the image and choose “Copy image address”, then paste that."
        : `That link is a ${contentType || "unknown file"}, which isn't a supported ${kind}.`,
    };
  }

  const buffer = await res.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    return { ok: false, error: `That file is ${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB. The limit is 25 MB.` };
  }

  const ext = EXT[contentType] ?? "bin";
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("media")
    .upload(path, buffer, { contentType, upsert: false });
  if (error) {
    return { ok: false, error: `Couldn't save the file: ${error.message}` };
  }

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
