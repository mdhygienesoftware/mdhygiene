"use server";

import { lookup } from "dns/promises";
import { isIP } from "net";
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

/**
 * Addresses that are not on the public internet.
 *
 * This runs on our own server, so "fetch this URL for me" is a request to
 * reach anything the server can reach — the VPS's own services on localhost,
 * anything else on the private network, a cloud metadata endpoint. Admin-only
 * is not enough on its own; an admin pasting a link they were sent should not
 * be able to turn this box into a proxy for its own network.
 */
function isPrivateAddress(ip: string): boolean {
  if (ip.includes(":")) {
    const v6 = ip.toLowerCase();
    // Loopback, link-local, unique-local, and v4 written in v6 form.
    if (v6 === "::1" || v6 === "::" || v6.startsWith("fe80") || v6.startsWith("fc") || v6.startsWith("fd")) return true;
    const mapped = v6.split(":").pop() ?? "";
    return mapped.includes(".") ? isPrivateAddress(mapped) : false;
  }
  const [a, b] = ip.split(".").map(Number);
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true; // link-local, and cloud metadata
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  return a >= 224; // multicast and reserved
}

/** True when every address this hostname resolves to is on the public internet. */
async function resolvesPublicly(hostname: string): Promise<boolean> {
  const bare = hostname.replace(/^\[|\]$/g, "");
  if (isIP(bare)) return !isPrivateAddress(bare);
  try {
    const addresses = await lookup(bare, { all: true });
    return addresses.length > 0 && addresses.every((a) => !isPrivateAddress(a.address));
  } catch {
    return false;
  }
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
  if (!(await resolvesPublicly(parsed.hostname))) {
    return { ok: false, error: "That link points somewhere on a private network, so it can't be imported." };
  }

  let res: Response;
  try {
    res = await fetch(target, {
      // Redirects are followed by hand so each hop is checked too — otherwise
      // a public URL can bounce straight to a private one.
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MDHygieneBot/1.0)" },
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "Couldn't download that link. Check it opens in a browser, or upload the file instead." };
  }
  const followed = await followRedirects(res, target);
  if ("error" in followed) return { ok: false, error: followed.error };
  res = followed.response;

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

/** Walks up to three redirects, checking every hop lands on the public internet. */
async function followRedirects(
  response: Response,
  from: string
): Promise<{ response: Response } | { error: string }> {
  let res = response;
  let current = from;

  for (let hop = 0; hop < 3; hop++) {
    if (res.status < 300 || res.status >= 400) return { response: res };

    const location = res.headers.get("location");
    if (!location) return { response: res };

    let next: URL;
    try {
      next = new URL(location, current);
    } catch {
      return { error: "That link redirects somewhere we can't follow." };
    }
    if (next.protocol !== "https:" || !(await resolvesPublicly(next.hostname))) {
      return { error: "That link redirects somewhere it isn't safe to follow." };
    }

    try {
      res = await fetch(next.toString(), {
        redirect: "manual",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MDHygieneBot/1.0)" },
        cache: "no-store",
      });
    } catch {
      return { error: "Couldn't download that link. Check it opens in a browser, or upload the file instead." };
    }
    current = next.toString();
  }

  return { error: "That link redirects too many times." };
}
