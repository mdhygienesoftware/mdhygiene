import "server-only";

/**
 * A small in-memory rate limiter for the endpoints anyone can reach.
 *
 * The enquiry form, the careers form and the visitor beacon all write to the
 * database without anybody signing in. A honeypot stops a naive bot; it does
 * nothing about somebody holding down submit, and the table grows either way.
 *
 * In memory, deliberately: this runs as one Node process on one VPS, and a
 * counter that lives in the process costs nothing and needs no Redis. Two
 * consequences worth knowing. Restarting the app forgets every counter, and if
 * the app is ever run as a cluster each worker keeps its own — so the real
 * limit becomes the one here multiplied by the number of workers. Both are
 * acceptable for spam control; neither would be for anything security-critical.
 */

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();

/** Stops the map growing without bound on a long-running server. */
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, window] of buckets) {
    if (window.resetAt <= now) buckets.delete(key);
  }
}

/**
 * True when this caller is within its allowance.
 *
 * `key` should identify the caller and the thing being limited, so a form and
 * the beacon do not share one budget.
 */
export function withinLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

/**
 * The caller's address, as the proxy in front of us reports it.
 *
 * Behind cPanel this arrives as X-Forwarded-For, appended to by each hop, so
 * the first entry is the client. It is client-controlled and therefore
 * spoofable — fine for slowing down spam, not something to make a security
 * decision on.
 */
export function callerIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
