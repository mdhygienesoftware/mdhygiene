"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 50 * 1024 * 1024; // matches the media bucket's file_size_limit

const ALLOWED: Record<"image" | "video", string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
};

function prettySize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default function MediaUploader({
  label,
  name,
  defaultValue,
  accept,
  kind = "image",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  accept?: string;
  kind?: "image" | "video";
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.size > MAX_BYTES) {
      setError(`That file is ${prettySize(file.size)}. The limit is 50 MB — compress it and try again.`);
      e.target.value = "";
      return;
    }
    if (!ALLOWED[kind].includes(file.type)) {
      setError(
        `${file.type || "That file type"} isn't supported. Use ${
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
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setUrl(data.publicUrl);
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
          accept={accept ?? (kind === "video" ? ALLOWED.video.join(",") : ALLOWED.image.join(","))}
          onChange={handleFile}
          disabled={uploading}
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-white file:text-sm file:font-semibold hover:file:bg-pink file:cursor-pointer disabled:opacity-60"
        />
        {uploading && <span className="text-xs text-muted">Uploading…</span>}
      </div>

      <input
        type="text"
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Upload above, or paste a URL"
        className="border border-border rounded-lg px-4 py-2.5 text-sm"
      />

      <p className="text-xs text-muted">
        {kind === "video" ? "MP4, WebM or MOV" : "JPG, PNG, WebP, AVIF or GIF"} · up to 50 MB
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
