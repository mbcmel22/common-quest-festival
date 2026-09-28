"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CREWS, formatChrono, secondesRestantes, type ClashRound, type CrewKey } from "@/lib/clash";

/**
 * Vote du public, pense pour un telephone tenu a bout de bras dans une salle
 * sombre : deux cibles enormes, un seul code a saisir, aucun defilement.
 * L etat des manches est relu toutes les 5 secondes pour que l ouverture et
 * la fermeture decidees en regie apparaissent sans rechargement.
 */
export default function ClashPublicVote({ initial }: { initial: ClashRound[] }) {
  const [rounds, setRounds] = useState(initial);
  const [choix, setChoix] = useState<CrewKey | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [votees, setVotees] = useState<number[]>([]);
  const [restant, setRestant] = useState<number | null>(null);

  const active = rounds.find((r) => r.public_open) ?? null;

  // Les manches deja votees sont memorisees localement pour l affichage.
  // La garantie reelle est en base, ce stockage n est qu un confort.
  useEffect(() => {
    try {
      const brut = window.localStorage.getItem("cq_clash_votes");
      if (brut) setVotees(JSON.parse(brut));
    } catch {
      /* stockage indisponible : on continue sans */
    }
  }, []);

  const rafraichir = useCallback(async () => {
    const { data } = await createClient()
      .from("clash_rounds")
      .select("id,label,criteria,jury_open,public_open,public_closes_at,screen_code")
      .order("id");
    if (data) setRounds(data as ClashRound[]);
  }, []);

  useEffect(() => {
    const t = setInterval(rafraichir, 5000);
    return () => clearInterval(t);
  }, [rafraichir]);

  useEffect(() => {
    if (!active?.public_closes_at) return setRestant(null);
    const maj = () => setRestant(secondesRestantes(active.public_closes_at));
    maj();
    const t = setInterval(maj, 1000);
    return () => clearInterval(t);
  }, [active?.public_closes_at]);

  async function voter() {
    if (!active || !choix) return;
    setEnvoi(true);
    setMessage(null);
    try {
      const r = await fetch("/api/clash/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round: active.id, crew: choix })
      });
      const data = await r.json();
      if (r.ok) {
        const suite = [...votees, active.id];
        setVotees(suite);
        try {
          window.localStorage.setItem("cq_clash_votes", JSON.stringify(suite));
        } catch {
          /* sans stockage, l affichage se basera sur la reponse du serveur */
        }
      } else {
        const libelles: Record<string, string> = {
          deja_vote: "Vous avez déjà voté pour cette manche.",
          vote_ferme: "Le vote n’est pas ouvert.",
          vote_termine: "Le temps de vote est écoulé.",
          requete_invalide: "Sélectionnez un crew avant de valider."
        };
        if (data.erreur === "deja_vote") {
          const suite = [...votees, active.id];
          setVotees(suite);
        }
        setMessage(libelles[data.erreur] ?? "Le vote n’a pas pu être enregistré.");
      }
    } catch {
      setMessage("Connexion interrompue. Réessayez.");
    } finally {
      setEnvoi(false);
    }
  }

  if (!active) {
    return (
      <div className="rounded-2xl border border-white/12 bg-ink-soft p-8 text-center">
        <p className="font-display text-3xl uppercase text-paper">Le vote n’est pas ouvert</p>
        <p className="mt-3 text-paper/70">
          Gardez cette page ouverte. Elle s’activera toute seule au moment du vote.
        </p>
      </div>
    );
  }

  const dejaVote = votees.includes(active.id);

  if (dejaVote) {
    return (
      <div className="rounded-2xl border-2 border-acid bg-ink-soft p-8 text-center">
        <p className="font-display text-4xl uppercase text-acid">Vote enregistré</p>
        <p className="mt-3 text-paper/80">
          Merci. Laissez cette page ouverte pour la manche suivante.
        </p>
        {restant !== null && restant > 0 && (
          <p className="mt-6 font-mono text-sm uppercase tracking-[0.2em] text-paper/50">
            Fin du vote dans {formatChrono(restant)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow text-acid">Manche {active.id}</p>
        {restant !== null && (
          <p className="font-mono text-sm uppercase tracking-[0.18em] text-paper/60">
            {restant > 0 ? formatChrono(restant) : "Terminé"}
          </p>
        )}
      </div>
      <h2 className="display-l mt-2">{active.label}</h2>
      <p className="mt-3 text-paper/70">Qui vous a le plus convaincu ?</p>

      {/* Cibles volontairement enormes : on vote debout, dans le noir. */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {CREWS.map((c) => {
          const on = choix === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setChoix(c.key)}
              aria-pressed={on}
              className={`min-h-[132px] rounded-2xl border-2 font-display text-4xl uppercase transition-colors ${
                on ? "border-acid bg-acid text-ink" : "border-white/20 bg-ink-soft text-paper hover:border-white/50"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {message && (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-center text-sm text-red-200">
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={voter}
        disabled={!choix || envoi || restant === 0}
        className="btn-acid mt-6 flex min-h-14 w-full items-center justify-center text-lg disabled:opacity-40"
      >
        {envoi ? "Envoi…" : "Valider mon vote"}
      </button>

      <p className="mt-5 text-center text-xs leading-relaxed text-paper/45">
        Un seul vote par appareil et par manche.
      </p>
    </div>
  );
}
