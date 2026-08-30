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
  fr: { danse: "Danse", rap: "Rap", graffiti: "Graffiti", dj: "DJing", atelier: "Atelier", talk: "Talk", soiree: "Soiree", autre: "Autre" },
  en: { danse: "Dance", rap: "Rap", graffiti: "Graffiti", dj: "DJing", atelier: "Workshop", talk: "Talk", soiree: "Night", autre: "Other" },
  es: { danse: "Danza", rap: "Rap", graffiti: "Grafiti", dj: "DJing", atelier: "Taller", talk: "Charla", soiree: "Noche", autre: "Otro" }
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
