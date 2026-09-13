import type { Metadata } from "next";
import { locales } from "@/i18n";

/**
 * Canonical et hreflang pour une page donnee.
 * Le canonical doit etre declare page par page : s il est pose une seule fois dans le layout,
 * toutes les pages annoncent l accueil comme original et sortent de l index.
 * @param locale langue courante
 * @param path chemin sans le prefixe de langue, par exemple "/programme"
 */
export function alternatesFor(locale: string, path = ""): Metadata["alternates"] {
  const clean = path && !path.startsWith("/") ? `/${path}` : path;
  return {
    canonical: `/${locale}${clean}`,
    languages: Object.fromEntries(locales.map((l) => [l, `/${l}${clean}`]))
  };
}
