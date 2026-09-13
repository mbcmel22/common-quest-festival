"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "./ImageUploader";
import type { Partner } from "@/lib/types";

const KINDS: { value: string; label: string }[] = [
  { value: "institution", label: "Institution" },
  { value: "partenaire", label: "Partenaire" },
  { value: "lieu", label: "Lieu" },
  { value: "media", label: "Média" }
];

const blank = (): Partial<Partner> => ({
  name: "",
  logo_url: null,
  website_url: "",
  kind: "partenaire",
  sort_order: 0,
  is_published: true
});

export default function PartnersEditor() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [draft, setDraft] = useState<Partial<Partner>>(blank());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data, error } = await supabase.from("partners").select("*").order("sort_order");
    if (error) setErrorText(error.message);
    setPartners((data ?? []) as Partner[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name?.trim()) return setErrorText("Le nom est obligatoire.");
    setBusy(true);
    setErrorText(null);
    const supabase = createClient();
    const nextOrder = partners.length > 0 ? Math.max(...partners.map((p) => p.sort_order)) + 10 : 10;
    const { error } = await supabase.from("partners").insert({
      name: draft.name.trim(),
      logo_url: draft.logo_url ?? null,
      website_url: draft.website_url?.trim() || null,
      kind: draft.kind ?? "partenaire",
      sort_order: draft.sort_order || nextOrder,
      is_published: draft.is_published ?? true
    });
    setBusy(false);
    if (error) return setErrorText(error.message);
    setDraft(blank());
    load();
  }

  async function patch(id: string, values: Partial<Partner>) {
    setPartners((list) => list.map((p) => (p.id === id ? { ...p, ...values } : p)));
    const supabase = createClient();
    const { error } = await supabase.from("partners").update(values).eq("id", id);
    if (error) {
      setErrorText(error.message);
      load();
    }
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Supprimer « ${name} » de la liste des partenaires ?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("partners").delete().eq("id", id);
    if (error) return setErrorText(error.message);
    load();
  }

  /** Deplace un partenaire d un cran et reecrit les positions des deux voisins. */
  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= partners.length) return;
    const a = partners[index];
    const b = partners[target];
    const next = [...partners];
    next[index] = b;
    next[target] = a;
    setPartners(next);
    const supabase = createClient();
    await Promise.all([
      supabase.from("partners").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("partners").update({ sort_order: a.sort_order }).eq("id", b.id)
    ]);
    load();
  }

  if (loading) return <p className="text-ink/50">Chargement…</p>;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <section>
        <h2 className="font-display text-2xl uppercase">Partenaires affichés ({partners.length})</h2>
        <p className="mt-2 text-[14px] text-ink/60">
          L’ordre ci-dessous est celui du bandeau en bas de page. Décochez « Visible » pour retirer un logo du site
          sans le supprimer.
        </p>

        {partners.length === 0 && <p className="mt-8 text-ink/50">Aucun partenaire pour le moment.</p>}

        <ul className="mt-6 space-y-3">
          {partners.map((partner, index) => (
            <li
              key={partner.id}
              className="flex flex-col gap-4 rounded-2xl border border-ink/12 p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-[#170D1E] p-2">
                {partner.logo_url ? (
                  <Image src={partner.logo_url} alt={partner.name} fill sizes="112px" className="object-contain p-2" />
                ) : (
                  <span className="flex h-full items-center justify-center font-mono text-[10px] uppercase text-paper/40">
                    sans logo
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <input
                  className="field-light"
                  value={partner.name}
                  onChange={(e) => patch(partner.id, { name: e.target.value })}
                  aria-label={`Nom du partenaire ${partner.name}`}
                />
                <input
                  className="field-light"
                  placeholder="https://site-du-partenaire.fr"
                  value={partner.website_url ?? ""}
                  onChange={(e) => patch(partner.id, { website_url: e.target.value || null })}
                  aria-label={`Site de ${partner.name}`}
                />
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                <label className="flex min-h-11 cursor-pointer items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink/60">
                  <input
                    type="checkbox"
                    checked={partner.is_published !== false}
                    onChange={(e) => patch(partner.id, { is_published: e.target.checked })}
                  />
                  Visible
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Monter ${partner.name}`}
                    className="h-11 w-11 rounded-full border border-ink/15 text-ink/60 disabled:opacity-30 hover:enabled:border-ink hover:enabled:text-ink"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === partners.length - 1}
                    aria-label={`Descendre ${partner.name}`}
                    className="h-11 w-11 rounded-full border border-ink/15 text-ink/60 disabled:opacity-30 hover:enabled:border-ink hover:enabled:text-ink"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(partner.id, partner.name)}
                    aria-label={`Supprimer ${partner.name}`}
                    className="h-11 w-11 rounded-full border border-ink/15 text-ink/50 hover:border-red-600 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-ink/12 p-5 lg:sticky lg:top-8">
        <h2 className="font-display text-2xl uppercase">Ajouter un partenaire</h2>

        <div className="mt-4 rounded-xl bg-ink/5 p-4 text-[13px] leading-relaxed text-ink/70">
          <p className="font-semibold text-ink">Le logo à fournir</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>PNG avec fond transparent</li>
            <li>Logo en blanc uni, le bas de page est sombre</li>
            <li>Hauteur 200 px environ, largeur libre, 460 px au maximum</li>
            <li>Pas de marge autour du logo, elle est gérée par le site</li>
            <li>Moins de 100 Ko, 5 Mo accepté au maximum</li>
          </ul>
          <p className="mt-3">
            Un logo noir ou fourni en JPG ne sera pas lisible sur le fond du bas de page.
          </p>
        </div>

        <form onSubmit={add} className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="p-name">Nom</label>
            <input
              id="p-name"
              className="field-light"
              value={draft.name ?? ""}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="p-url">Site internet</label>
            <input
              id="p-url"
              className="field-light"
              placeholder="https://"
              value={draft.website_url ?? ""}
              onChange={(e) => setDraft({ ...draft, website_url: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="p-kind">Type</label>
            <select
              id="p-kind"
              className="field-light"
              value={draft.kind ?? "partenaire"}
              onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
            >
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>
          <ImageUploader
            value={draft.logo_url ?? null}
            onChange={(url) => setDraft({ ...draft, logo_url: url })}
            folder="partenaires"
            label="Logo"
            preview="logo"
          />
          {errorText && <p className="text-[13px] text-red-600">{errorText}</p>}
          <button type="submit" disabled={busy} className="btn-ink btn-sm w-full disabled:opacity-50">
            {busy ? "Ajout…" : "Ajouter le partenaire"}
          </button>
        </form>
      </section>
    </div>
  );
}
