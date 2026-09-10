/**
 * Guards against a bad image URL taking down a page.
 *
 * `next/image` throws — crashing the entire render — when given a host that
 * isn't in `next.config.mjs`'s `remotePatterns`. Since image URLs come from the
 * admin panel, one mistyped or pasted-from-Google value would otherwise 500 the
 * homepage. Callers use this to fall back to a placeholder instead.
 */

/** Hosts `next/image` is configured to optimise. Keep in sync with next.config.mjs. */
const ALLOWED_HOSTS = ["gtpvibbeqlndkaezqniz.supabase.co"];

export function isRenderableImage(url: string | null | undefined): url is string {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // App-relative paths are always fine.
  if (trimmed.startsWith("/")) return true;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) return false;
    // A search/results page is not an image, even on an allowed host.
    return !parsed.pathname.includes("/imgres");
  } catch {
    return false;
  }
}
