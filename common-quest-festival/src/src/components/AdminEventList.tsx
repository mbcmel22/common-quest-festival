"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { formatWhen, categoryLabels } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/i18n";

export type AdminEventRow = {
  id: string;
  slug: string;
  day_index: number;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  category: string;
  is_free: boolean;
  is_pwyw: boolean;
  is_published: boolean;
  is_highlight: boolean;
  cover_url: string | null;
  translations: { locale: string; title: string }[];
};

type Filters = { day: number | null; category: string | null; price: string | null; status: string | null };

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 5 * 1024 * 1024;

export default function AdminEventList({
  locale,
  dict,
  events: initialEvents
}: {
  locale: string;
  dict: Dictionary;
  events: AdminEventRow[];
}) {
  const [events, setEvents] = useState(initialEvents);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ id: string; text: string; kind: "ok" | "ko" } | null>(null);

  function notify(id: string, text: string, kind: "ok" | "ko") {
    setFlash({ id, text, kind });
    window.setTimeout(() => setFlash(null), 2600);
  }

  /** Publication basculee directement depuis la liste, sans ouvrir la fiche. */
  async function togglePublished(event: AdminEventRow) {
    const next = !event.is_published;
    setBusyId(event.id);
    setEvents((list) => list.map((e) => (e.id === event.id ? { ...e, is_published: next } : e)));
    const supabase = createClient();
    const { error } = await supabase.from("events").update({ is_published: next }).eq("id", event.id);
    setBusyId(null);
    if (error) {
      setEvents((list) => list.map((e) => (e.id === event.id ? { ...e, is_published: !next } : e)));
      notify(event.id, error.message, "ko");
    } else {
      notify(event.id, next ? "Publié" : "Masqué", "ok");
    }
  }

  /** Remplacement du visuel a la volee, enregistre aussitot. */
  async function changeCover(event: AdminEventRow, file: File) {
    if (!ALLOWED.includes(file.type)) return notify(event.id, "Format accepté : JPG, PNG, WebP ou AVIF.", "ko");
    if (file.size > MAX_SIZE) return notify(event.id, "Image trop lourde, 5 Mo maximum.", "ko");

    setBusyId(event.id);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "jpg";
    const path = `evenements/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    if (uploadError) {
      setBusyId(null);
      return notify(event.id, uploadError.message, "ko");
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    const { error } = await supabase.from("events").update({ cover_url: data.publicUrl }).eq("id", event.id);
    setBusyId(null);
    if (error) return notify(event.id, error.message, "ko");

    setEvents((list) => list.map((e) => (e.id === event.id ? { ...e, cover_url: data.publicUrl } : e)));
    notify(event.id, "Visuel mis à jour", "ok");
  }

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>({ day: null, category: null, price: null, status: null });
  const [restored, setRestored] = useState(false);

  // Les filtres sont conserves le temps de la session : on revient
  // d une fiche evenement exactement la ou on etait.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem("cq_admin_filtres");
      if (saved) {
        const parsed = JSON.parse(saved) as { search?: string; filters?: Filters };
        if (parsed.filters) setFilters(parsed.filters);
        if (parsed.search) setSearch(parsed.search);
      }
    } catch {
      // stockage indisponible : on repart des filtres par defaut
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      window.sessionStorage.setItem("cq_admin_filtres", JSON.stringify({ search, filters }));
    } catch {
      // rien a faire, les filtres ne seront simplement pas memorises
    }
  }, [search, filters, restored]);

  const titleOf = (event: AdminEventRow) =>
    event.translations?.find((t) => t.locale === locale)?.title ?? event.translations?.[0]?.title ?? event.slug;

  const categories = useMemo(() => Array.from(new Set(events.map((e) => e.category))), [events]);

  const priceOf = (event: AdminEventRow) => (event.is_free ? "gratuit" : event.is_pwyw ? "libre" : "payant");

  const filtered = events.filter((event) => {
    const haystack = `${titleOf(event)} ${event.slug} ${event.venue ?? ""}`.toLowerCase();
    return (
      (!search.trim() || haystack.includes(search.trim().toLowerCase())) &&
      (filters.day === null || event.day_index === filters.day) &&
      (filters.category === null || event.category === filters.category) &&
      (filters.price === null || priceOf(event) === filters.price) &&
      (filters.status === null ||
        (filters.status === "en-ligne" && event.is_published) ||
        (filters.status === "brouillon" && !event.is_published) ||
        (filters.status === "avant" && event.is_highlight))
    );
  });

  const chip = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
      active ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink/70 hover:border-ink"
    }`;

  const priceLabels: Record<string, string> = {
    gratuit: dict.programme.free,
    libre: dict.programme.pwyw,
    payant: dict.programme.paid
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="display-l">{dict.admin.events}</h1>
        <Link href={`/${locale}/admin/evenements/nouveau`} className="btn-ink btn-sm">
          {dict.admin.newEvent}
        </Link>
      </div>

      {/* Filtres : recherche libre puis journée, discipline, tarif et statut */}
      <div className="mt-8 space-y-3 rounded-2xl border border-ink/12 bg-white p-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un événement, un lieu ou une adresse de page"
          className="field-light"
          aria-label="Rechercher un événement"
        />
        <div className="flex flex-wrap gap-2">
          <button className={chip(filters.day === null)} onClick={() => setFilters((f) => ({ ...f, day: null }))}>
            {dict.programme.allDays}
          </button>
          {dict.common.days.map((day, i) => (
            <button key={day} className={chip(filters.day === i + 1)} onClick={() => setFilters((f) => ({ ...f, day: i + 1 }))}>
              {day}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={chip(filters.category === null)} onClick={() => setFilters((f) => ({ ...f, category: null }))}>
            {dict.programme.allCategories}
          </button>
          {categories.map((cat) => (
            <button key={cat} className={chip(filters.category === cat)} onClick={() => setFilters((f) => ({ ...f, category: cat }))}>
              {categoryLabels[locale][cat]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={chip(filters.price === null)} onClick={() => setFilters((f) => ({ ...f, price: null }))}>
            {dict.programme.allPrices}
          </button>
          {["gratuit", "libre", "payant"].map((key) => (
            <button key={key} className={chip(filters.price === key)} onClick={() => setFilters((f) => ({ ...f, price: key }))}>
              {priceLabels[key]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={chip(filters.status === null)} onClick={() => setFilters((f) => ({ ...f, status: null }))}>
            Tous les statuts
          </button>
          <button className={chip(filters.status === "en-ligne")} onClick={() => setFilters((f) => ({ ...f, status: "en-ligne" }))}>
            {dict.admin.published}
          </button>
          <button className={chip(filters.status === "brouillon")} onClick={() => setFilters((f) => ({ ...f, status: "brouillon" }))}>
            {dict.admin.draft}
          </button>
          <button className={chip(filters.status === "avant")} onClick={() => setFilters((f) => ({ ...f, status: "avant" }))}>
            Mis en avant
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[13px] text-ink/50">
            {filtered.length} événement{filtered.length > 1 ? "s" : ""} sur {events.length}
          </p>
          {(search || filters.day || filters.category || filters.price || filters.status) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilters({ day: null, category: null, price: null, status: null });
              }}
              className="text-[13px] text-violet underline underline-offset-4"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      <ul className="mt-6 divide-y divide-ink/10 rounded-2xl border border-ink/12 bg-white">
        {filtered.map((event) => (
          <li key={event.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap sm:p-5">
            {/* Vignette : survolez pour remplacer le visuel sans ouvrir la fiche */}
            <label
              className="group relative h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-ink/15 bg-ink/5"
              title="Changer le visuel"
            >
              {event.cover_url ? (
                <Image src={event.cover_url} alt="" fill sizes="96px" className="object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-[11px] text-ink/40">Aucun</span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-ink/70 text-[11px] font-medium uppercase tracking-[0.08em] text-acid opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                {busyId === event.id ? "..." : "Changer"}
              </span>
              <input
                type="file"
                accept={ALLOWED.join(",")}
                className="sr-only"
                disabled={busyId === event.id}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) changeCover(event, file);
                  e.target.value = "";
                }}
              />
            </label>

            <div className="min-w-0 flex-1">
              <p className="font-display text-lg uppercase">{titleOf(event)}</p>
              <p className="text-[14px] text-ink/60">
                {formatWhen(event.event_date, event.start_time, event.end_time, locale)}
                {event.venue ? `. Lieu : ${event.venue}` : ""}
              </p>
              {flash?.id === event.id && (
                <p className={`mt-1 text-[13px] ${flash.kind === "ok" ? "text-violet" : "text-red-600"}`} role="status">
                  {flash.text}
                </p>
              )}
            </div>

            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
              {/* Interrupteur de publication, enregistre immediatement */}
              <button
                type="button"
                role="switch"
                aria-checked={event.is_published}
                aria-label={event.is_published ? "Masquer cette page" : "Publier cette page"}
                disabled={busyId === event.id}
                onClick={() => togglePublished(event)}
                className="flex items-center gap-2 disabled:opacity-50"
              >
                <span
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    event.is_published ? "bg-violet" : "bg-ink/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                      event.is_published ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </span>
                <span className="text-[13px] text-ink/70">
                  {event.is_published ? dict.admin.published : "Masqué"}
                </span>
              </button>

              <Link href={`/${locale}/admin/evenements/${event.id}`} className="btn-ink btn-sm">
                {dict.admin.edit}
              </Link>
            </div>
          </li>
        ))}
        {filtered.length === 0 && <li className="p-8 text-center text-ink/50">Aucun événement ne correspond.</li>}
      </ul>
    </div>
  );
}
