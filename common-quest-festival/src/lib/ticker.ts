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
