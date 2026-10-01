"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CREWS, formatChrono, pointsPublic, secondesRestantes, totalJure, totalManche,
  type ClashRound, type ClashScore
} from "@/lib/clash";

type Totaux = Record<number, { votes_n1: number; votes_f4: number }>;
type Juror = { id: string; name: string; code: string; is_admin: boolean };

/**
 * Regie du clash. Trois zones :
 *   1. les jures : nom et code d acces, modifiables ;
 *   2. chaque manche : notation, vote du public, suivi jure par jure ;
 *   3. le total general.
 * Les donnees se rafraichissent toutes les 3 secondes.
 */
export default function ClashAdmin() {
  const supabase = useMemo(() => createClient(), []);
  const [rounds, setRounds] = useState<ClashRound[]>([]);
  const [scores, setScores] = useState<ClashScore[]>([]);
  const [jurors, setJurors] = useState<Juror[]>([]);
  const [totaux, setTotaux] = useState<Totaux>({});
  const [minutes, setMinutes] = useState(3);
  const [tick, setTick] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const charger = useCallback(async () => {
    const [{ data: r }, { data: s }, { data: j }] = await Promise.all([
      supabase.from("clash_rounds").select("*").order("id"),
      supabase.from("clash_scores").select("*"),
      supabase.from("clash_jurors").select("id,name,code,is_admin").order("is_admin").order("name")
    ]);
    if (r) setRounds(r as ClashRound[]);
    if (s) setScores(s as ClashScore[]);
    if (j) setJurors(j as Juror[]);
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

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Le compte de test ne compte jamais dans les resultats.
  const idsAdmin = useMemo(() => new Set(jurors.filter((j) => j.is_admin).map((j) => j.id)), [jurors]);
  const officielles = (roundId: number) =>
    scores.filter((s) => s.round_id === roundId && s.validated && !idsAdmin.has(s.juror_id));

  async function majManche(id: number, valeurs: Partial<ClashRound>) {
    const { error } = await supabase.from("clash_rounds").update(valeurs).eq("id", id);
    setMessage(error ? "Modification refusée." : null);
    charger();
  }

  const ouvrirVote = (id: number) =>
    majManche(id, { public_open: true, public_closes_at: new Date(Date.now() + minutes * 60_000).toISOString() });

  async function deverrouillerJure(roundId: number, juror: Juror) {
    if (!window.confirm(`Rouvrir la manche ${roundId} pour ${juror.name} ? Ses notes sont conservées, il pourra les corriger puis revalider.`)) return;
    await supabase.from("clash_scores").update({ validated: false }).eq("round_id", roundId).eq("juror_id", juror.id);
    charger();
  }

  async function effacerJure(roundId: number, juror: Juror) {
    if (!window.confirm(`Effacer toutes les notes de ${juror.name} pour la manche ${roundId} ? Il repartira de zéro.`)) return;
    await supabase.from("clash_scores").delete().eq("round_id", roundId).eq("juror_id", juror.id);
    charger();
  }

  async function effacerVotes(id: number) {
    if (!window.confirm("Effacer tous les votes du public de cette manche ? Action irréversible.")) return;
    await supabase.from("clash_public_votes").delete().eq("round_id", id);
    charger();
  }

  const officiels = jurors.filter((j) => !j.is_admin);

  return (
    <div className="space-y-6">
      {message && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>}

      <GestionJures jurors={jurors} onChange={charger} />

      <div className="rounded-2xl border border-ink/12 bg-white p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50">Adresse du vote, à diffuser au public</p>
        <p className="mt-1 font-mono text-lg text-ink">common-quest.fr/fr/clash</p>
        <p className="mt-2 text-sm text-ink/60">
          Adresse des jurés : <span className="font-mono">common-quest.fr/fr/clash/jury</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/12 bg-white p-4">
        <label className="label mb-0" htmlFor="duree">Durée du vote</label>
        <input id="duree" type="number" min={1} max={15} value={minutes}
               onChange={(e) => setMinutes(Number(e.target.value))} className="field-light w-20" />
        <span className="text-sm text-ink/60">minutes</span>
      </div>

      {rounds.map((r) => {
        const v = totaux[r.id] ?? { votes_n1: 0, votes_f4: 0 };
        const pub = pointsPublic(v.votes_n1, v.votes_f4);
        const valides = officielles(r.id);
        const restant = secondesRestantes(r.public_closes_at);
        const enCours = r.public_open && (restant === null || restant > 0);

        return (
          <div key={r.id} className="rounded-2xl border border-ink/12 bg-white p-5" data-tick={tick}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="display-m">Manche {r.id} : {r.label}</h2>
              {enCours && restant !== null && (
                <span className="rounded-full bg-ink px-4 py-2 font-mono text-lg text-acid">{formatChrono(restant)}</span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => majManche(r.id, { jury_open: !r.jury_open })}
                className={`min-h-11 rounded-full px-5 font-mono text-[11px] uppercase tracking-[0.12em] ${
                  r.jury_open ? "bg-ink text-paper" : "border border-ink/20 text-ink/70"
                }`}
              >
                Notation jury {r.jury_open ? "ouverte" : "fermée"}
              </button>
              {!enCours ? (
                <button onClick={() => ouvrirVote(r.id)} className="btn-ink btn-sm min-h-11">Ouvrir le vote ({minutes} min)</button>
              ) : (
                <button onClick={() => majManche(r.id, { public_open: false })}
                        className="min-h-11 rounded-full bg-red-600 px-5 font-mono text-[11px] uppercase tracking-[0.12em] text-white">
                  Clôturer le vote
                </button>
              )}
              <button onClick={() => effacerVotes(r.id)} className="btn-ghost btn-sm min-h-11 !text-red-600">Effacer les votes</button>
            </div>

            {/* Suivi jure par jure : c est ici qu on corrige une erreur de saisie. */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-ink/15 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
                    <th className="py-2 pr-3">Juré</th>
                    <th className="py-2 pr-3">N+1</th>
                    <th className="py-2 pr-3">4FEYDER</th>
                    <th className="py-2 pr-3">État</th>
                    <th className="py-2 text-right">Correction</th>
                  </tr>
                </thead>
                <tbody>
                  {jurors.map((j) => {
                    const s = scores.find((x) => x.round_id === r.id && x.juror_id === j.id);
                    const etat = !s ? "Pas commencé" : s.validated ? "Validé" : "Brouillon";
                    return (
                      <tr key={j.id} className={`border-b border-ink/10 ${j.is_admin ? "text-ink/45" : ""}`}>
                        <td className="py-2.5 pr-3 font-medium">
                          {j.name}
                          {j.is_admin && <span className="ml-2 text-[10px] uppercase tracking-wide">test, hors total</span>}
                        </td>
                        <td className="py-2.5 pr-3 font-mono">{s ? `${totalJure(s.scores_n1)} / 40` : "–"}</td>
                        <td className="py-2.5 pr-3 font-mono">{s ? `${totalJure(s.scores_f4)} / 40` : "–"}</td>
                        <td className="py-2.5 pr-3">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            etat === "Validé" ? "bg-ink text-acid" : etat === "Brouillon" ? "bg-ink/10 text-ink" : "text-ink/40"
                          }`}>{etat}</span>
                        </td>
                        <td className="py-2.5 text-right">
                          {s?.validated && (
                            <button onClick={() => deverrouillerJure(r.id, j)}
                                    className="mr-3 font-mono text-[11px] uppercase tracking-[0.1em] text-violet hover:underline">
                              Déverrouiller
                            </button>
                          )}
                          {s && (
                            <button onClick={() => effacerJure(r.id, j)}
                                    className="font-mono text-[11px] uppercase tracking-[0.1em] text-red-600 hover:underline">
                              Effacer
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {CREWS.map((c) => {
                const votes = c.key === "n1" ? v.votes_n1 : v.votes_f4;
                const ptsPub = c.key === "n1" ? pub.n1 : pub.f4;
                const total = totalManche(valides.map((s) => (c.key === "n1" ? s.scores_n1 : s.scores_f4)), ptsPub);
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
              {valides.length} juré{valides.length > 1 ? "s" : ""} sur {officiels.length} ont validé
            </p>
          </div>
        );
      })}

      <div className="rounded-2xl border-2 border-ink p-5">
        <h2 className="display-m">Total général</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CREWS.map((c) => {
            const total = rounds.reduce((sum, r) => {
              const v = totaux[r.id] ?? { votes_n1: 0, votes_f4: 0 };
              const pub = pointsPublic(v.votes_n1, v.votes_f4);
              return sum + totalManche(
                officielles(r.id).map((s) => (c.key === "n1" ? s.scores_n1 : s.scores_f4)),
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

/** Noms et codes des jures, modifiables sans passer par Supabase. */
function GestionJures({ jurors, onChange }: { jurors: Juror[]; onChange: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [brouillons, setBrouillons] = useState<Record<string, { name: string; code: string }>>({});
  const [etat, setEtat] = useState<Record<string, string>>({});

  // Les champs gardent la saisie en cours : le rafraichissement automatique
  // ne doit pas effacer ce que l organisateur est en train de taper.
  const valeur = (j: Juror) => brouillons[j.id] ?? { name: j.name, code: j.code };

  async function enregistrer(j: Juror) {
    const v = valeur(j);
    const name = v.name.trim();
    const code = v.code.trim().toUpperCase();
    if (!name) return setEtat((e) => ({ ...e, [j.id]: "Le nom est obligatoire." }));
    if (code.length < 4) return setEtat((e) => ({ ...e, [j.id]: "Le code doit faire au moins 4 caractères." }));
    const { error } = await supabase.from("clash_jurors").update({ name, code }).eq("id", j.id);
    if (error) {
      const doublon = error.code === "23505";
      return setEtat((e) => ({ ...e, [j.id]: doublon ? "Ce code est déjà utilisé." : "Enregistrement refusé." }));
    }
    setBrouillons((b) => { const n = { ...b }; delete n[j.id]; return n; });
    setEtat((e) => ({ ...e, [j.id]: "Enregistré." }));
    onChange();
  }

  return (
    <div className="rounded-2xl border border-ink/12 bg-white p-5">
      <h2 className="display-m">Jurés et codes d’accès</h2>
      <p className="mt-2 text-sm text-ink/60">
        Le nom s’affiche en haut de l’écran du juré dès qu’il se connecte : s’il voit un autre nom que le sien,
        il s’est trompé de code. Transmettez chaque code séparément, jamais dans un document commun.
      </p>
      <div className="mt-4 space-y-3">
        {jurors.map((j) => {
          const v = valeur(j);
          const modifie = v.name !== j.name || v.code.toUpperCase() !== j.code;
          return (
            <div key={j.id} className="grid gap-2 rounded-xl border border-ink/10 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
              <input
                className="field-light" value={v.name} aria-label="Nom du juré"
                onChange={(e) => setBrouillons((b) => ({ ...b, [j.id]: { ...v, name: e.target.value } }))}
              />
              <input
                className="field-light font-mono uppercase" value={v.code} aria-label="Code d’accès"
                onChange={(e) => setBrouillons((b) => ({ ...b, [j.id]: { ...v, code: e.target.value.toUpperCase() } }))}
              />
              <button onClick={() => enregistrer(j)} disabled={!modifie}
                      className="btn-ink btn-sm min-h-11 disabled:opacity-30">
                Enregistrer
              </button>
              <p className="text-[12px] text-ink/50 sm:col-span-3">
                {j.is_admin ? "Compte de test : ignore les verrous, ses notes ne comptent jamais. " : ""}
                {etat[j.id] ?? ""}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
