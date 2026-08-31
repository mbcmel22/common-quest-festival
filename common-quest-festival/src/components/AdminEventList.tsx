"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatWhen, categoryLabels } from "@/lib/format";
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
  translations: { locale: string; title: string }[];
};

type Filters = { day: number | null; category: string | null; price: string | null; status: string | null };

export default function AdminEventList({
  locale,
  dict,
  events
}: {
  locale: string;
  dict: Dictionary;
  events: AdminEventRow[];
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>({ day: null, category: null, price: null, status: null });

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
          placeholder="Rechercher un événement, un lieu, une adresse de page"
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
        <p className="text-[13px] text-ink/50">
          {filtered.length} événement{filtered.length > 1 ? "s" : ""} sur {events.length}
        </p>
      </div>

      <ul className="mt-6 divide-y divide-ink/10 rounded-2xl border border-ink/12 bg-white">
        {filtered.map((event) => (
          <li key={event.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="font-display text-lg uppercase">{titleOf(event)}</p>
              <p className="text-[14px] text-ink/60">
                {formatWhen(event.event_date, event.start_time, event.end_time, locale)}
                {event.venue ? `. Lieu : ${event.venue}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-[12px] ${
                  event.is_published ? "bg-violet text-white" : "bg-ink/10 text-ink/60"
                }`}
              >
                {event.is_published ? dict.admin.published : dict.admin.draft}
              </span>
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
