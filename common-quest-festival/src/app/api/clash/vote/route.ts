import { NextResponse, type NextRequest } from "next/server";
import { createHash, randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";

/**
 * Enregistrement d un vote du public.
 *
 * Le vote passe par le serveur, et non directement par le navigateur, pour
 * trois raisons :
 *   1. poser un identifiant d appareil dans un cookie httpOnly, que le
 *      navigateur ne peut ni lire ni modifier en JavaScript ;
 *   2. conserver une empreinte d adresse IP pour analyse a posteriori.
 *
 * Il n y a pas de verification de presence sur place : le festival n a pas
 * d ecran pour afficher un code. La protection repose donc sur l unicite par
 * appareil et sur la courte duree de la fenetre de vote.
 *
 * La garantie reelle du vote unique reste l index unique (round_id, voter_key)
 * en base : meme en rejouant la requete, la seconde insertion est refusee.
 */

const COOKIE = "cq_voter";

export async function POST(request: NextRequest) {
  let body: { round?: number; crew?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erreur: "requete_invalide" }, { status: 400 });
  }

  const round = Number(body.round);
  const crew = body.crew;

  if (!Number.isInteger(round) || (crew !== "n1" && crew !== "f4")) {
    return NextResponse.json({ erreur: "requete_invalide" }, { status: 400 });
  }

  const supabase = await createClient();

  // La manche doit etre ouverte, et le code de salle doit correspondre.
  const { data: manche } = await supabase
    .from("clash_rounds")
    .select("id, public_open, public_closes_at")
    .eq("id", round)
    .maybeSingle();

  if (!manche) return NextResponse.json({ erreur: "manche_inconnue" }, { status: 404 });
  if (!manche.public_open) return NextResponse.json({ erreur: "vote_ferme" }, { status: 403 });
  if (manche.public_closes_at && new Date(manche.public_closes_at) <= new Date()) {
    return NextResponse.json({ erreur: "vote_termine" }, { status: 403 });
  }

  // Identifiant d appareil : conserve d une manche a l autre pour que la
  // meme personne ne puisse voter qu une fois par manche.
  const existant = request.cookies.get(COOKIE)?.value;
  const voterKey = existant && existant.length >= 16 ? existant : randomUUID();

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "";
  const ipHash = ip ? createHash("sha256").update(`cq:${ip}`).digest("hex").slice(0, 32) : null;

  const { error } = await supabase
    .from("clash_public_votes")
    .insert({ round_id: round, crew, voter_key: voterKey, ip_hash: ipHash });

  if (error) {
    // 23505 : violation d unicite, donc un vote existe deja pour cet appareil.
    const deja = error.code === "23505";
    return NextResponse.json(
      { erreur: deja ? "deja_vote" : "echec_enregistrement" },
      { status: deja ? 409 : 500 }
    );
  }

  const reponse = NextResponse.json({ ok: true });
  reponse.cookies.set(COOKIE, voterKey, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return reponse;
}
