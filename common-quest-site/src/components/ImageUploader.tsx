"use client";

import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function ImageUploader({
  value,
  onChange,
  folder = "divers",
  label
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (!ALLOWED.includes(file.type)) {
      setError("Format accepte : JPG, PNG, WebP ou AVIF.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Image trop lourde. 5 Mo maximum.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "jpg";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    setBusy(false);
    if (uploadError) {
      setError("L envoi a echoue. Reessayez.");
      return;
    }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    onChange(data.publicUrl);
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-start gap-4">
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-ink/15 bg-white">
          {value ? (
            <Image src={value} alt="" fill sizes="128px" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center font-mono text-[10px] uppercase text-ink/40">
              vide
            </span>
          )}
        </div>
        <div className="space-y-2">
          <input
            type="file"
            accept={ALLOWED.join(",")}
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
            }}
            className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:font-mono file:text-[11px] file:uppercase file:tracking-[0.14em] file:text-paper"
          />
          {busy && <p className="text-xs text-violet">Envoi en cours...</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
          {value && (
            <button type="button" onClick={() => onChange(null)} className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50 hover:text-red-600">
              Retirer l image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
