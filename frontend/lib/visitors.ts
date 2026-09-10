import "server-only";
import { createClient } from "@/lib/supabase/server";

export type VisitRow = {
  path: string;
  referrer: string | null;
  visitor_hash: string;
  device: string | null;
  created_at: string;
};

export type VisitorStats = {
  /** False when the page_views table hasn't been created yet. */
  ready: boolean;
  viewsToday: number;
  visitorsToday: number;
  views7d: number;
  visitors7d: number;
  views30d: number;
  /** Oldest first, one entry per day for the last 14 days. */
  daily: { date: string; views: number; visitors: number }[];
  topPages: { path: string; views: number }[];
  topReferrers: { source: string; views: number }[];
  devices: { mobile: number; desktop: number };
  recent: VisitRow[];
};

const EMPTY: VisitorStats = {
  ready: false,
  viewsToday: 0,
  visitorsToday: 0,
  views7d: 0,
  visitors7d: 0,
  views30d: 0,
  daily: [],
  topPages: [],
  topReferrers: [],
  devices: { mobile: 0, desktop: 0 },
  recent: [],
};

function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/** "google.com" out of "https://www.google.com/search?q=…", "Direct" out of null. */
function referrerSource(referrer: string | null): string {
  if (!referrer) return "Direct / none";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host || "Direct / none";
  } catch {
    return "Direct / none";
  }
}

function topOf(counts: Map<string, number>, limit: number) {
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

/**
 * One read of the last 30 days, counted in memory.
 *
 * At this site's volume that is a few thousand rows at most, and it keeps every
 * figure on the page consistent with the same snapshot — worth more here than
 * the half-dozen aggregate round trips the alternative would cost.
 */
export async function getVisitorStats(): Promise<VisitorStats> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("page_views")
    .select("path, referrer, visitor_hash, device, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(20000);

  // 42P01 = table does not exist: the migration hasn't been run yet.
  if (error) return EMPTY;

  const rows = (data ?? []) as VisitRow[];
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const visitorsToday = new Set<string>();
  const visitors7d = new Set<string>();
  const pages = new Map<string, number>();
  const referrers = new Map<string, number>();
  const perDay = new Map<string, { views: number; visitors: Set<string> }>();
  let viewsToday = 0;
  let views7d = 0;
  let mobile = 0;

  for (const row of rows) {
    const stamp = new Date(row.created_at).getTime();
    const day = dayKey(row.created_at);

    if (day === today) {
      viewsToday += 1;
      visitorsToday.add(row.visitor_hash);
    }
    if (stamp >= weekAgo) {
      views7d += 1;
      visitors7d.add(row.visitor_hash);
      pages.set(row.path, (pages.get(row.path) ?? 0) + 1);
      referrers.set(referrerSource(row.referrer), (referrers.get(referrerSource(row.referrer)) ?? 0) + 1);
      if (row.device === "mobile") mobile += 1;
    }

    const bucket = perDay.get(day) ?? { views: 0, visitors: new Set<string>() };
    bucket.views += 1;
    bucket.visitors.add(row.visitor_hash);
    perDay.set(day, bucket);
  }

  // Fill the gaps so quiet days show as empty bars rather than disappearing.
  const daily: VisitorStats["daily"] = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const bucket = perDay.get(date);
    daily.push({ date, views: bucket?.views ?? 0, visitors: bucket?.visitors.size ?? 0 });
  }

  return {
    ready: true,
    viewsToday,
    visitorsToday: visitorsToday.size,
    views7d,
    visitors7d: visitors7d.size,
    views30d: rows.length,
    daily,
    topPages: topOf(pages, 8).map(([path, views]) => ({ path, views })),
    topReferrers: topOf(referrers, 6).map(([source, views]) => ({ source, views })),
    devices: { mobile, desktop: views7d - mobile },
    recent: rows.slice(0, 15),
  };
}
