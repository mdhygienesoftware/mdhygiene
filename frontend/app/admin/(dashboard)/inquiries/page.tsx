import { createClient } from "@/lib/supabase/server";
import { updateInquiryStatusAction } from "@/lib/admin-actions";
import StatusSelect from "@/components/admin/StatusSelect";
import { RESUME_BUCKET, resumeAttachment } from "@/lib/resume";

const STATUSES = ["new", "contacted", "closed"] as const;

/** Signed links last the working session, not for ever — the bucket is private
 *  precisely so a resume cannot be reached by URL alone. */
const RESUME_LINK_SECONDS = 60 * 60;

export default async function AdminInquiriesPage() {
  const supabase = await createClient();
  const { data: inquiries } = await supabase.from("distributor_inquiries").select("*").order("created_at", { ascending: false });

  // Job applications carry their resume's storage path in the message body,
  // since they share a table that was built for distributor enquiries. Each
  // one is signed here, at render, rather than stored as a link.
  const resumes = new Map<string, { name: string; href: string }>();
  await Promise.all(
    (inquiries ?? []).map(async (inquiry) => {
      const attachment = resumeAttachment(inquiry.message ?? "");
      if (!attachment) return;
      const { data } = await supabase.storage
        .from(RESUME_BUCKET)
        .createSignedUrl(attachment.path, RESUME_LINK_SECONDS, { download: attachment.name });
      if (data?.signedUrl) resumes.set(inquiry.id, { name: attachment.name, href: data.signedUrl });
    })
  );

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
            <p className="text-sm text-navy bg-[#F7F3EF] rounded-lg p-3 whitespace-pre-line">{inquiry.message}</p>
            {resumes.has(inquiry.id) && (
              <a
                href={resumes.get(inquiry.id)!.href}
                className="self-start inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-navy hover:text-white transition-colors"
              >
                Download resume
                <span className="font-normal text-xs opacity-70">{resumes.get(inquiry.id)!.name}</span>
              </a>
            )}
            <span className="text-xs text-muted">{new Date(inquiry.created_at).toLocaleString()}</span>
          </div>
        ))}
        {!inquiries?.length && <p className="text-muted-2">No inquiries yet.</p>}
      </div>
    </div>
  );
}
