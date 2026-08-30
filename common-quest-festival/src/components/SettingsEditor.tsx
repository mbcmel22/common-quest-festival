"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "./ImageUploader";
import type { Dictionary } from "@/i18n";

type Practical = { address: string; transport: string; accessibility: string; instagram: string };
type Zone = { fr: string; en: string; es: string };
type Ticker = { home: Zone; infos: Zone; speed_home: number; speed_infos: number };

const emptyZone: Zone = { fr: "", en: "", es: "" };

export default function SettingsEditor({ dict }: { dict: Dictionary }) {
  const [practical, setPractical] = useState<Practical>({ address: "", transport: "", accessibility: "", instagram: "" });
  const [ticker, setTicker] = useState<Ticker>({ home: { ...emptyZone }, infos: { ...emptyZone }, speed_home: 75, speed_infos: 75 });
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
          if (row.key === "ticker") {
            const value = row.value as unknown as Partial<Ticker> & Partial<Zone>;
            setTicker((v) => ({
              home: { ...v.home, ...(value.home ?? { fr: value.fr ?? "", en: value.en ?? "", es: value.es ?? "" }) },
              infos: { ...v.infos, ...(value.infos ?? {}) },
              speed_home: Number(value.speed_home ?? 75),
              speed_infos: Number(value.speed_infos ?? 75)
            }));
          }
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

  const langs: { key: keyof Zone; label: string }[] = [
    { key: "fr", label: "Francais" },
    { key: "en", label: "Anglais" },
    { key: "es", label: "Espagnol" }
  ];

  const zones: { key: "home" | "infos"; title: string; speedKey: "speed_home" | "speed_infos"; hint: string }[] = [
    { key: "home", title: "Banderole jaune, page d’accueil", speedKey: "speed_home", hint: "Sous le titre de l’accueil." },
    { key: "infos", title: "Banderole violette, page infos", speedKey: "speed_infos", hint: "Entre les infos pratiques et l’équipe." }
  ];

  return (
    <form onSubmit={save} className="grid max-w-4xl gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-ink/12 bg-white p-6">
        <h2 className="display-m">Logo du site</h2>
        <p className="text-sm text-ink/60">
          Format conseille : PNG a fond transparent, environ 900 pixels de large. Il remplace le logo dans l’entête et
          le pied de page. Laissez vide pour revenir au logo par defaut.
        </p>
        <ImageUploader label="Logo horizontal" value={logoUrl} folder="marque" onChange={setLogoUrl} />
      </div>

      <div className="space-y-6 rounded-2xl border border-ink/12 bg-white p-6">
        <h2 className="display-m">Banderoles defilantes</h2>
        {zones.map((zone) => (
          <div key={zone.key} className="space-y-3 border-t border-ink/10 pt-4 first:border-0 first:pt-0">
            <div>
              <p className="font-display text-[15px] uppercase tracking-[0.04em]">{zone.title}</p>
              <p className="text-sm text-ink/55">{zone.hint}</p>
            </div>
            {langs.map((lang) => (
              <div key={lang.key}>
                <label className="label" htmlFor={`${zone.key}-${lang.key}`}>
                  {lang.label}
                </label>
                <input
                  id={`${zone.key}-${lang.key}`}
                  className="field-light"
                  value={ticker[zone.key][lang.key]}
                  onChange={(e) =>
                    setTicker((v) => ({ ...v, [zone.key]: { ...v[zone.key], [lang.key]: e.target.value } }))
                  }
                  maxLength={120}
                  placeholder="Qu’avons-nous en commun ? Le hip hop."
                />
              </div>
            ))}
            <div>
              <label className="label" htmlFor={zone.speedKey}>
                Duree d’un defilement : {ticker[zone.speedKey]} secondes
              </label>
              <input
                id={zone.speedKey}
                type="range"
                min={20}
                max={160}
                step={5}
                value={ticker[zone.speedKey]}
                onChange={(e) => setTicker((v) => ({ ...v, [zone.speedKey]: Number(e.target.value) }))}
                className="w-full accent-[#7E1AFF]"
              />
              <p className="text-xs text-ink/50">Plus la duree est longue, plus le texte defile lentement.</p>
            </div>
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
