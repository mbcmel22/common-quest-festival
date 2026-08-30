"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "./ImageUploader";
import type { Dictionary } from "@/i18n";

type Practical = { address: string; transport: string; accessibility: string; instagram: string };
type Ticker = { fr: string; en: string; es: string };

export default function SettingsEditor({ dict }: { dict: Dictionary }) {
  const [practical, setPractical] = useState<Practical>({ address: "", transport: "", accessibility: "", instagram: "" });
  const [ticker, setTicker] = useState<Ticker>({ fr: "", en: "", es: "" });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["practical", "ticker", "brand"])
      .then(({ data }) => {
        (data ?? []).forEach((row: { key: string; value: Record<string, string> }) => {
          if (row.key === "practical") setPractical((v) => ({ ...v, ...row.value }));
          if (row.key === "ticker") setTicker((v) => ({ ...v, ...row.value }));
          if (row.key === "brand") setLogoUrl(row.value?.logo_url ?? null);
        });
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    const supabase = createClient();
    const { error } = await supabase.from("site_settings").upsert(
      [
        { key: "practical", value: practical },
        { key: "ticker", value: ticker },
        { key: "brand", value: { logo_url: logoUrl } }
      ],
      { onConflict: "key" }
    );
    setState(error ? "error" : "saved");
  }

  const practicalFields: { key: keyof Practical; label: string }[] = [
    { key: "address", label: "Adresse du festival" },
    { key: "transport", label: "Comment venir" },
    { key: "accessibility", label: "Accessibilite" },
    { key: "instagram", label: "Lien Instagram" }
  ];

  const tickerFields: { key: keyof Ticker; label: string }[] = [
    { key: "fr", label: "Banderole, francais" },
    { key: "en", label: "Banderole, anglais" },
    { key: "es", label: "Banderole, espagnol" }
  ];

  return (
    <form onSubmit={save} className="grid max-w-4xl gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-ink/12 bg-white p-6">
        <h2 className="display-m">Logo du site</h2>
        <p className="text-sm text-ink/60">
          Format conseille : PNG a fond transparent, environ 900 pixels de large. Il remplace le logo dans l entete et
          le pied de page. Laissez vide pour revenir au logo par defaut.
        </p>
        <ImageUploader label="Logo horizontal" value={logoUrl} folder="marque" onChange={setLogoUrl} />
      </div>

      <div className="space-y-4 rounded-2xl border border-ink/12 bg-white p-6">
        <h2 className="display-m">Banderole defilante</h2>
        <p className="text-sm text-ink/60">La phrase qui defile sous la page d accueil.</p>
        {tickerFields.map((field) => (
          <div key={field.key}>
            <label className="label" htmlFor={`ticker-${field.key}`}>
              {field.label}
            </label>
            <input
              id={`ticker-${field.key}`}
              className="field-light"
              value={ticker[field.key]}
              onChange={(e) => setTicker((v) => ({ ...v, [field.key]: e.target.value }))}
              maxLength={120}
              placeholder="Qu avons-nous en commun ? Le hip hop."
            />
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border border-ink/12 bg-white p-6 lg:col-span-2">
        <h2 className="display-m">Infos pratiques</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {practicalFields.map((field) => (
            <div key={field.key}>
              <label className="label" htmlFor={field.key}>
                {field.label}
              </label>
              <input
                id={field.key}
                className="field-light"
                value={practical[field.key]}
                onChange={(e) => setPractical((v) => ({ ...v, [field.key]: e.target.value }))}
                maxLength={200}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 lg:col-span-2">
        <button type="submit" className="btn-ink" disabled={state === "saving"}>
          {state === "saving" ? dict.admin.saving : dict.admin.save}
        </button>
        {state === "saved" && <span className="text-sm text-violet">{dict.admin.saved}</span>}
        {state === "error" && <span className="text-sm text-red-600">{dict.common.error}</span>}
      </div>
    </form>
  );
}
