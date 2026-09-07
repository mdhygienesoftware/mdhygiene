import TeamMemberForm from "@/components/admin/TeamMemberForm";

export default function NewMemberPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-navy">New member</h1>
      <TeamMemberForm />
    </div>
  );
}
