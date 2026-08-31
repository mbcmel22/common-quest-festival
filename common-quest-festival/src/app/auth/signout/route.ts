import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { locales, defaultLocale } from "@/i18n";

/**
 * Deconnexion cote serveur.
 * Les cookies de session sont en httpOnly : seul le serveur peut les effacer.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const asked = String(formData?.get("locale") ?? "");
  const locale = (locales as readonly string[]).includes(asked) ? asked : defaultLocale;

  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL(`/${locale}`, request.url), { status: 303 });
}
