export type TickerSetting = {
  home?: Record<string, string>;
  infos?: Record<string, string>;
  speed_home?: number;
  speed_infos?: number;
  fr?: string;
  en?: string;
  es?: string;
};

/** Recupere le texte de banderole, avec repli sur l ancien format puis sur le dictionnaire. */
export const DEFAULT_SLOGAN = "What do we have in common ? Hip hop.";

export function pickTicker(
  setting: TickerSetting | null,
  zone: "home" | "infos",
  locale: string,
  fallback: string = DEFAULT_SLOGAN
) {
  const zoned = setting?.[zone]?.[locale]?.trim();
  if (zoned) return zoned;
  const legacy = setting?.[locale as "fr" | "en" | "es"];
  if (typeof legacy === "string" && legacy.trim()) return legacy.trim();
  return fallback;
}

/** Lien de don libre, remplacable dans Reglages. */
export const DEFAULT_SUPPORT_URL =
  "https://www.billetweb.fr/don-libre-soutien-a-la-premiere-edition-du-festival-common-quest?multi=u289326&margin=no_margin&ref=u289326&color=635BFF&parent=1";

/** Billetterie generale du festival, remplacable dans Reglages. */
export const DEFAULT_TICKET_URL = "https://www.billetweb.fr/multi_event.php?multi=u289326";

/**
 * Ajoute le parametre de suivi Billetweb ("event_src") a une URL de billetterie.
 * Le nom transmis doit correspondre EXACTEMENT (casse comprise) a un promoteur
 * cree dans Billetweb : Options > Suivi organisateur > Mes promoteurs.
 * Une source non enregistree ne casse rien : la vente est simplement comptee
 * sans source identifiee, comme avant.
 */
export function withTicketSource(url: string, source: string): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("event_src", source);
    return u.toString();
  } catch {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}event_src=${encodeURIComponent(source)}`;
  }
}
