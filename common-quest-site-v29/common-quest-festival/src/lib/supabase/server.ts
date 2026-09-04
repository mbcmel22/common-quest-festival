import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Client Supabase cote serveur (composants serveur, route handlers). */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as never));
          } catch {
            // Appele depuis un composant serveur : la session est rafraichie par le middleware.
          }
        }
      }
    }
  );
}
