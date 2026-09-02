"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MediaUploader({
  label,
  name,
  defaultValue,
  accept = "image/*",
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
    setUploading(true);
    setError(null);

    const supabase = createClient();
    const path = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error: uploadError } = await supabase.storage.from("media").upload(path, file, { upsert: false });

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
      <div className="flex items-center gap-3">
        {url && kind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
        )}
        <input type="file" accept={accept} onChange={handleFile} className="text-sm" />
        {uploading && <span className="text-xs text-muted">Uploading…</span>}
      </div>
      <input
        type="text"
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="/images/... or upload above"
        className="border border-border rounded-lg px-4 py-2.5 text-sm"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
