import { getTeamMemberBySlug } from "@/lib/queries";
import type { TeamMember } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Serves the member's contact card as a .vcf download.
 *
 * Generated server-side rather than from a Blob in the browser: iOS Safari
 * ignores the `download` attribute on blob URLs, so the client-side approach
 * silently did nothing on iPhone — the main device for a visiting card. A real
 * response with Content-Disposition works on every platform.
 */

/** vCard text values must escape backslash, comma, semicolon and newlines. */
function esc(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const member = (await getTeamMemberBySlug(params.slug)) as TeamMember | null;
  if (!member) {
    return new Response("Not found", { status: 404 });
  }

  const parts = member.name.trim().split(/\s+/);
  const first = parts[0] ?? "";
  const last = parts.slice(1).join(" ");

  const tel = member.phone?.replace(/\s+/g, "") ?? "";
  const wa = member.whatsapp?.replace(/\s+/g, "") ?? "";
  // Most members have the same number for both; emitting it twice would create a
  // duplicate entry in the saved contact.
  const waLine = wa && wa !== tel ? `TEL;TYPE=CELL:${wa}` : null;

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(last)};${esc(first)};;;`,
    `FN:${esc(member.name)}`,
    "ORG:M.D. Hygiene Private Limited",
    member.designation ? `TITLE:${esc(member.designation)}` : null,
    tel ? `TEL;TYPE=CELL,VOICE:${tel}` : null,
    waLine,
    member.email ? `EMAIL;TYPE=INTERNET,WORK:${member.email}` : null,
    "URL:https://www.mdhygiene.in/",
    member.intro ? `NOTE:${esc(member.intro)}` : null,
    "END:VCARD",
  ].filter((l): l is string => l !== null);

  // CRLF is required by the spec; LF-only files are rejected by iOS Contacts.
  const vcard = lines.join("\r\n") + "\r\n";

  const filename = `${member.slug ?? member.name.replace(/\s+/g, "-").toLowerCase()}.vcf`;

  return new Response(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
