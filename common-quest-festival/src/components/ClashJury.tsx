"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CREWS, niveauNote, pointsPublic, totalJure, totalManche,
  type ClashRound, type ClashScore
} from "@/lib/clash";

type Juror = { juror_id: string; juror_name: string; is_admin: boolean };

/**
 * Notation du jury.
 * Authentification par code seul : un jure n a pas de compte Supabase, il
 * saisit sur son telephone entre deux passages. Le code est verifie par une
 * fonction serveur, la table des jures n etant jamais lisible publiquement.
 */
export default function ClashJury({ initial }: { initial: ClashRound[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [rounds, setRounds] = useState(initial);
  const [code, setCode] = useState("");
  const [juror, setJuror] = useState<Juror | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [rid, setRid] = useState(1);
  const [n1, setN1] = useState([0, 0, 0, 0]);
  const [f4, setF4] = useState([0, 0, 0, 0]);
  const [verrouille, setVerrouille] = useState(false);
  const [etat, setEtat] = useState<{ total_jures: number; valides: number } | null>(null);
  const [resultats, setResultats] = useState<{ scores: ClashScore[]; publicTotals: Record<number, { n1: number; f4: number }> } | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const manche = rounds.find((r) => r.id === rid) ?? rounds[0];

  async function connexion() {
    setErreur(null);
    const { data, error } = await supabase.rpc("clash_login", { p_code: code });
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) return setErreur("Code non reconnu.");
    setJuror(row as Juror);
    try {
      window.sessionStorage.setItem("cq_jury_code", code);
    } catch {
      /* sans stockage, il faudra ressaisir le code en cas de rechargement */
    }
  }

  useEffect(() => {
    try {
      const memo = window.sessionStorage.getItem("cq_jury_code");
      if (memo) setCode(memo);
    } catch {
      /* rien a restaurer */
    }
  }, []);

  // Charge les notes deja saisies pour la manche selectionnee.
  const chargerNotes = useCallback(async () => {
    if (!juror) return;
    const { data } = await supabase
      .from("clash_scores")
      .select("round_id,juror_id,scores_n1,scores_f4,validated")
      .eq("round_id", rid)
      .eq("juror_id", juror.juror_id)
      .maybeSingle();
    if (data) {
      setN1(data.scores_n1 ?? [0, 0, 0, 0]);
      setF4(data.scores_f4 ?? [0, 0, 0, 0]);
      setVerrouille(data.validated && !juror.is_admin);
    } else {
      setN1([0, 0, 0, 0]);
      setF4([0, 0, 0, 0]);
      setVerrouille(false);
    }
    const { data: st } = await supabase.rpc("clash_jury_state", { p_round: rid });
    const ligne = Array.isArray(st) ? st[0] : st;
    if (ligne) setEtat(ligne);
  }, [juror, rid, supabase]);

  useEffect(() => {
    chargerNotes();
  }, [chargerNotes]);

  // Rafraichit l etat des manches et l avancement des autres jures.
  useEffect(() => {
    if (!juror) return;
    const t = setInterval(async () => {
      const { data } = await supabase.from("clash_rounds").select("*").order("id");
      if (data) setRounds(data as ClashRound[]);
      const { data: st } = await supabase.rpc("clash_jury_state", { p_round: rid });
      const ligne = Array.isArray(st) ? st[0] : st;
      if (ligne) setEtat(ligne);
    }, 6000);
    return () => clearInterval(t);
  }, [juror, rid, supabase]);

  async function enregistrer(valider: boolean) {
    if (!juror) return;
    if (valider && !window.confirm("Valider définitivement cette manche ? Vous ne pourrez plus modifier vos notes.")) return;
    setEnvoi(true);
    setInfo(null);
    const { data, error } = await supabase.rpc("clash_save_scores", {
      p_code: code, p_round: rid, p_n1: n1, p_f4: f4, p_validate: valider
    });
    setEnvoi(false);
    if (error) return setInfo("Enregistrement impossible.");
    const libelles: Record<string, string> = {
      ok: valider ? "Manche validée." : "Brouillon enregistré.",
      manche_fermee: "Cette manche n’est pas ouverte à la notation.",
      deja_valide: "Cette manche est déjà validée.",
      note_hors_echelle: "Les notes doivent être comprises entre 0 et 10.",
      code_invalide: "Code non reconnu."
    };
    setInfo(libelles[data as string] ?? "Réponse inattendue.");
    if (data === "ok") chargerNotes();
  }

  async function voirResultats() {
    const { data: scores } = await supabase.from("clash_scores").select("*");
    const totals: Record<number, { n1: number; f4: number }> = {};
    for (const r of rounds) {
      const { data } = await supabase.rpc("clash_public_totals", { p_round: r.id });
      const l = Array.isArray(data) ? data[0] : data;
      totals[r.id] = pointsPublic(l?.votes_n1 ?? 0, l?.votes_f4 ?? 0);
    }
    setResultats({ scores: (scores ?? []) as ClashScore[], publicTotals: totals });
  }

  // ----- Ecran de connexion -----
  if (!juror) {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="display-l">Notation du jury</h1>
        <p className="mt-3 text-paper/70">Saisissez le code qui vous a été remis.</p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="JURY-001"
          autoComplete="off"
          className="field mt-6 w-full text-center font-display text-2xl tracking-[0.2em]"
        />
        {erreur && <p className="mt-3 text-sm text-red-300">{erreur}</p>}
        <button onClick={connexion} className="btn-acid mt-5 flex min-h-12 w-full items-center justify-center">
          Entrer
        </button>
      </div>
    );
  }

  const toutValide = etat && etat.valides >= etat.total_jures && etat.total_jures > 0;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow text-acid">{juror.juror_name}</p>
          <h1 className="display-l mt-1">Notation</h1>
        </div>
        {juror.is_admin && (
          <span className="tag border-violet bg-violet text-paper">Mode test</span>
        )}
      </div>

      {/* Choix de la manche */}
      <div className="mt-6 flex flex-wrap gap-2">
        {rounds.map((r) => (
          <button
            key={r.id}
            onClick={() => setRid(r.id)}
            className={`min-h-11 rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
              r.id === rid ? "border-acid bg-acid text-ink" : "border-white/20 text-paper/70 hover:border-white/50"
            }`}
          >
            Manche {r.id}
            {!r.jury_open && <span className="ml-2 opacity-60">fermée</span>}
          </button>
        ))}
      </div>

      <h2 className="display-m mt-7">{manche.label}</h2>

      {verrouille && (
        <p className="mt-4 rounded-xl border border-acid/40 bg-acid/10 p-3 text-sm text-acid">
          Manche validée. Vos notes ne sont plus modifiables.
        </p>
      )}
      {!manche.jury_open && !juror.is_admin && (
        <p className="mt-4 rounded-xl border border-white/20 bg-white/5 p-3 text-sm text-paper/70">
          La notation de cette manche n’est pas encore ouverte.
        </p>
      )}

      {/* Criteres */}
      <div className="mt-6 space-y-6">
        {manche.criteria.map((critere, i) => (
          <div key={i} className="rounded-2xl border border-white/12 bg-ink-soft p-4 sm:p-5">
            <p className="font-display text-lg uppercase leading-tight text-paper">{critere}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {CREWS.map((c) => {
                const valeurs = c.key === "n1" ? n1 : f4;
                const set = c.key === "n1" ? setN1 : setF4;
                return (
                  <div key={c.key}>
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/60">
                        {c.name}
                      </span>
                      <span className="font-display text-2xl text-acid">{valeurs[i]}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={valeurs[i]}
                      disabled={verrouille}
                      onChange={(e) => {
                        const copie = [...valeurs];
                        copie[i] = Number(e.target.value);
                        set(copie);
                      }}
                      className="mt-2 h-11 w-full accent-[#e7ff36] disabled:opacity-40"
                      aria-label={`${critere}, ${c.name}`}
                    />
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-paper/40">
                      {niveauNote(valeurs[i])}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Totaux, mis a jour en direct */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {CREWS.map((c) => (
          <div key={c.key} className="rounded-2xl border-2 border-acid/40 bg-ink-soft p-5 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/60">{c.name}</p>
            <p className="mt-1 font-display text-5xl text-acid">
              {totalJure(c.key === "n1" ? n1 : f4)}
              <span className="text-2xl text-paper/40"> / 40</span>
            </p>
          </div>
        ))}
      </div>

      {info && <p className="mt-4 text-center text-sm text-paper/80">{info}</p>}

      {!verrouille && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => enregistrer(false)}
            disabled={envoi}
            className="btn-ghost flex min-h-12 flex-1 items-center justify-center disabled:opacity-40"
          >
            Enregistrer sans valider
          </button>
          <button
            onClick={() => enregistrer(true)}
            disabled={envoi}
            className="btn-acid flex min-h-12 flex-1 items-center justify-center disabled:opacity-40"
          >
            Valider la manche
          </button>
        </div>
      )}

      {/* Avancement des autres jures */}
      {etat && (
        <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-paper/50">
          {etat.valides} juré{etat.valides > 1 ? "s" : ""} sur {etat.total_jures} ont validé cette manche
        </p>
      )}

      {/* Resultats, une fois que tout le monde a valide */}
      {(toutValide || juror.is_admin) && (
        <div className="mt-8">
          <button onClick={voirResultats} className="btn-ghost flex min-h-12 w-full items-center justify-center">
            Voir le classement général
          </button>
        </div>
      )}

      {resultats && <Classement rounds={rounds} {...resultats} />}
    </div>
  );
}

/** Recapitulatif des trois manches, sur 420 points. */
function Classement({
  rounds, scores, publicTotals
}: {
  rounds: ClashRound[];
  scores: ClashScore[];
  publicTotals: Record<number, { n1: number; f4: number }>;
}) {
  const parManche = rounds.map((r) => {
    const valides = scores.filter((s) => s.round_id === r.id && s.validated);
    const pub = publicTotals[r.id] ?? { n1: 10, f4: 10 };
    return {
      id: r.id,
      label: r.label,
      n1: totalManche(valides.map((s) => s.scores_n1), pub.n1),
      f4: totalManche(valides.map((s) => s.scores_f4), pub.f4)
    };
  });
  const totalN1 = parManche.reduce((a, m) => a + m.n1, 0);
  const totalF4 = parManche.reduce((a, m) => a + m.f4, 0);

  return (
    <div className="mt-6 rounded-2xl border border-white/12 bg-ink-soft p-5">
      <h3 className="display-m">Classement</h3>
      <div className="mt-4 space-y-3">
        {parManche.map((m) => (
          <div key={m.id} className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-sm text-paper/70">
              Manche {m.id} : {m.label}
            </span>
            <span className="font-mono text-sm text-paper">
              {m.n1} <span className="text-paper/40">/</span> {m.f4}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {[
          { nom: "N+1", total: totalN1 },
          { nom: "4FEYDER", total: totalF4 }
        ].map((c) => {
          const gagnant = c.total === Math.max(totalN1, totalF4) && totalN1 !== totalF4;
          return (
            <div
              key={c.nom}
              className={`rounded-xl border-2 p-4 text-center ${gagnant ? "border-acid bg-acid/10" : "border-white/15"}`}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/60">{c.nom}</p>
              <p className={`mt-1 font-display text-4xl ${gagnant ? "text-acid" : "text-paper"}`}>{c.total}</p>
              <p className="text-xs text-paper/40">/ 420</p>
            </div>
          );
        })}
      </div>
      {totalN1 === totalF4 && (
        <p className="mt-4 text-center text-sm text-acid">
          Égalité : la manche 3 départage, puis un passage supplémentaire d’une minute par crew.
        </p>
      )}
    </div>
  );
}
