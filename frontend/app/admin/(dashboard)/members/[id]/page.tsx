import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TeamMemberForm from "@/components/admin/TeamMemberForm";
import type { TeamMember } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditMemberPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data } = await supabase.from("team_members").select("*").eq("id", params.id).maybeSingle();
  if (!data) return notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-navy">{(data as TeamMember).name}</h1>
      <TeamMemberForm member={data as TeamMember} />
    </div>
  );
}
