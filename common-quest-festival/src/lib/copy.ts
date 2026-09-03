import { getDictionary, type Dictionary } from "@/i18n";

export type CopyOverrides = Record<string, Record<string, string>>;

/** Textes du site modifiables depuis le back office. */
export const EDITABLE_COPY: { path: string; label: string; multiline?: boolean }[] = [
  { path: "hero.question", label: "Accueil, question" },
  { path: "hero.answer", label: "Accueil, réponse" },
  { path: "hero.dates", label: "Accueil, dates" },
  { path: "hero.place", label: "Accueil, lieu" },
  { path: "hero.cta", label: "Accueil, bouton principal" },
  { path: "home.introTitle", label: "Accueil, titre d’intro" },
  { path: "home.introText", label: "Accueil, texte d’intro", multiline: true },
  { path: "home.programmeText", label: "Accueil, titre du parcours" },
  { path: "home.programmeCta", label: "Accueil, bouton programme" },
  { path: "home.highlightsTitle", label: "Accueil, titre temps forts" },
  { path: "home.teamTitle", label: "Accueil, surtitre équipe" },
  { path: "home.teamText", label: "Accueil, texte équipe", multiline: true },
  { path: "home.teamCta", label: "Accueil, bouton équipe" },
  { path: "home.magmaaTitle", label: "Accueil, titre boire et manger" },
  { path: "home.magmaaText", label: "Accueil, texte boire et manger", multiline: true },
  { path: "home.magmaaCta", label: "Accueil, bouton Magmaa" },
  { path: "programme.title", label: "Programme, titre" },
  { path: "programme.intro", label: "Programme, intro", multiline: true },
  { path: "infos.title", label: "Infos, titre" },
  { path: "infos.intro", label: "Infos, intro", multiline: true },
  { path: "infos.practicalTitle", label: "Infos, titre pratique" },
  { path: "infos.teamTitle", label: "Infos, titre équipe" },
  { path: "infos.teamIntro", label: "Infos, texte équipe", multiline: true },
  { path: "event.cta", label: "Événement, bouton billetterie" },
  { path: "event.ctaSoon", label: "Événement, billetterie à venir" },
  { path: "event.ctaFree", label: "Événement, entrée libre" },
  { path: "footer.baseline", label: "Pied de page, baseline" },
  { path: "footer.prism", label: "Pied de page, mention PRISM" },
  { path: "footer.follow", label: "Pied de page, titre réseaux" },
  { path: "nav.billetterie", label: "Menu, bouton billetterie" },
  { path: "meta.title", label: "Référencement, titre de l’onglet" },
  { path: "meta.description", label: "Référencement, description", multiline: true }
];

function readPath(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], source);
}

function writePath(target: Record<string, unknown>, path: string, value: string) {
  const keys = path.split(".");
  let node = target;
  keys.slice(0, -1).forEach((key) => {
    node[key] = { ...((node[key] as Record<string, unknown>) ?? {}) };
    node = node[key] as Record<string, unknown>;
  });
  node[keys[keys.length - 1]] = value;
}

/** Valeur d origine d un texte, utilisee comme espace reserve dans le back office. */
export function defaultCopy(path: string, locale: string) {
  const value = readPath(getDictionary(locale), path);
  return typeof value === "string" ? value : "";
}

/** Fusionne les textes du back office avec le dictionnaire. */
export function mergeCopy(locale: string, overrides: CopyOverrides | null): Dictionary {
  const base = JSON.parse(JSON.stringify(getDictionary(locale))) as Record<string, unknown>;
  if (!overrides) return base as Dictionary;
  EDITABLE_COPY.forEach(({ path }) => {
    const value = overrides[path]?.[locale]?.trim();
    if (value) writePath(base, path, value);
  });
  return base as Dictionary;
}
