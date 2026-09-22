import { createClient } from "@/lib/supabase/server";
import { updateInquiryStatusAction } from "@/lib/admin-actions";
import StatusSelect from "@/components/admin/StatusSelect";

const STATUSES = ["new", "contacted", "closed"] as const;

export default async function AdminInquiriesPage() {
  const supabase = await createClient();
  const { data: inquiries } = await supabase.from("distributor_inquiries").select("*").order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-navy">Distributor inquiries</h1>
      <div className="flex flex-col gap-3">
        {(inquiries ?? []).map((inquiry) => (
          <div key={inquiry.id} className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-navy">{inquiry.contact_name} · {inquiry.company_name}</p>
                <p className="text-sm text-muted-2">
                  {inquiry.email} · {inquiry.phone} {inquiry.region ? `· ${inquiry.region}` : ""}
                </p>
                <p className="text-xs text-muted mt-1 uppercase tracking-wide">{inquiry.inquiry_type.replace("_", " ")}</p>
              </div>
              <StatusSelect id={inquiry.id} value={inquiry.status} options={STATUSES} action={updateInquiryStatusAction} />
            </div>
            <p className="text-sm text-navy bg-[#F7F3EF] rounded-lg p-3">{inquiry.message}</p>
            <span className="text-xs text-muted">{new Date(inquiry.created_at).toLocaleString()}</span>
          </div>
        ))}
        {!inquiries?.length && <p className="text-muted-2">No inquiries yet.</p>}
      </div>
    </div>
  );
}
