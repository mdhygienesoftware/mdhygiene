import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callerIp, withinLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Obvious crawlers. Counting them would make the dashboard meaningless. */
const BOT = /bot|crawl|spider|slurp|bingpreview|headless|lighthouse|pingdom|monitor|curl|wget|python-requests|axios|facebookexternalhit|preview/i;

/**
 * Salt for the visitor hash. Regenerated whenever the server restarts and
 * combined with the date, so a hash cannot be traced back to an IP and stops
 * matching after a day anyway.
 */
const SALT = process.env.ANALYTICS_SALT ?? randomBytes(16).toString("hex");

function visitorHash(ip: string, ua: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${SALT}:${day}:${ip}:${ua}`).digest("hex").slice(0, 32);
}

export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  // Answer 204 either way: the browser sends this with sendBeacon and has no
  // way to act on a failure, and a bot shouldn't learn it was filtered out.
  if (!ua || BOT.test(ua)) return new NextResponse(null, { status: 204 });

  let body: { path?: unknown; referrer?: unknown };
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const path = typeof body.path === "string" ? body.path.slice(0, 512) : null;
  if (!path || !path.startsWith("/") || path.startsWith("/admin")) {
    return new NextResponse(null, { status: 204 });
  }

  const referrer = typeof body.referrer === "string" && body.referrer ? body.referrer.slice(0, 512) : null;

  // A real person browsing generously reads a page or two a minute. Anything
  // past sixty an hour from one address is a script, and every one of those is
  // a row in the database and a distortion of the dashboard.
  if (!withinLimit(`track:${callerIp(request.headers)}`, 60, 60 * 60 * 1000)) {
    return new NextResponse(null, { status: 204 });
  }

  const supabase = await createClient();
  await supabase.from("page_views").insert({
    path,
    referrer,
    visitor_hash: visitorHash(callerIp(request.headers), ua),
    device: /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop",
  });

  return new NextResponse(null, { status: 204 });
}
