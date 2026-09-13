import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Point d arrivee des liens de confirmation d email et de réinitialisation. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/fr/compte";

  // On n accepte que des chemins internes : evite les redirections ouvertes.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/fr";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }
  return NextResponse.redirect(`${origin}/fr/connexion?erreur=lien`);
}
