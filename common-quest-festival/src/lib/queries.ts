import { createClient } from "@/lib/supabase/server";
import { mergeCopy, type CopyOverrides } from "@/lib/copy";
import type { Dictionary } from "@/i18n";
import type { EventRow, EventTranslation, EventWithTranslation, TeamMember, Partner, Artist } from "@/lib/types";

type RawEvent = EventRow & { translations: EventTranslation[] };

function pickTranslation(translations: EventTranslation[] | null, locale: string) {
  if (!translations?.length) return null;
  return translations.find((t) => t.locale === locale) ?? translations.find((t) => t.locale === "fr") ?? translations[0];
}

export async function getEvents(locale: string, options?: { onlyHighlights?: boolean }) {
  try {
  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select("*, translations:event_translations(*)")
    .eq("is_published", true)
    .order("day_index", { ascending: true })
    .order("sort_order", { ascending: true });

  if (options?.onlyHighlights) query = query.eq("is_highlight", true);

  const { data, error } = await query;
  if (error || !data) return [] as EventWithTranslation[];

  return (data as RawEvent[]).map((row) => ({
    ...row,
    t: pickTranslation(row.translations, locale)
  })) as EventWithTranslation[];
  } catch {
    // Base injoignable : le site reste debout avec un programme vide.
    return [] as EventWithTranslation[];
  }
}

export async function getEvent(slug: string, locale: string) {
  try {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*, translations:event_translations(*), event_artists(billing, sort_order, artists(*))")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) return null;
  const row = data as RawEvent & { event_artists: { billing: string; sort_order: number; artists: Artist }[] };
  return {
    ...row,
    t: pickTranslation(row.translations, locale),
    artists: (row.event_artists ?? []).sort((a, b) => a.sort_order - b.sort_order).map((ea) => ea.artists)
  };
  } catch {
    return null;
  }
}

export async function getTeam() {
  try {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as TeamMember[];
  } catch {
    return [] as TeamMember[];
  }
}

export async function getPartners() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("partners").select("*").order("sort_order", { ascending: true });
    return (data ?? []) as Partner[];
  } catch {
    return [] as Partner[];
  }
}

export async function getSetting<T = Record<string, string>>(key: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
    return (data?.value ?? null) as T | null;
  } catch {
    return null;
  }
}

export async function getSessionContext() {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return { user: null, isAdmin: false, profile: null };
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    return { user, profile, isAdmin: !!profile && ["admin", "editor"].includes(profile.role) };
  } catch {
    return { user: null, isAdmin: false, profile: null };
  }
}

/** Dictionnaire enrichi des textes saisis dans le back office. */
export async function getDict(locale: string): Promise<Dictionary> {
  const overrides = await getSetting<CopyOverrides>("copy");
  return mergeCopy(locale, overrides);
}

/** Echelle typographique reglable dans le back office, 1 = taille de reference. */
export async function getTypeScale() {
  const typography = await getSetting<{ scale?: number }>("typography");
  const scale = Number(typography?.scale ?? 1);
  return Number.isFinite(scale) ? Math.min(1.4, Math.max(0.8, scale)) : 1;
}
