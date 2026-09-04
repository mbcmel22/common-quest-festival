/** "20:00:00" devient "20h00" en francais, "8:00 PM" ailleurs. */
export function formatTime(value: string | null, locale: string) {
  if (!value) return null;
  const [h, m] = value.split(":");
  if (locale === "fr") return `${h}h${m}`;
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m} ${suffix}`;
}

export function formatRange(start: string | null, end: string | null, locale: string) {
  const s = formatTime(start, locale);
  const e = formatTime(end, locale);
  if (s && e) return `${s} > ${e}`;
  return s ?? e ?? "";
}

export const categoryLabels: Record<string, Record<string, string>> = {
  fr: {
    soiree: "Soirées",
    atelier: "Ateliers",
    workshop: "Workshops",
    dj: "DJ set",
    graffiti: "Street art",
    rap: "Rap",
    danse: "Danse",
    talk: "Talks",
    projection: "Projection",
    scene_ouverte: "Scène ouverte",
    autre: "Autre"
  },
  en: {
    soiree: "Nights",
    atelier: "Sessions",
    workshop: "Workshops",
    dj: "DJ set",
    graffiti: "Street art",
    rap: "Rap",
    danse: "Dance",
    talk: "Talks",
    projection: "Screening",
    scene_ouverte: "Open mic",
    autre: "Other"
  },
  es: {
    soiree: "Fiestas",
    atelier: "Talleres",
    workshop: "Workshops",
    dj: "DJ set",
    graffiti: "Arte urbano",
    rap: "Rap",
    danse: "Danza",
    talk: "Charlas",
    projection: "Proyección",
    scene_ouverte: "Micro abierto",
    autre: "Otro"
  }
};

/** Regles de robustesse du mot de passe, verifiees aussi cote Supabase. */
export function passwordIssues(password: string) {
  const issues: string[] = [];
  if (password.length < 12) issues.push("length");
  if (!/[a-z]/.test(password)) issues.push("lower");
  if (!/[A-Z]/.test(password)) issues.push("upper");
  if (!/[0-9]/.test(password)) issues.push("digit");
  return issues;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

const whenWords: Record<string, { from: string; to: string }> = {
  fr: { from: "de", to: "à" },
  en: { from: "from", to: "to" },
  es: { from: "de", to: "a" }
};

/** "Jeu 01/10 de 19H00 à 01H00" en francais, adapte a la langue affichee. */
export function formatWhen(eventDate: string, start: string | null, end: string | null, locale: string) {
  const date = new Date(`${eventDate}T12:00:00`);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" })
    .format(date)
    .replace(".", "");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const head = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day}/${month}`;

  const words = whenWords[locale] ?? whenWords.fr;
  const s = formatTime(start, locale);
  const e = formatTime(end, locale);
  if (s && e) return `${head} ${words.from} ${s.toUpperCase()} ${words.to} ${e.toUpperCase()}`;
  if (s) return `${head} ${words.from} ${s.toUpperCase()}`;
  return head;
}
