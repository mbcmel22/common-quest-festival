"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CREWS, formatChrono, pointsPublic, secondesRestantes, totalManche,
  type ClashRound, type ClashScore
} from "@/lib/clash";

type Totaux = Record<number, { votes_n1: number; votes_f4: number }>;

/**
 * Regie du clash. Un seul ecran, utilisable d une main pendant le show :
 * ouvrir la notation, ouvrir le vote avec un minuteur, afficher le code de
 * salle, cloturer. Les resultats se mettent a jour toutes les 3 secondes.
 */
export default function ClashAdmin() {
  const supabase = useMemo(() => createClient(), []);
  const [rounds, setRounds] = useState<ClashRound[]>([]);
  const [scores, setScores] = useState<ClashScore[]>([]);
  const [totaux, setTotaux] = useState<Totaux>({});
  const [minutes, setMinutes] = useState(3);
  const [tick, setTick] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const charger = useCallback(async () => {
    const { data: r } = await supabase.from("clash_rounds").select("*").order("id");
    if (r) setRounds(r as ClashRound[]);
    const { data: s } = await supabase.from("clash_scores").select("*");
    if (s) setScores(s as ClashScore[]);
    const t: Totaux = {};
    for (const m of (r ?? []) as ClashRound[]) {
      const { data } = await supabase.rpc("clash_public_totals", { p_round: m.id });
      const l = Array.isArray(data) ? data[0] : data;
      t[m.id] = { votes_n1: l?.votes_n1 ?? 0, votes_f4: l?.votes_f4 ?? 0 };
    }
    setTotaux(t);
  }, [supabase]);

  useEffect(() => {
    charger();
    const t = setInterval(charger, 3000);
    return () => clearInterval(t);
  }, [charger]);

  // Horloge locale, pour que le decompte avance sans requete reseau.
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  async function maj(id: number, valeurs: Partial<ClashRound>) {
    const { error } = await supabase.from("clash_rounds").update(valeurs).eq("id", id);
    setMessage(error ? "Modification refusée." : null);
    charger();
  }

  const ouvrirVote = (id: number) =>
    maj(id, {
      public_open: true,
      public_closes_at: new Date(Date.now() + minutes * 60_000).toISOString()
    });

  async function reouvrirNotation(id: number) {
    if (!window.confirm("Déverrouiller les notes de tous les jurés pour cette manche ?")) return;
    await supabase.from("clash_scores").update({ validated: false }).eq("round_id", id);
    charger();
  }

  async function effacerVotes(id: number) {
    if (!window.confirm("Effacer tous les votes du public de cette manche ? Action irréversible.")) return;
    await supabase.from("clash_public_votes").delete().eq("round_id", id);
    charger();
  }

  return (
    <div className="space-y-6">
      {message && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>}

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/12 bg-white p-4">
        <label className="label mb-0" htmlFor="duree">Durée du vote</label>
        <input
          id="duree"
          type="number"
          min={1}
          max={15}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="field-light w-20"
        />
        <span className="text-sm text-ink/60">minutes</span>
      </div>

      <div className="rounded-2xl border border-ink/12 bg-white p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50">
          Adresse du vote, à diffuser au public
        </p>
        <p className="mt-1 font-mono text-lg text-ink">common-quest.fr/fr/clash</p>
        <p className="mt-2 text-sm text-ink/60">
          À annoncer au micro ou à imprimer en QR code. La page attend d’elle-même l’ouverture
          du vote, le public peut donc la garder ouverte dès le début de la soirée.
        </p>
      </div>

      {rounds.map((r) => {
        const v = totaux[r.id] ?? { votes_n1: 0, votes_f4: 0 };
        const pub = pointsPublic(v.votes_n1, v.votes_f4);
        const valides = scores.filter((s) => s.round_id === r.id && s.validated);
        const restant = secondesRestantes(r.public_closes_at);
        const enCours = r.public_open && (restant === null || restant > 0);

        return (
          <div key={r.id} className="rounded-2xl border border-ink/12 bg-white p-5" data-tick={tick}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="display-m">Manche {r.id} : {r.label}</h2>
              {enCours && restant !== null && (
                <span className="rounded-full bg-ink px-4 py-2 font-mono text-lg text-acid">
                  {formatChrono(restant)}
                </span>
              )}
            </div>

            {/* Commandes */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => maj(r.id, { jury_open: !r.jury_open })}
                className={`min-h-11 rounded-full px-5 font-mono text-[11px] uppercase tracking-[0.12em] ${
                  r.jury_open ? "bg-ink text-paper" : "border border-ink/20 text-ink/70"
                }`}
              >
                Notation jury {r.jury_open ? "ouverte" : "fermée"}
              </button>

              {!enCours ? (
                <button onClick={() => ouvrirVote(r.id)} className="btn-ink btn-sm min-h-11">
                  Ouvrir le vote ({minutes} min)
                </button>
              ) : (
                <button
                  onClick={() => maj(r.id, { public_open: false })}
                  className="min-h-11 rounded-full bg-red-600 px-5 font-mono text-[11px] uppercase tracking-[0.12em] text-white"
                >
                  Clôturer le vote
                </button>
              )}

              <button onClick={() => reouvrirNotation(r.id)} className="btn-ghost btn-sm min-h-11 !text-ink">
                Déverrouiller les jurés
              </button>
              <button onClick={() => effacerVotes(r.id)} className="btn-ghost btn-sm min-h-11 !text-red-600">
                Effacer les votes
              </button>
            </div>

            {/* Resultats en direct */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {CREWS.map((c) => {
                const votes = c.key === "n1" ? v.votes_n1 : v.votes_f4;
                const ptsPub = c.key === "n1" ? pub.n1 : pub.f4;
                const total = totalManche(
                  valides.map((s) => (c.key === "n1" ? s.scores_n1 : s.scores_f4)),
                  ptsPub
                );
                return (
                  <div key={c.key} className="rounded-xl border border-ink/12 p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50">{c.name}</p>
                    <p className="mt-1 font-display text-4xl">{total}<span className="text-xl text-ink/40"> / 140</span></p>
                    <p className="mt-2 text-sm text-ink/60">
                      {votes} vote{votes > 1 ? "s" : ""} du public, soit {ptsPub} point{ptsPub > 1 ? "s" : ""}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/40">
              {valides.length} note{valides.length > 1 ? "s" : ""} de jury validée{valides.length > 1 ? "s" : ""}
            </p>
          </div>
        );
      })}

      {/* Total general */}
      <div className="rounded-2xl border-2 border-ink p-5">
        <h2 className="display-m">Total général</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CREWS.map((c) => {
            const total = rounds.reduce((sum, r) => {
              const v = totaux[r.id] ?? { votes_n1: 0, votes_f4: 0 };
              const pub = pointsPublic(v.votes_n1, v.votes_f4);
              const valides = scores.filter((s) => s.round_id === r.id && s.validated);
              return sum + totalManche(
                valides.map((s) => (c.key === "n1" ? s.scores_n1 : s.scores_f4)),
                c.key === "n1" ? pub.n1 : pub.f4
              );
            }, 0);
            return (
              <div key={c.key} className="rounded-xl bg-ink p-5 text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/50">{c.name}</p>
                <p className="mt-1 font-display text-6xl text-acid">{total}</p>
                <p className="text-sm text-paper/40">/ 420</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
