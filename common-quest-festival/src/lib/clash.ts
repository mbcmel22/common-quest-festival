/** Clash Crews Nantais : types et calculs partages par le jury, le public et le back office. */

export const CREWS = [
  { key: "n1" as const, name: "N+1" },
  { key: "f4" as const, name: "4FEYDER" }
];
export type CrewKey = "n1" | "f4";

export type ClashRound = {
  id: number;
  label: string;
  criteria: string[];
  jury_open: boolean;
  public_open: boolean;
  public_closes_at: string | null;
  screen_code: string;
};

export type ClashScore = {
  round_id: number;
  juror_id: string;
  scores_n1: number[];
  scores_f4: number[];
  validated: boolean;
};

export const POINTS_PUBLIC = 20;

/** Somme des quatre criteres d un jure, sur 40. */
export const totalJure = (scores: number[]) => scores.reduce((a, b) => a + (b || 0), 0);

/**
 * Repartition des 20 points du public selon la part des votes.
 * Le score du N+1 est arrondi, le 4FEYDER recoit le complement : le total
 * fait toujours 20, meme en cas d arrondi. Sans aucun vote, 10 partout.
 */
export function pointsPublic(votesN1: number, votesF4: number): { n1: number; f4: number } {
  const total = votesN1 + votesF4;
  if (total === 0) return { n1: POINTS_PUBLIC / 2, f4: POINTS_PUBLIC / 2 };
  const n1 = Math.round((votesN1 / total) * POINTS_PUBLIC);
  return { n1, f4: POINTS_PUBLIC - n1 };
}

/** Total d une manche pour un crew, sur 140 : trois jures, le public, moins les penalites. */
export function totalManche(
  scoresValides: number[][],
  pointsDuPublic: number,
  penalite = 0
): number {
  const jury = scoresValides.reduce((sum, s) => sum + totalJure(s), 0);
  return Math.max(0, jury + pointsDuPublic - penalite);
}

/** Libelle du niveau correspondant a une note, repris de la grille papier. */
export function niveauNote(note: number): string {
  if (note <= 2) return "Insuffisant";
  if (note <= 4) return "Fragile";
  if (note <= 6) return "Correct";
  if (note <= 8) return "Solide";
  return "Exceptionnel";
}

/** Temps restant avant la fermeture du vote, en secondes. */
export function secondesRestantes(closesAt: string | null): number | null {
  if (!closesAt) return null;
  return Math.max(0, Math.floor((new Date(closesAt).getTime() - Date.now()) / 1000));
}

export const formatChrono = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
