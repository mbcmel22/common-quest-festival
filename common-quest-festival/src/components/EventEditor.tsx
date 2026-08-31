"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "./ImageUploader";
import { locales, type Locale, type Dictionary } from "@/i18n";
import { SOCIAL_KEYS, SOCIAL_LABELS } from "./SocialLinks";

const CATEGORIES = ["danse", "rap", "graffiti", "dj", "atelier", "talk", "soiree", "autre"] as const;

type Translations = Record<string, { title: string; tagline: string; description: string; practical_info: string }>;

const emptyTranslations = (): Translations =>
  Object.fromEntries(locales.map((l) => [l, { title: "", tagline: "", description: "", practical_info: "" }])) as Translations;

export default function EventEditor({
  eventId,
  locale,
  dict
}: {
  eventId: string;
  locale: Locale;
  dict: Dictionary;
}) {
  const router = useRouter();
  const isNew = eventId === "nouveau";
  const [loading, setLoading] = useState(!isNew);
  const [tab, setTab] = useState<Locale>(locale);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [videos, setVideos] = useState<string[]>([""]);
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [translations, setTranslations] = useState<Translations>(emptyTranslations());
  const [event, setEvent] = useState({
    slug: "",
    day_index: 1,
    event_date: "2026-10-01",
    start_time: "",
    end_time: "",
    doors_time: "",
    category: "autre",
    venue: "",
    address: "",
    price_label: "",
    ticket_url: "",
    video_url: "",
    is_free: false,
    is_pwyw: false,
    cover_url: null as string | null,
    is_published: false,
    is_highlight: false,
    sort_order: 0
  });

  useEffect(() => {
    if (isNew) return;
    const supabase = createClient();
    supabase
      .from("events")
      .select("*, translations:event_translations(*)")
      .eq("id", eventId)
      .single()
      .then(({ data }) => {
        if (data) {
          const { translations: rows, id, created_at, updated_at, ...rest } = data as any;
          setEvent({
            ...rest,
            start_time: rest.start_time?.slice(0, 5) ?? "",
            end_time: rest.end_time?.slice(0, 5) ?? "",
            doors_time: rest.doors_time?.slice(0, 5) ?? "",
            venue: rest.venue ?? "",
            address: rest.address ?? "",
            price_label: rest.price_label ?? "",
            ticket_url: rest.ticket_url ?? "",
            video_url: rest.video_url ?? ""
          });
          const storedVideos = Array.isArray(rest.video_urls) ? (rest.video_urls as string[]) : [];
          const legacy = rest.video_url ? [rest.video_url as string] : [];
          setVideos(storedVideos.length > 0 ? storedVideos : legacy.length > 0 ? legacy : [""]);
          setSocials((rest.social_links as Record<string, string>) ?? {});

          const next = emptyTranslations();
          (rows ?? []).forEach((row: any) => {
            next[row.locale] = {
              title: row.title ?? "",
              tagline: row.tagline ?? "",
              description: row.description ?? "",
              practical_info: row.practical_info ?? ""
            };
          });
          setTranslations(next);
        }
        setLoading(false);
      });
  }, [eventId, isNew]);

  function setField<K extends keyof typeof event>(key: K, value: (typeof event)[K]) {
    setEvent((prev) => ({ ...prev, [key]: value }));
  }

  function setTranslation(field: keyof Translations[string], value: string) {
    setTranslations((prev) => ({ ...prev, [tab]: { ...prev[tab], [field]: value } }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    const supabase = createClient();

    const slug =
      event.slug.trim() ||
      translations.fr.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const payload = {
      ...event,
      slug,
      start_time: event.start_time || null,
      end_time: event.end_time || null,
      doors_time: event.doors_time || null,
      ticket_url: event.ticket_url || null,
      video_urls: videos.map((url) => url.trim()).filter(Boolean),
      social_links: Object.fromEntries(
        Object.entries(socials)
          .map(([key, url]) => [key, url.trim()])
          .filter(([, url]) => url.length > 0)
      ),
      day_index: Number(event.day_index),
      sort_order: Number(event.sort_order)
    };

    const { data, error } = isNew
      ? await supabase.from("events").insert(payload).select("id").single()
      : await supabase.from("events").update(payload).eq("id", eventId).select("id").single();

    if (error || !data) return setState("error");

    const rows = locales
      .filter((l) => translations[l].title.trim().length > 0)
      .map((l) => ({ event_id: data.id, locale: l, ...translations[l] }));

    if (rows.length > 0) {
      const { error: tError } = await supabase.from("event_translations").upsert(rows, { onConflict: "event_id,locale" });
      if (tError) return setState("error");
    }

    setState("saved");
    router.push(`/${locale}/admin/evenements`);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(dict.admin.confirmDelete)) return;
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", eventId);
    router.push(`/${locale}/admin/evenements`);
    router.refresh();
  }

  if (loading) return <p className="text-ink/50">{dict.common.loading}</p>;

  return (
    <form onSubmit={save} className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      {/* Traductions */}
      <div className="rounded-2xl border border-ink/12 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="display-m">{dict.admin.langTabs}</h2>
          <div className="flex gap-1">
            {locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setTab(l)}
                className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase ${
                  tab === l ? "bg-ink text-paper" : "bg-ink/8 text-ink/60"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="title">Titre</label>
            <input id="title" className="field-light" value={translations[tab].title} onChange={(e) => setTranslation("title", e.target.value)} maxLength={120} />
          </div>
          <div>
            <label className="label" htmlFor="tagline">Accroche</label>
            <input id="tagline" className="field-light" value={translations[tab].tagline} onChange={(e) => setTranslation("tagline", e.target.value)} maxLength={180} />
          </div>
          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" rows={7} className="field-light" value={translations[tab].description} onChange={(e) => setTranslation("description", e.target.value)} maxLength={4000} />
          </div>
          <div>
            <label className="label" htmlFor="practical">Bon à savoir</label>
            <textarea id="practical" rows={3} className="field-light" value={translations[tab].practical_info} onChange={(e) => setTranslation("practical_info", e.target.value)} maxLength={1000} />
          </div>
        </div>
      </div>

      {/* Réglages de l’événement */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-ink/12 bg-white p-6 space-y-4">
          <ImageUploader
            label="Visuel de l’événement"
            value={event.cover_url}
            folder="evenements"
            onChange={(url) => setField("cover_url", url)}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="day">Journee</label>
              <select id="day" className="field-light" value={event.day_index} onChange={(e) => setField("day_index", Number(e.target.value))}>
                {dict.common.days.map((day, i) => (
                  <option key={day} value={i + 1}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="category">Discipline</label>
              <select id="category" className="field-light" value={event.category} onChange={(e) => setField("category", e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="start">Début</label>
              <input id="start" type="time" className="field-light" value={event.start_time} onChange={(e) => setField("start_time", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="end">Fin</label>
              <input id="end" type="time" className="field-light" value={event.end_time} onChange={(e) => setField("end_time", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="doors">Ouverture des portes</label>
              <input id="doors" type="time" className="field-light" value={event.doors_time} onChange={(e) => setField("doors_time", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="date">Date</label>
              <input id="date" type="date" className="field-light" value={event.event_date} onChange={(e) => setField("event_date", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="venue">Lieu</label>
            <input id="venue" className="field-light" value={event.venue} onChange={(e) => setField("venue", e.target.value)} maxLength={120} />
          </div>
          <div>
            <label className="label" htmlFor="address">Adresse</label>
            <input id="address" className="field-light" value={event.address} onChange={(e) => setField("address", e.target.value)} maxLength={160} />
          </div>
        </div>

        <div className="rounded-2xl border border-ink/12 bg-white p-6 space-y-4">
          <div>
            <label className="label" htmlFor="price">Tarifs affichés</label>
            <input id="price" className="field-light" value={event.price_label} onChange={(e) => setField("price_label", e.target.value)} placeholder="18 EUR prevente / 22 EUR sur place" maxLength={120} />
          </div>
          <div>
            <label className="label" htmlFor="ticket">Lien billetterie</label>
            <input id="ticket" type="url" className="field-light" value={event.ticket_url} onChange={(e) => setField("ticket_url", e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <span className="label">Liens YouTube</span>
            <p className="mb-2 text-xs text-ink/50">
              Aftermovie, clip, teaser. Les vidéos s’affichent les unes sous les autres, dans cet ordre.
            </p>
            <div className="space-y-2">
              {videos.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    className="field-light"
                    value={url}
                    onChange={(e) => setVideos((list) => list.map((v, i) => (i === index ? e.target.value : v)))}
                    placeholder="https://www.youtube.com/watch?v=..."
                    aria-label={`Lien YouTube ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => setVideos((list) => (list.length === 1 ? [""] : list.filter((_, i) => i !== index)))}
                    className="shrink-0 rounded-full border border-ink/20 px-3 text-[13px] text-ink/60 transition-colors hover:border-red-500 hover:text-red-600"
                    aria-label={`Retirer le lien ${index + 1}`}
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setVideos((list) => [...list, ""])}
              className="mt-2 rounded-full border border-ink/20 px-4 py-1.5 text-[13px] transition-colors hover:border-violet hover:text-violet"
            >
              Ajouter une vidéo
            </button>
          </div>

          <div>
            <span className="label">Réseaux sociaux de l’événement</span>
            <p className="mb-2 text-xs text-ink/50">
              Comptes des artistes ou du collectif invité. Chaque lien rempli devient une icône sur la fiche.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SOCIAL_KEYS.map((key) => (
                <div key={key}>
                  <label className="label" htmlFor={`event-social-${key}`}>
                    {SOCIAL_LABELS[key]}
                  </label>
                  <input
                    id={`event-social-${key}`}
                    type="url"
                    className="field-light"
                    value={socials[key] ?? ""}
                    onChange={(e) => setSocials((v) => ({ ...v, [key]: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={event.is_free} onChange={(e) => setField("is_free", e.target.checked)} className="h-4 w-4 accent-[#7E1AFF]" />
            Entrée gratuite
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={event.is_pwyw}
              onChange={(e) => setField("is_pwyw", e.target.checked)}
              className="h-4 w-4 accent-[#7E1AFF]"
            />
            Prix libre, le public donne ce qu’il veut
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={event.is_highlight} onChange={(e) => setField("is_highlight", e.target.checked)} className="h-4 w-4 accent-[#7E1AFF]" />
            Mettre en avant sur l’accueil
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={event.is_published} onChange={(e) => setField("is_published", e.target.checked)} className="h-4 w-4 accent-[#7E1AFF]" />
            Publier sur le site
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="slug">Adresse de la page</label>
              <input id="slug" className="field-light" value={event.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="genere depuis le titre" />
            </div>
            <div>
              <label className="label" htmlFor="order">Ordre d’affichage</label>
              <input id="order" type="number" className="field-light" value={event.sort_order} onChange={(e) => setField("sort_order", Number(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="btn-ink" disabled={state === "saving"}>
            {state === "saving" ? dict.admin.saving : dict.admin.save}
          </button>
          {!isNew && (
            <button type="button" onClick={remove} className="font-mono text-[11px] uppercase tracking-[0.14em] text-red-600 hover:underline">
              {dict.admin.delete}
            </button>
          )}
          {state === "error" && <span className="text-sm text-red-600">{dict.common.error}</span>}
        </div>
      </div>
    </form>
  );
}
