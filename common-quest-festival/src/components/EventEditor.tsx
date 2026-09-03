"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "./ImageUploader";
import { categoryLabels } from "@/lib/format";
import { locales, type Locale, type Dictionary } from "@/i18n";
import { SOCIAL_KEYS, SOCIAL_LABELS, normalizeSocialGroups, type SocialGroup } from "./SocialLinks";

const CATEGORIES = [
  "soiree",
  "atelier",
  "workshop",
  "dj",
  "graffiti",
  "rap",
  "danse",
  "talk",
  "projection",
  "scene_ouverte",
  "autre"
] as const;

type TranslationFields = {
  title: string;
  tagline: string;
  description: string;
  practical_info: string;
  event_type: string;
  partner_note: string;
  lineup_note: string;
};
type Translations = Record<string, TranslationFields>;

const emptyTranslations = (): Translations =>
  Object.fromEntries(
    locales.map((l) => [
      l,
      { title: "", tagline: "", description: "", practical_info: "", event_type: "", partner_note: "", lineup_note: "" }
    ])
  ) as Translations;

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videos, setVideos] = useState<string[]>([""]);
  const [socialGroups, setSocialGroups] = useState<SocialGroup[]>([{ label: "", links: {} }]);
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
    photo_credit: "",
    is_published: false,
    is_highlight: false
  });

  useEffect(() => {
    if (isNew) return;
    const supabase = createClient();
    supabase
      .from("events")
      .select("*, translations:event_translations(*)")
      .eq("id", eventId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const { translations: rows, id, created_at, updated_at, ...rest } = data as any;
          setEvent({
            ...rest,
            start_time: rest.start_time?.slice(0, 5) ?? "",
            end_time: rest.end_time?.slice(0, 5) ?? "",
            doors_time: rest.doors_time?.slice(0, 5) ?? "",
            venue: rest.venue ?? "",
            photo_credit: rest.photo_credit ?? "",
            address: rest.address ?? "",
            price_label: rest.price_label ?? "",
            ticket_url: rest.ticket_url ?? "",
            video_url: rest.video_url ?? ""
          });
          const storedVideos = Array.isArray(rest.video_urls) ? (rest.video_urls as string[]) : [];
          const legacy = rest.video_url ? [rest.video_url as string] : [];
          setVideos(storedVideos.length > 0 ? storedVideos : legacy.length > 0 ? legacy : [""]);
          setSocialGroups(normalizeSocialGroups(rest.social_links));

          const next = emptyTranslations();
          (rows ?? []).forEach((row: any) => {
            next[row.locale] = {
              title: row.title ?? "",
              tagline: row.tagline ?? "",
              description: row.description ?? "",
              practical_info: row.practical_info ?? "",
              event_type: row.event_type ?? "",
              partner_note: row.partner_note ?? "",
              lineup_note: row.lineup_note ?? ""
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
    setErrorMessage(null);
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
      social_links: socialGroups
        .map((group) => ({
          label: group.label.trim(),
          links: Object.fromEntries(
            Object.entries(group.links)
              .map(([key, url]) => [key, (url ?? "").trim()])
              .filter(([, url]) => (url as string).length > 0)
          )
        }))
        .filter((group) => Object.keys(group.links).length > 0),
      day_index: Number(event.day_index)
    };

    // Sur une mise a jour, l identifiant est deja connu : inutile de demander
    // a la base de renvoyer la ligne, ce retour peut etre filtre par les
    // regles de securite et faire echouer l enregistrement pour rien.
    let savedId = eventId;

    if (isNew) {
      const { data, error } = await supabase.from("events").insert(payload).select("id").single();
      if (error || !data) {
        setErrorMessage(error?.message ?? "Création impossible.");
        return setState("error");
      }
      savedId = data.id;
    } else {
      const { error } = await supabase.from("events").update(payload).eq("id", eventId);
      if (error) {
        setErrorMessage(error.message);
        return setState("error");
      }
    }

    const rows = locales
      .filter((l) => translations[l].title.trim().length > 0)
      .map((l) => ({ event_id: savedId, locale: l, ...translations[l] }));

    if (rows.length > 0) {
      const { error: tError } = await supabase.from("event_translations").upsert(rows, { onConflict: "event_id,locale" });
      if (tError) {
        setErrorMessage(tError.message);
        return setState("error");
      }
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
            <label className="label" htmlFor="event-type">Type d’événement</label>
            <input
              id="event-type"
              className="field-light"
              value={translations[tab].event_type}
              onChange={(e) => setTranslation("event_type", e.target.value)}
              placeholder="Battle de danse"
              maxLength={60}
            />
          </div>
          <div>
            <label className="label" htmlFor="partner-note">Mention particulière</label>
            <input
              id="partner-note"
              className="field-light"
              value={translations[tab].partner_note}
              onChange={(e) => setTranslation("partner_note", e.target.value)}
              placeholder="Co-organisé par PRISM, la SAMOA et Nantes Université"
              maxLength={160}
            />
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
            <label className="label" htmlFor="lineup-note">Line-up, texte libre</label>
            <textarea
              id="lineup-note"
              rows={3}
              className="field-light"
              value={translations[tab].lineup_note}
              onChange={(e) => setTranslation("lineup_note", e.target.value)}
              placeholder="TBA"
              maxLength={1000}
            />
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
          <div>
            <label className="label" htmlFor="photo-credit">Crédit de la photo d’entête</label>
            <input
              id="photo-credit"
              className="field-light"
              value={event.photo_credit}
              onChange={(e) => setField("photo_credit", e.target.value)}
              placeholder="Prénom Nom"
              maxLength={120}
            />
          </div>
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
                  <option key={c} value={c}>
                    {categoryLabels[locale]?.[c] ?? c}
                  </option>
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
            <p className="mb-3 text-xs text-ink/50">
              Un bloc par artiste. Le titre s’affiche au-dessus des icônes, par exemple « Suivez Factor X ». Seuls les
              champs remplis apparaissent.
            </p>

            <div className="space-y-4">
              {socialGroups.map((group, index) => (
                <div key={index} className="rounded-xl border border-ink/15 p-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="label" htmlFor={`social-label-${index}`}>
                        Titre du bloc
                      </label>
                      <input
                        id={`social-label-${index}`}
                        className="field-light"
                        value={group.label}
                        onChange={(e) =>
                          setSocialGroups((list) =>
                            list.map((g, i) => (i === index ? { ...g, label: e.target.value } : g))
                          )
                        }
                        placeholder="Suivez Factor X"
                        maxLength={80}
                      />
                    </div>
                    {socialGroups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSocialGroups((list) => list.filter((_, i) => i !== index))}
                        className="mb-1 shrink-0 rounded-full border border-ink/20 px-3 py-2 text-[13px] text-ink/60 transition-colors hover:border-red-500 hover:text-red-600"
                      >
                        Retirer
                      </button>
                    )}
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {SOCIAL_KEYS.map((key) => (
                      <div key={key}>
                        <label className="label" htmlFor={`social-${index}-${key}`}>
                          {SOCIAL_LABELS[key]}
                        </label>
                        <input
                          id={`social-${index}-${key}`}
                          type="url"
                          className="field-light"
                          value={group.links[key] ?? ""}
                          onChange={(e) =>
                            setSocialGroups((list) =>
                              list.map((g, i) =>
                                i === index ? { ...g, links: { ...g.links, [key]: e.target.value } } : g
                              )
                            )
                          }
                          placeholder="https://..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSocialGroups((list) => [...list, { label: "", links: {} }])}
              className="mt-3 rounded-full border border-ink/20 px-4 py-1.5 text-[13px] transition-colors hover:border-violet hover:text-violet"
            >
              Ajouter un artiste
            </button>
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
          <div>
            <label className="label" htmlFor="slug">Adresse de la page</label>
            <input
              id="slug"
              className="field-light"
              value={event.slug}
              onChange={(e) => setField("slug", e.target.value)}
              placeholder="généré depuis le titre"
            />
            <p className="mt-1 text-xs text-ink/50">
              Les événements se classent automatiquement par date puis par heure de début.
            </p>
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
          {state === "error" && (
            <span className="text-sm text-red-600">
              {errorMessage ?? dict.common.error}
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
