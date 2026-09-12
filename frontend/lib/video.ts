/**
 * Turning whatever YouTube link someone pastes into an embeddable one.
 *
 * People paste what the address bar or the Share button gave them, which is
 * five different shapes; only the embed form works in an iframe, so the id is
 * pulled out and the embed URL built here rather than trusting the input.
 */

/** The 11-character video id out of any usual YouTube URL, or null. */
export function youTubeId(input: string | null | undefined): string | null {
  const raw = input?.trim();
  if (!raw) return null;

  // A bare id pasted on its own.
  if (/^[\w-]{11}$/.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  const path = url.pathname;

  // youtu.be/<id>
  if (host === "youtu.be") return clean(path.slice(1));
  if (!/(^|\.)youtube(-nocookie)?\.com$/.test(host)) return null;

  // youtube.com/watch?v=<id>
  const v = url.searchParams.get("v");
  if (v) return clean(v);

  // youtube.com/embed/<id>, /shorts/<id>, /live/<id>, /v/<id>
  const match = path.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/);
  return match ? match[1] : null;
}

function clean(id: string): string | null {
  const trimmed = id.split("/")[0];
  return /^[\w-]{11}$/.test(trimmed) ? trimmed : null;
}

/**
 * Embed URL for a video id.
 *
 * youtube-nocookie.com is the privacy-preserving host: it does not write
 * tracking cookies unless the visitor actually plays the video. `rel=0` keeps
 * the end screen's suggestions to the same channel rather than sending viewers
 * off to a competitor.
 */
export function youTubeEmbedSrc(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}

/** The watch page, for a "watch on YouTube" link. */
export function youTubeWatchHref(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
