"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { importMediaFromUrlAction } from "@/lib/media-import";

const MAX_BYTES = 50 * 1024 * 1024; // matches the media bucket's file_size_limit

const ALLOWED: Record<"image" | "video", string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
};

/**
 * Extension → the content type the bucket expects.
 *
 * Windows does not always have a MIME type registered for a video extension,
 * so `file.type` arrives empty or as something unhelpful like
 * application/octet-stream for a perfectly good MP4. Rejecting on that alone
 * turned "add a video" into a dead end, so the extension gets the final say.
 */
const BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  avif: "image/avif", gif: "image/gif",
  mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", mov: "video/quicktime",
};

/** What the file picker should offer — extensions as well as MIME types, since
 *  a Windows dialog matches on the extension. */
const ACCEPT: Record<"image" | "video", string> = {
  image: ".jpg,.jpeg,.png,.webp,.avif,.gif,image/*",
  video: ".mp4,.m4v,.webm,.mov,video/*",
};

/** The content type to store this file as, or null if we cannot support it. */
function contentTypeFor(file: File, kind: "image" | "video"): string | null {
  if (ALLOWED[kind].includes(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const guess = BY_EXTENSION[ext];
  return guess && ALLOWED[kind].includes(guess) ? guess : null;
}

function prettySize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default function MediaUploader({
  label,
  name,
  defaultValue,
  accept,
  kind = "image",
  onValueChange,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  accept?: string;
  kind?: "image" | "video";
  /**
   * Called whenever the URL changes, including after an upload or import.
   * Those set the value from code, which fires no DOM event, so a parent
   * watching the form would otherwise never hear about them.
   */
  onValueChange?: (url: string) => void;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [importing, setImporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function apply(next: string) {
    setUrl(next);
    onValueChange?.(next);
  }

  /** Copies a link from elsewhere into our own bucket, then uses our URL. */
  async function handleImport() {
    setImporting(true);
    setError(null);
    const result = await importMediaFromUrlAction(url, kind === "video" ? "video" : "image");
    if (result.ok && result.url) {
      apply(result.url);
    } else {
      setError(result.error ?? "Couldn't import that link.");
    }
    setImporting(false);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.size > MAX_BYTES) {
      setError(
        `That file is ${prettySize(file.size)} and the limit is 50 MB. ` +
          (kind === "video"
            ? "Shorten the clip or export it at 1080p and a lower bitrate, then try again."
            : "Save it smaller and try again.")
      );
      e.target.value = "";
      return;
    }

    const contentType = contentTypeFor(file, kind);
    if (!contentType) {
      setError(
        `${file.name.split(".").pop()?.toUpperCase() || "That file type"} isn't supported. Use ${
          kind === "video" ? "MP4, WebM or MOV" : "JPG, PNG, WebP, AVIF or GIF"
        }.`
      );
      e.target.value = "";
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const path = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: false, contentType });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    apply(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-navy">{label}</label>

      {url && (
        <div className="w-fit">
          {kind === "video" ? (
            <video src={url} className="h-28 rounded-lg border border-border bg-black" controls muted playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-28 w-auto rounded-lg object-cover border border-border" />
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept={accept ?? ACCEPT[kind]}
          onChange={handleFile}
          disabled={uploading}
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-white file:text-sm file:font-semibold hover:file:bg-pink file:cursor-pointer disabled:opacity-60"
        />
        {uploading && <span className="text-xs text-muted">Uploading…</span>}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          name={name}
          value={url}
          onChange={(e) => apply(e.target.value)}
          placeholder="Upload above, or paste an image link and press Import"
          className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm"
        />
        <button
          type="button"
          onClick={handleImport}
          disabled={importing || uploading || !url.trim() || url.includes("supabase.co")}
          className="shrink-0 bg-navy text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-pink transition-colors disabled:opacity-40"
          title="Copy a picture from another site into your own media library"
        >
          {importing ? "Importing…" : "Import"}
        </button>
      </div>

      <p className="text-xs text-muted">
        {kind === "video" ? "MP4, WebM or MOV" : "JPG, PNG, WebP, AVIF or GIF"} · up to 50 MB.
        Pasting a link from another site? Press <span className="font-semibold">Import</span> to copy it
        into your media library — links can&apos;t be used directly.
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
