import { getCareers } from "@/lib/queries";
import CareersForm from "@/components/admin/CareersForm";

export const dynamic = "force-dynamic";

export default async function AdminCareersPage() {
  const careers = await getCareers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Careers</h1>
        <p className="text-sm text-muted-2 mt-1">
          Edit the careers section on the homepage and the roles listed at /careers. Applications arrive
          under Inquiries, labelled with the role applied for.
        </p>
      </div>
      <CareersForm careers={careers} />
    </div>
  );
}
