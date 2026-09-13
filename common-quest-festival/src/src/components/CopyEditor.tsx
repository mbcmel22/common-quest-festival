"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EDITABLE_COPY, defaultCopy, type CopyOverrides } from "@/lib/copy";
import type { Dictionary } from "@/i18n";

const LANGS = [
  { code: "fr", label: "Français" },
  { code: "en", label: "Anglais" },
  { code: "es", label: "Espagnol" }
] as const;

export default function CopyEditor({ dict }: { dict: Dictionary }) {
  const [copy, setCopy] = useState<CopyOverrides>({});
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [translating, setTranslating] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "copy")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setCopy(data.value as CopyOverrides);
      });
  }, []);

  function setValue(path: string, lang: string, value: string) {
    setCopy((prev) => ({ ...prev, [path]: { ...prev[path], [lang]: value } }));
  }

  async function translate(path: string) {
    const source = copy[path]?.fr?.trim() || defaultCopy(path, "fr");
    if (!source) return;
    setTranslating(path);
    setNotice(null);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: source, source: "fr", targets: ["en", "es"] })
      });
      const data = await response.json();
      if (!response.ok) {
        setNotice(data.error ?? dict.common.error);
      } else {
        setCopy((prev) => ({ ...prev, [path]: { ...prev[path], fr: source, en: data.en ?? "", es: data.es ?? "" } }));
      }
    } catch {
      setNotice(dict.common.error);
    }
    setTranslating(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    const supabase = createClient();
    const { error } = await supabase.from("site_settings").upsert({ key: "copy", value: copy }, { onConflict: "key" });
    setState(error ? "error" : "saved");
  }

  return (
    <form onSubmit={save} className="max-w-4xl space-y-5">
      <p className="text-ink/65">
        Laissez un champ vide pour garder le texte d’origine. Le bouton Traduire remplit l’anglais et l’espagnol à
        partir du français.
      </p>

      {notice && (
        <p role="alert" className="rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {notice}
        </p>
      )}

      {EDITABLE_COPY.map((field) => (
        <div key={field.path} className="rounded-2xl border border-ink/12 bg-white p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-[15px] uppercase tracking-[0.04em]">{field.label}</p>
            <button
              type="button"
              onClick={() => translate(field.path)}
              disabled={translating === field.path}
              className="rounded-full border border-ink/20 px-4 py-1.5 text-[13px] transition-colors hover:border-violet hover:text-violet disabled:opacity-50"
            >
              {translating === field.path ? "Traduction..." : "Traduire en EN et ES"}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {LANGS.map((lang) => (
              <div key={lang.code}>
                <label className="label" htmlFor={`${field.path}-${lang.code}`}>
                  {lang.label}
                </label>
                {field.multiline ? (
                  <textarea
                    id={`${field.path}-${lang.code}`}
                    rows={4}
                    className="field-light"
                    value={copy[field.path]?.[lang.code] ?? ""}
                    placeholder={defaultCopy(field.path, lang.code)}
                    onChange={(e) => setValue(field.path, lang.code, e.target.value)}
                    maxLength={600}
                  />
                ) : (
                  <input
                    id={`${field.path}-${lang.code}`}
                    className="field-light"
                    value={copy[field.path]?.[lang.code] ?? ""}
                    placeholder={defaultCopy(field.path, lang.code)}
                    onChange={(e) => setValue(field.path, lang.code, e.target.value)}
                    maxLength={300}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 flex items-center gap-4 rounded-full bg-ink px-5 py-3">
        <button type="submit" className="btn-acid btn-sm" disabled={state === "saving"}>
          {state === "saving" ? dict.admin.saving : dict.admin.save}
        </button>
        {state === "saved" && <span className="text-sm text-acid">{dict.admin.saved}</span>}
        {state === "error" && <span className="text-sm text-red-400">{dict.common.error}</span>}
      </div>
    </form>
  );
}
