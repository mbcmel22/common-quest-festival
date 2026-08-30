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
export function pickTicker(
  setting: TickerSetting | null,
  zone: "home" | "infos",
  locale: string,
  fallback: string
) {
  const zoned = setting?.[zone]?.[locale]?.trim();
  if (zoned) return zoned;
  const legacy = setting?.[locale as "fr" | "en" | "es"];
  if (typeof legacy === "string" && legacy.trim()) return legacy.trim();
  return fallback;
}
