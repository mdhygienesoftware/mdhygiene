import { getVisitorStats } from "@/lib/visitors";

export const dynamic = "force-dynamic";

const SETUP_SQL = `create table if not exists public.page_views (
  id           bigint generated always as identity primary key,
  path         text        not null,
  referrer     text,
  visitor_hash text        not null,
  device       text,
  created_at   timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx       on public.page_views (path);

alter table public.page_views enable row level security;

create policy "record a page view"
  on public.page_views for insert
  to anon, authenticated
  with check (true);

create policy "admins read page views"
  on public.page_views for select
  to authenticated
  using (exists (select 1 from public.admin_profiles where id = auth.uid()));`;

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86400)}d ago`;
}

export default async function AdminVisitorsPage() {
  const stats = await getVisitorStats();

  if (!stats.ready) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Visitors</h1>
          <p className="text-sm text-muted-2 mt-1">One setup step left before this starts recording.</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-4">
          <p className="text-sm text-navy leading-relaxed">
            Open your <span className="font-semibold">Supabase dashboard → SQL Editor → New query</span>,
            paste the block below and press <span className="font-semibold">Run</span>. Then reload this
            page — visits start appearing straight away.
          </p>
          <pre className="bg-[#0F2A42] text-[#D6E6F5] text-xs leading-relaxed rounded-xl p-4 overflow-x-auto">
            {SETUP_SQL}
          </pre>
          <p className="text-xs text-muted-2 leading-relaxed">
            No IP addresses are stored. Each visit keeps a scrambled code that changes every day, which is
            enough to count how many different people visited without holding anything that identifies them.
          </p>
        </div>
      </div>
    );
  }

  const peak = Math.max(1, ...stats.daily.map((d) => d.views));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Visitors</h1>
        <p className="text-sm text-muted-2 mt-1">
          Live traffic on the public site. Admin pages and known bots are left out.
        </p>
      </div>

      {/* One panel per period, both figures inside it. Four separate cards read
          as duplicates: at low traffic "views" and "people" carry the same
          number, and the labels differed by a single word. */}
      <div className="grid sm:grid-cols-2 gap-5">
        <PeriodCard title="Today" views={stats.viewsToday} people={stats.visitorsToday} />
        <PeriodCard title="Last 7 days" views={stats.views7d} people={stats.visitors7d} />
      </div>

      <section className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="text-lg font-extrabold text-navy">Last 14 days</h2>
        <div className="flex items-end gap-1.5 h-40">
          {stats.daily.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 group">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t bg-blue/80 group-hover:bg-pink transition-colors min-h-[2px]"
                  style={{ height: `${Math.round((d.views / peak) * 100)}%` }}
                  title={`${d.date}: ${d.views} pages opened by ${d.visitors} people`}
                />
              </div>
              <span className="text-[10px] text-muted-2 tabular-nums">{d.date.slice(8)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-2">Bar height is pages opened. Hover a bar for the exact numbers.</p>
      </section>

      <div className="grid md:grid-cols-2 gap-5">
        <section className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-3">
          <h2 className="text-lg font-extrabold text-navy">Most visited pages</h2>
          <p className="text-xs text-muted-2 -mt-2">Last 7 days</p>
          {stats.topPages.length === 0 ? (
            <p className="text-sm text-muted-2">No visits recorded yet this week.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {stats.topPages.map((p) => (
                <li key={p.path} className="flex items-center justify-between gap-4 py-2">
                  <span className="text-sm text-navy truncate">{p.path}</span>
                  <span className="text-sm font-bold text-navy tabular-nums shrink-0">{p.views}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-3">
          <h2 className="text-lg font-extrabold text-navy">Where they came from</h2>
          <p className="text-xs text-muted-2 -mt-2">Last 7 days</p>
          {stats.topReferrers.length === 0 ? (
            <p className="text-sm text-muted-2">No visits recorded yet this week.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {stats.topReferrers.map((r) => (
                <li key={r.source} className="flex items-center justify-between gap-4 py-2">
                  <span className="text-sm text-navy truncate">{r.source}</span>
                  <span className="text-sm font-bold text-navy tabular-nums shrink-0">{r.views}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 pt-3 border-t border-border flex gap-6 text-sm">
            <span className="text-muted-2">
              Mobile <span className="font-bold text-navy">{stats.devices.mobile}</span>
            </span>
            <span className="text-muted-2">
              Desktop <span className="font-bold text-navy">{stats.devices.desktop}</span>
            </span>
          </div>
        </section>
      </div>

      <section className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-3">
        <h2 className="text-lg font-extrabold text-navy">Latest visits</h2>
        {stats.recent.length === 0 ? (
          <p className="text-sm text-muted-2">Nothing yet. Open the public site in another tab to test it.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {stats.recent.map((v, i) => (
              <li key={`${v.created_at}-${i}`} className="flex items-center justify-between gap-4 py-2">
                <span className="text-sm text-navy truncate">{v.path}</span>
                <span className="text-xs text-muted-2 shrink-0">
                  {v.device ?? "unknown"} · {timeAgo(v.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/**
 * One period, both numbers. "Pages opened" and "different people" spell out
 * what separates them — "views" vs "visitors" did not, and they usually match.
 */
function PeriodCard({ title, views, people }: { title: string; views: number; people: number }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-4">
      <span className="text-[12px] font-bold tracking-[0.12em] text-pink">{title.toUpperCase()}</span>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-3xl font-extrabold text-navy tabular-nums">{views}</span>
          <span className="text-sm text-muted-2">pages opened</span>
        </div>
        <div className="flex flex-col gap-0.5 border-l border-border pl-4">
          <span className="text-3xl font-extrabold text-navy tabular-nums">{people}</span>
          <span className="text-sm text-muted-2">different people</span>
        </div>
      </div>
    </div>
  );
}
