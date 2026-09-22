/**
 * Resume attachments on the careers form.
 *
 * Applicants upload straight from the browser into a private bucket — the
 * `media` bucket is public, and a CV is somebody's address, phone number and
 * employment history, which has no business being on a guessable public URL.
 * Anyone may write to the bucket; only an admin may read it, and they read
 * through short-lived signed links rather than a permanent one.
 *
 * The path is recorded in the inquiry's message, because applications share
 * the `distributor_inquiries` table and it has no column of its own.
 */

export const RESUME_BUCKET = "resumes";

/** Matches the bucket's own file_size_limit — see the migration. */
export const RESUME_MAX_BYTES = 10 * 1024 * 1024;

/** Everything inside the bucket lives under here, so a recorded path is easy
 *  to tell apart from anything else and easy to check before it is used. */
export const RESUME_PREFIX = "applications";

/**
 * Extension → the content type the bucket expects.
 *
 * Windows does not reliably report a MIME type for .doc or .docx, so the file
 * arrives with an empty `type` or application/octet-stream. The extension gets
 * the final say, exactly as it does for admin media uploads.
 */
const BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  rtf: "application/rtf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

/** What the file picker offers. Extensions as well as types, since a Windows
 *  dialog matches on the extension and greys everything else out. */
export const RESUME_ACCEPT = ".pdf,.doc,.docx,.rtf,.jpg,.jpeg,.png";

export const RESUME_TYPES_LABEL = "PDF, DOC, DOCX, RTF, JPG or PNG";

/** The content type to store this file as, or null if we cannot take it. */
export function resumeContentType(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const byExtension = BY_EXTENSION[extension];
  if (byExtension) return byExtension;
  return Object.values(BY_EXTENSION).includes(file.type) ? file.type : null;
}

/** A storage path for this upload: unguessable, and safe as an object key. */
export function resumePathFor(fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-80);
  return `${RESUME_PREFIX}/${crypto.randomUUID()}-${safe}`;
}

/** Only ever trust a path that looks like one we wrote. */
export function isResumePath(path: string): boolean {
  return new RegExp(`^${RESUME_PREFIX}/[A-Za-z0-9.\-_]+$`).test(path);
}

/** How the attachment is recorded in the message body. */
export function resumeLine(fileName: string, path: string): string {
  return `Resume file: ${fileName} (${path})`;
}

/** Reads that line back out, for the admin list. */
export function resumeAttachment(message: string): { name: string; path: string } | null {
  const match = message.match(
    new RegExp(`^Resume file: (.+) \((${RESUME_PREFIX}/[^)]+)\)$`, "m")
  );
  if (!match || !isResumePath(match[2])) return null;
  return { name: match[1], path: match[2] };
}

export function prettyBytes(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

/**
 * The applicant's own file name, reduced to something safe to write into the
 * message body: a whitelist, so no line break can break out of the line the
 * attachment is recorded on and no bracket can fake the path beside it.
 */
export function safeFileName(name: string): string {
  const clean = name.replace(/[^A-Za-z0-9 ._-]/g, "_").trim().slice(0, 80);
  return clean || "resume";
}
