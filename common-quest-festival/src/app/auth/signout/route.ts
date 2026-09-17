import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { locales, defaultLocale } from "@/i18n";

/**
 * Deconnexion cote serveur : signOut() invalide la session aupres de Supabase
 * et efface les cookies. On la fait passer par le serveur (et non par le client
 * dans le composant) pour garantir la suppression meme si le navigateur a une
 * session incoherente.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const asked = String(formData?.get("locale") ?? "");
  const locale = (locales as readonly string[]).includes(asked) ? asked : defaultLocale;

  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL(`/${locale}`, request.url), { status: 303 });
}
