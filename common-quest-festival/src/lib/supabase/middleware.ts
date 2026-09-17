import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Rafraichit la session Supabase et renvoie l utilisateur courant. */
export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          // IMPORTANT : ne jamais forcer httpOnly ici. Ces cookies portent la session
          // Supabase, et le client cote navigateur (utilise par les formulaires du back
          // office pour ecrire directement dans Supabase) doit pouvoir les lire pour
          // s authentifier. Un cookie httpOnly est invisible en JavaScript : le serveur
          // voit toujours l utilisateur connecte, mais le navigateur envoie ses requetes
          // comme un visiteur anonyme, ce qui declenche un refus RLS a l ecriture.
          // On garde les seules options que Supabase lui-meme fournit, en n ajustant
          // que secure (nécessaire en HTTPS) sans jamais toucher a httpOnly.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...(options as Record<string, unknown>),
              secure: process.env.NODE_ENV === "production"
            })
          );
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { user, supabase };
}
