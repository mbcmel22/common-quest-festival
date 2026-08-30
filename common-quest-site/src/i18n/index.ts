import { fr, type Dictionary } from "./fr";
import { en } from "./en";
import { es } from "./es";

export const locales = ["fr", "en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

const dictionaries: Record<Locale, Dictionary> = { fr, en, es };

export function getDictionary(locale: string): Dictionary {
  return dictionaries[(locale as Locale) in dictionaries ? (locale as Locale) : defaultLocale];
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const localeLabels: Record<Locale, string> = { fr: "FR", en: "EN", es: "ES" };
export type { Dictionary };
