import "server-only";

/**
 * Transactional email via Resend's HTTP API (no SMTP, no extra dependency —
 * works on serverless where long-lived SMTP connections don't).
 *
 * Every function here is best-effort: the caller has already persisted the
 * record, so a mail outage must never surface as a failed submission.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 8000;

export interface InquiryEmailPayload {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  region: string | null;
  inquiry_type: string;
  message: string;
}

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  distribution: "Distribution",
  private_label: "Private Label / OEM",
  government_tender: "Government / Tender",
  general: "General enquiry",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(inquiry: InquiryEmailPayload, adminUrl: string | null): string {
  const type = INQUIRY_TYPE_LABELS[inquiry.inquiry_type] ?? inquiry.inquiry_type;
  const row = (label: string, value: string) =>
    `<tr>
       <td style="padding:6px 16px 6px 0;color:#8A7B73;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td>
       <td style="padding:6px 0;color:#123A5C;font-size:14px;font-weight:600">${escapeHtml(value)}</td>
     </tr>`;

  return `
  <div style="font-family:Helvetica,Arial,sans-serif;background:#FBF6F2;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #F0E4DC;border-radius:14px;overflow:hidden">
      <div style="background:#123A5C;padding:18px 24px">
        <p style="margin:0;color:#fff;font-size:16px;font-weight:800">New ${escapeHtml(type)} enquiry</p>
        <p style="margin:4px 0 0;color:#9DB4C8;font-size:13px">M.D. Hygiene website</p>
      </div>
      <div style="padding:20px 24px">
        <table style="border-collapse:collapse;width:100%">
          ${row("Company", inquiry.company_name)}
          ${row("Contact", inquiry.contact_name)}
          ${row("Email", inquiry.email)}
          ${row("Phone", inquiry.phone)}
          ${inquiry.region ? row("Region", inquiry.region) : ""}
        </table>
        <p style="margin:18px 0 6px;color:#8A7B73;font-size:13px">Message</p>
        <div style="background:#F7F3EF;border-radius:10px;padding:14px;color:#123A5C;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(
          inquiry.message
        )}</div>
        ${
          adminUrl
            ? `<p style="margin:20px 0 0"><a href="${adminUrl}/admin/inquiries" style="background:#E4779F;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14px;font-weight:600;display:inline-block">Open in admin panel</a></p>`
            : ""
        }
        <p style="margin:18px 0 0;color:#8A7B73;font-size:12px">Reply directly to this email to respond to ${escapeHtml(
          inquiry.contact_name
        )}.</p>
      </div>
    </div>
  </div>`;
}

function buildText(inquiry: InquiryEmailPayload): string {
  const type = INQUIRY_TYPE_LABELS[inquiry.inquiry_type] ?? inquiry.inquiry_type;
  return [
    `New ${type} enquiry — M.D. Hygiene website`,
    "",
    `Company: ${inquiry.company_name}`,
    `Contact: ${inquiry.contact_name}`,
    `Email:   ${inquiry.email}`,
    `Phone:   ${inquiry.phone}`,
    inquiry.region ? `Region:  ${inquiry.region}` : null,
    "",
    "Message:",
    inquiry.message,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

/**
 * Returns true if the notification was accepted by the provider. Never throws —
 * the inquiry is already saved by the time this runs.
 */
export async function sendInquiryNotification(inquiry: InquiryEmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_NOTIFICATION_TO;
  const from = process.env.INQUIRY_NOTIFICATION_FROM ?? "M.D. Hygiene <onboarding@resend.dev>";
  const adminUrl = process.env.NEXT_PUBLIC_SITE_URL ?? null;

  if (!apiKey || !to) {
    console.warn("[email] RESEND_API_KEY or INQUIRY_NOTIFICATION_TO not set — skipping notification.");
    return false;
  }

  const type = INQUIRY_TYPE_LABELS[inquiry.inquiry_type] ?? inquiry.inquiry_type;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((address) => address.trim()).filter(Boolean),
        reply_to: inquiry.email,
        subject: `New ${type} enquiry — ${inquiry.company_name}`,
        html: buildHtml(inquiry, adminUrl),
        text: buildText(inquiry),
      }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[email] Resend rejected the notification:", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] Failed to send inquiry notification:", error);
    return false;
  }
}
