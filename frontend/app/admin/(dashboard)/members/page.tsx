import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteTeamMemberAction } from "@/lib/admin-actions";
import type { TeamMember } from "@/lib/types";
import { isRenderableImage } from "@/lib/image";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("team_members").select("*").order("sort_order").order("name");
  const members = (data ?? []) as TeamMember[];

  // Group by department so a long roster stays scannable.
  const departments = Array.from(
    new Set(members.map((m) => m.department?.trim() || "Unassigned"))
  ).sort((a, b) => (a === "Unassigned" ? 1 : b === "Unassigned" ? -1 : a.localeCompare(b)));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Members</h1>
          <p className="text-sm text-muted-2 mt-1">
            {members.length} member{members.length === 1 ? "" : "s"} on the roster.
          </p>
        </div>
        <Link href="/admin/members/new" className="bg-navy text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-pink transition-colors">
          + New member
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-2">
          <p className="font-bold text-navy">No members yet</p>
          <p className="text-sm text-muted-2">
            Add them one by one, or send the team list and it can be imported in bulk.
          </p>
        </div>
      ) : (
        departments.map((dept) => (
          <section key={dept} className="flex flex-col gap-2">
            <h2 className="text-[13px] font-bold tracking-[0.1em] uppercase text-pink px-1">{dept}</h2>
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              {members
                .filter((m) => (m.department?.trim() || "Unassigned") === dept)
                .map((m) => (
                  <div key={m.id} className="flex items-center gap-4 px-6 py-3.5 border-b border-border last:border-0">
                    <div className="w-11 h-11 rounded-full bg-[#F5E1EA] overflow-hidden shrink-0 relative">
                      {isRenderableImage(m.photo_url) && (
                        <Image src={m.photo_url} alt={m.name} fill className="object-cover" sizes="44px" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-navy truncate">{m.name}</p>
                      <p className="text-xs text-muted-2 truncate">
                        {m.designation ?? "—"}
                        {!m.is_active && " · Former"}
                        {m.is_active && !m.show_on_website && " · Hidden from site"}
                      </p>
                    </div>
                    {m.slug && m.card_enabled && (
                      <a href={`/card/${m.slug}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-muted-2 hover:text-pink">Card ↗</a>
                    )}
                    <Link href={`/admin/members/${m.id}`} className="text-sm font-semibold text-blue">Manage</Link>
                    <form action={deleteTeamMemberAction.bind(null, m.id)}>
                      <button type="submit" className="text-sm font-semibold text-red-600">Delete</button>
                    </form>
                  </div>
                ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
