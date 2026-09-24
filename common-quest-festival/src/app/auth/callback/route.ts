import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Point d arrivee des liens de confirmation d email et de reinitialisation.
 *
 * Deux chemins sont acceptes, dans cet ordre :
 *
 * 1. token_hash : le lien porte un jeton a usage unique verifie cote serveur.
 *    Fonctionne meme si le mail est ouvert sur un AUTRE appareil que celui de
 *    l inscription. C est le chemin a privilegier dans les gabarits d email.
 *
 * 2. code : echange PKCE classique. Il exige que le navigateur possede la clé
 *    de verification creee au moment de l inscription. Ouvrir le mail sur un
 *    autre appareil fait donc echouer l echange, et l utilisateur se retrouve
 *    a devoir saisir ses identifiants. On le garde en repli.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/fr/compte";

  // On n accepte que des chemins internes : evite les redirections ouvertes.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/fr";

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }

  return NextResponse.redirect(`${origin}/fr/connexion?erreur=lien`);
}
